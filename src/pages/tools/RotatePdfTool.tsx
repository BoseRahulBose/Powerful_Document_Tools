import React, { useState } from 'react';
import { RotateCw, RotateCcw, ArrowRight, RefreshCw, Undo } from 'lucide-react';
import { FileUploader } from '../../components/FileUploader';
import { FileCard } from '../../components/FileCard';
import { PageThumbnail } from '../../components/PageThumbnail';
import { ProcessingStatus } from '../../components/ProcessingStatus';
import { ResultCard } from '../../components/ResultCard';
import { UploadedFileItem, ProcessingResult } from '../../types';
import { rotatePdfPages, inspectPdfDocument } from '../../utils/pdfEngine';
import { saveHistoryRecord } from '../../utils/storage';
import { generateOutputFileName } from '../../utils/formatters';

interface RotatePdfToolProps {
  onViewHistory: () => void;
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const RotatePdfTool: React.FC<RotatePdfToolProps> = ({ onViewHistory, showToast }) => {
  const [fileItem, setFileItem] = useState<UploadedFileItem | null>(null);
  const [rotations, setRotations] = useState<{ [pageIndex: number]: number }>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [result, setResult] = useState<ProcessingResult | null>(null);

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    try {
      const info = await inspectPdfDocument(file);
      setFileItem({
        id: `file_${Date.now()}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        pageCount: info.pageCount,
        pages: info.pages,
      });
      setRotations({});
    } catch (e) {
      showToast('error', 'Could not parse PDF pages.');
    }
    setResult(null);
  };

  const handleRotatePage = (pageNum: number, delta: number) => {
    const pIdx = pageNum - 1;
    setRotations((prev) => ({
      ...prev,
      [pIdx]: ((prev[pIdx] || 0) + delta + 360) % 360,
    }));
  };

  const handleRotateAll = (delta: number) => {
    if (!fileItem || !fileItem.pageCount) return;
    setRotations((prev) => {
      const updated: { [p: number]: number } = {};
      for (let i = 0; i < fileItem.pageCount!; i++) {
        updated[i] = ((prev[i] || 0) + delta + 360) % 360;
      }
      return updated;
    });
  };

  const handleSave = async () => {
    if (!fileItem) return;

    setIsProcessing(true);
    setProgress(10);
    setCurrentStep('Applying rotations to PDF metadata...');

    try {
      const { blob, size } = await rotatePdfPages(fileItem.file, rotations, (pct, step) => {
        setProgress(pct);
        setCurrentStep(step);
      });

      const outputName = generateOutputFileName(fileItem.name, 'rotated', '.pdf');

      const processResult: ProcessingResult = {
        success: true,
        blob,
        fileName: outputName,
        originalSize: fileItem.size,
        outputSize: size,
      };

      setResult(processResult);
      setIsProcessing(false);

      saveHistoryRecord({
        toolId: 'rotate-pdf',
        toolName: 'Rotate PDF',
        fileName: fileItem.name,
        outputFileName: outputName,
        originalSize: fileItem.size,
        outputSize: size,
        status: 'completed',
      });

      showToast('success', 'Rotated PDF saved successfully!');
    } catch (err: any) {
      console.error(err);
      setIsProcessing(false);
      showToast('error', err.message || 'Failed to rotate PDF.');
    }
  };

  const handleReset = () => {
    setFileItem(null);
    setRotations({});
    setResult(null);
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      {result ? (
        <ResultCard
          result={result}
          toolName="Rotate PDF"
          onReset={handleReset}
          onViewHistory={onViewHistory}
        />
      ) : isProcessing ? (
        <ProcessingStatus
          percent={progress}
          currentStep={currentStep}
          toolName="Rotate PDF"
        />
      ) : !fileItem ? (
        <FileUploader
          onFilesSelected={handleFiles}
          allowedExtensions={['.pdf']}
          multiple={false}
          title="Drag & Drop PDF to Rotate"
          subtitle="Rotate all pages together or flip individual pages 90° clockwise/counter-clockwise."
        />
      ) : (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Rotate Document Pages ({fileItem.pageCount || 0} pages)
            </h3>

            {/* Quick Rotate All Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleRotateAll(-90)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Rotate All Left
              </button>
              <button
                type="button"
                onClick={() => handleRotateAll(90)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 flex items-center gap-1"
              >
                <RotateCw className="w-3.5 h-3.5" /> Rotate All Right
              </button>
              <button
                type="button"
                onClick={() => setRotations({})}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                title="Reset rotations"
              >
                <Undo className="w-4 h-4" />
              </button>
            </div>
          </div>

          <FileCard item={fileItem} onRemove={handleReset} />

          {/* Grid of Pages */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 max-h-96 overflow-y-auto p-2 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/40 dark:bg-slate-950/30">
            {(fileItem.pages || []).map((p) => {
              const currentDelta = rotations[p.pageNumber - 1] || 0;
              const totalAngle = (p.rotation + currentDelta) % 360;

              return (
                <PageThumbnail
                  key={p.pageNumber}
                  pageNumber={p.pageNumber}
                  rotation={totalAngle}
                  thumbnailUrl={p.thumbnailUrl}
                  showRotateControls={true}
                  onRotate={handleRotatePage}
                />
              );
            })}
          </div>

          <button
            id="rotate-pdf-submit-btn"
            onClick={handleSave}
            className="w-full py-4 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Save Rotated PDF</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
