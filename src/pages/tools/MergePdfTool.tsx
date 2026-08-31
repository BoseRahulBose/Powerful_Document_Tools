import React, { useState } from 'react';
import { Layers, ArrowRight, Plus, RefreshCw, Sparkles } from 'lucide-react';
import { FileUploader } from '../../components/FileUploader';
import { FileCard } from '../../components/FileCard';
import { ProcessingStatus } from '../../components/ProcessingStatus';
import { ResultCard } from '../../components/ResultCard';
import { UploadedFileItem, ProcessingResult } from '../../types';
import { mergePdfs, inspectPdfDocument } from '../../utils/pdfEngine';
import { saveHistoryRecord } from '../../utils/storage';
import { formatBytes } from '../../utils/formatters';

interface MergePdfToolProps {
  onViewHistory: () => void;
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const MergePdfTool: React.FC<MergePdfToolProps> = ({ onViewHistory, showToast }) => {
  const [fileItems, setFileItems] = useState<UploadedFileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [result, setResult] = useState<ProcessingResult | null>(null);

  const handleFiles = async (files: File[]) => {
    const newItems: UploadedFileItem[] = [];

    for (const f of files) {
      let pageCount: number | undefined = undefined;
      try {
        const info = await inspectPdfDocument(f);
        pageCount = info.pageCount;
      } catch (e) {}

      newItems.push({
        id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        file: f,
        name: f.name,
        size: f.size,
        type: f.type,
        pageCount,
      });
    }

    setFileItems((prev) => [...prev, ...newItems]);
    setResult(null);
  };

  const handleRemove = (id: string) => {
    setFileItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setFileItems((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
      return updated;
    });
  };

  const handleMoveDown = (index: number) => {
    setFileItems((prev) => {
      if (index === prev.length - 1) return prev;
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
      return updated;
    });
  };

  const handleMerge = async () => {
    if (fileItems.length < 2) {
      showToast('error', 'Please upload at least 2 PDF files to merge.');
      return;
    }

    setIsProcessing(true);
    setProgress(5);
    setCurrentStep('Combining PDF documents into unified file...');

    try {
      const rawFiles = fileItems.map((item) => item.file);
      const totalOriginalSize = fileItems.reduce((acc, f) => acc + f.size, 0);

      const { blob, size } = await mergePdfs(rawFiles, (pct, step) => {
        setProgress(pct);
        setCurrentStep(step);
      });

      const outputName = 'merged_document.pdf';

      const processResult: ProcessingResult = {
        success: true,
        blob,
        fileName: outputName,
        originalSize: totalOriginalSize,
        outputSize: size,
      };

      setResult(processResult);
      setIsProcessing(false);

      saveHistoryRecord({
        toolId: 'merge-pdf',
        toolName: 'Merge PDF',
        fileName: `${fileItems.length} PDF files`,
        outputFileName: outputName,
        originalSize: totalOriginalSize,
        outputSize: size,
        status: 'completed',
      });

      showToast('success', `Merged ${fileItems.length} PDF files successfully!`);
    } catch (err: any) {
      console.error(err);
      setIsProcessing(false);
      showToast('error', err.message || 'Failed to merge PDF files.');
    }
  };

  const handleReset = () => {
    setFileItems([]);
    setResult(null);
    setIsProcessing(false);
  };

  const totalPages = fileItems.reduce((acc, f) => acc + (f.pageCount || 1), 0);
  const totalBytes = fileItems.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="space-y-6">
      {result ? (
        <ResultCard
          result={result}
          toolName="Merge PDF"
          onReset={handleReset}
          onViewHistory={onViewHistory}
        />
      ) : isProcessing ? (
        <ProcessingStatus
          percent={progress}
          currentStep={currentStep}
          toolName="Merge PDF"
        />
      ) : fileItems.length === 0 ? (
        <FileUploader
          onFilesSelected={handleFiles}
          allowedExtensions={['.pdf']}
          multiple={true}
          title="Upload multiple PDFs to merge"
          subtitle="Combine 2 or more PDF documents into a single cohesive file."
        />
      ) : (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Arrange PDFs ({fileItems.length} files)
              </h3>
              <p className="text-xs text-slate-500">
                Use up/down buttons to set the exact page sequence.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Clear all
            </button>
          </div>

          {/* Files List */}
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {fileItems.map((item, index) => (
              <FileCard
                key={item.id}
                item={item}
                index={index}
                total={fileItems.length}
                showReorder={true}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onRemove={handleRemove}
              />
            ))}
          </div>

          {/* Add more button */}
          <FileUploader
            onFilesSelected={handleFiles}
            allowedExtensions={['.pdf']}
            multiple={true}
            isCompact={true}
          />

          {/* Stats Bar */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-slate-500">Total size: <strong>{formatBytes(totalBytes)}</strong></span>
            <span className="text-slate-500">Total pages: <strong>~{totalPages} pages</strong></span>
          </div>

          <button
            id="merge-pdf-submit-btn"
            onClick={handleMerge}
            disabled={fileItems.length < 2}
            className="w-full py-4 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-indigo-600/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{fileItems.length < 2 ? 'Upload at least 2 files to merge' : `Merge ${fileItems.length} PDFs`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
