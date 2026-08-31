import React, { useState } from 'react';
import { Grid, ArrowRight, RefreshCw, Plus, Trash2, RotateCw, Copy } from 'lucide-react';
import { FileUploader } from '../../components/FileUploader';
import { FileCard } from '../../components/FileCard';
import { PageThumbnail } from '../../components/PageThumbnail';
import { ProcessingStatus } from '../../components/ProcessingStatus';
import { ResultCard } from '../../components/ResultCard';
import { UploadedFileItem, ProcessingResult, PdfPageInfo } from '../../types';
import { organizePdfPages, inspectPdfDocument } from '../../utils/pdfEngine';
import { saveHistoryRecord } from '../../utils/storage';
import { generateOutputFileName } from '../../utils/formatters';

interface OrganizePdfToolProps {
  onViewHistory: () => void;
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

interface EditablePageItem {
  id: string;
  sourcePageIndex: number; // 0-based
  displayLabel: number;
  rotation: number;
  thumbnailUrl?: string;
}

export const OrganizePdfTool: React.FC<OrganizePdfToolProps> = ({ onViewHistory, showToast }) => {
  const [fileItem, setFileItem] = useState<UploadedFileItem | null>(null);
  const [pagesList, setPagesList] = useState<EditablePageItem[]>([]);
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

      const initialPages: EditablePageItem[] = info.pages.map((p, idx) => ({
        id: `page_${idx}_${Date.now()}`,
        sourcePageIndex: idx,
        displayLabel: idx + 1,
        rotation: p.rotation,
        thumbnailUrl: p.thumbnailUrl,
      }));
      setPagesList(initialPages);
    } catch (e) {
      showToast('error', 'Could not inspect PDF pages.');
    }
    setResult(null);
  };

  const handleRotate = (index: number, delta: number) => {
    setPagesList((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        rotation: (updated[index].rotation + delta + 360) % 360,
      };
      return updated;
    });
  };

  const handleDelete = (index: number) => {
    if (pagesList.length <= 1) {
      showToast('error', 'The document must have at least 1 page.');
      return;
    }
    setPagesList((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleDuplicate = (index: number) => {
    setPagesList((prev) => {
      const target = prev[index];
      const copy: EditablePageItem = {
        ...target,
        id: `page_dup_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      };
      const updated = [...prev];
      updated.splice(index + 1, 0, copy);
      return updated;
    });
    showToast('info', 'Page duplicated.');
  };

  const handleMoveLeft = (index: number) => {
    if (index === 0) return;
    setPagesList((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
      return updated;
    });
  };

  const handleMoveRight = (index: number) => {
    if (index === pagesList.length - 1) return;
    setPagesList((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
      return updated;
    });
  };

  const handleSave = async () => {
    if (!fileItem || pagesList.length === 0) return;

    setIsProcessing(true);
    setProgress(10);
    setCurrentStep('Synthesizing organized page layout...');

    try {
      const operations = pagesList.map((p) => ({
        sourceIndex: p.sourcePageIndex,
        rotation: p.rotation,
      }));

      const { blob, size } = await organizePdfPages(fileItem.file, operations, (pct, step) => {
        setProgress(pct);
        setCurrentStep(step);
      });

      const outputName = generateOutputFileName(fileItem.name, 'organized', '.pdf');

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
        toolId: 'organize-pdf',
        toolName: 'Organize PDF Pages',
        fileName: fileItem.name,
        outputFileName: outputName,
        originalSize: fileItem.size,
        outputSize: size,
        status: 'completed',
      });

      showToast('success', 'Organized PDF saved successfully!');
    } catch (err: any) {
      console.error(err);
      setIsProcessing(false);
      showToast('error', err.message || 'Failed to organize PDF.');
    }
  };

  const handleReset = () => {
    setFileItem(null);
    setPagesList([]);
    setResult(null);
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      {result ? (
        <ResultCard
          result={result}
          toolName="Organize PDF"
          onReset={handleReset}
          onViewHistory={onViewHistory}
        />
      ) : isProcessing ? (
        <ProcessingStatus
          percent={progress}
          currentStep={currentStep}
          toolName="Organize PDF"
        />
      ) : !fileItem ? (
        <FileUploader
          onFilesSelected={handleFiles}
          allowedExtensions={['.pdf']}
          multiple={false}
          title="Drag & Drop PDF to Organize"
          subtitle="Reorder, rotate, duplicate, or remove pages in an interactive visual studio."
        />
      ) : (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Interactive Page Studio ({pagesList.length} total pages)
              </h3>
              <p className="text-xs text-slate-500">
                Reorder sequence, rotate orientation, duplicate, or delete specific pages.
              </p>
            </div>

            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Change File
            </button>
          </div>

          <FileCard item={fileItem} onRemove={handleReset} />

          {/* Studio Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[440px] overflow-y-auto p-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/40 dark:bg-slate-950/30">
            {pagesList.map((p, idx) => (
              <div key={p.id} className="relative group">
                <PageThumbnail
                  pageNumber={idx + 1}
                  rotation={p.rotation}
                  thumbnailUrl={p.thumbnailUrl}
                  showRotateControls={true}
                  showDeleteControl={true}
                  showDuplicateControl={true}
                  onRotate={(_, delta) => handleRotate(idx, delta)}
                  onToggleDelete={() => handleDelete(idx)}
                  onDuplicate={() => handleDuplicate(idx)}
                />

                {/* Move arrows below */}
                <div className="flex items-center justify-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => handleMoveLeft(idx)}
                    disabled={idx === 0}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-20 hover:bg-indigo-100 dark:hover:bg-indigo-950"
                  >
                    ◀
                  </button>
                  <span className="text-[10px] font-mono text-slate-400">#{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleMoveRight(idx)}
                    disabled={idx === pagesList.length - 1}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-20 hover:bg-indigo-100 dark:hover:bg-indigo-950"
                  >
                    ▶
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            id="organize-pdf-submit-btn"
            onClick={handleSave}
            disabled={pagesList.length === 0}
            className="w-full py-4 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Grid className="w-4 h-4" />
            <span>Save Organized PDF ({pagesList.length} pages)</span>
          </button>
        </div>
      )}
    </div>
  );
};
