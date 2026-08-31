import React, { useState } from 'react';
import { Trash2, ArrowRight, RefreshCw, Undo2, Check } from 'lucide-react';
import { FileUploader } from '../../components/FileUploader';
import { FileCard } from '../../components/FileCard';
import { PageThumbnail } from '../../components/PageThumbnail';
import { ProcessingStatus } from '../../components/ProcessingStatus';
import { ResultCard } from '../../components/ResultCard';
import { UploadedFileItem, ProcessingResult } from '../../types';
import { deletePdfPages, inspectPdfDocument } from '../../utils/pdfEngine';
import { saveHistoryRecord } from '../../utils/storage';
import { generateOutputFileName } from '../../utils/formatters';

interface DeletePdfPagesToolProps {
  onViewHistory: () => void;
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const DeletePdfPagesTool: React.FC<DeletePdfPagesToolProps> = ({ onViewHistory, showToast }) => {
  const [fileItem, setFileItem] = useState<UploadedFileItem | null>(null);
  const [deletedPages, setDeletedPages] = useState<Set<number>>(new Set());
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
      setDeletedPages(new Set());
    } catch (e) {
      showToast('error', 'Could not inspect PDF.');
    }
    setResult(null);
  };

  const handleToggleDelete = (pageNum: number) => {
    setDeletedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageNum)) {
        next.delete(pageNum);
      } else {
        // Prevent deleting every single page
        if (fileItem && next.size + 1 >= (fileItem.pageCount || 1)) {
          showToast('error', 'You cannot delete all pages from the PDF.');
          return prev;
        }
        next.add(pageNum);
      }
      return next;
    });
  };

  const handleDeleteSubmit = async () => {
    if (!fileItem) return;
    if (deletedPages.size === 0) {
      showToast('info', 'No pages selected for deletion.');
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setCurrentStep(`Removing ${deletedPages.size} pages from document...`);

    try {
      const { blob, size } = await deletePdfPages(
        fileItem.file,
        Array.from(deletedPages),
        (pct, step) => {
          setProgress(pct);
          setCurrentStep(step);
        }
      );

      const outputName = generateOutputFileName(fileItem.name, 'pages_removed', '.pdf');

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
        toolId: 'delete-pdf-pages',
        toolName: 'Delete PDF Pages',
        fileName: fileItem.name,
        outputFileName: outputName,
        originalSize: fileItem.size,
        outputSize: size,
        status: 'completed',
      });

      showToast('success', `Removed ${deletedPages.size} pages successfully!`);
    } catch (err: any) {
      console.error(err);
      setIsProcessing(false);
      showToast('error', err.message || 'Failed to delete pages.');
    }
  };

  const handleReset = () => {
    setFileItem(null);
    setDeletedPages(new Set());
    setResult(null);
    setIsProcessing(false);
  };

  const remainingCount = (fileItem?.pageCount || 0) - deletedPages.size;

  return (
    <div className="space-y-6">
      {result ? (
        <ResultCard
          result={result}
          toolName="Delete PDF Pages"
          onReset={handleReset}
          onViewHistory={onViewHistory}
        />
      ) : isProcessing ? (
        <ProcessingStatus
          percent={progress}
          currentStep={currentStep}
          toolName="Delete PDF Pages"
        />
      ) : !fileItem ? (
        <FileUploader
          onFilesSelected={handleFiles}
          allowedExtensions={['.pdf']}
          multiple={false}
          title="Drag & Drop PDF to Delete Pages"
          subtitle="Click unwanted pages to discard them and download a clean PDF."
        />
      ) : (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Select Pages to Delete
              </h3>
              <p className="text-xs text-slate-500">
                Click on the trash icon or thumbnail to mark for removal.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                {deletedPages.size} marked for deletion
              </span>
              {deletedPages.size > 0 && (
                <button
                  type="button"
                  onClick={() => setDeletedPages(new Set())}
                  className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                >
                  <Undo2 className="w-3.5 h-3.5" /> Restore all
                </button>
              )}
            </div>
          </div>

          <FileCard item={fileItem} onRemove={handleReset} />

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 max-h-96 overflow-y-auto p-2 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/40 dark:bg-slate-950/30">
            {(fileItem.pages || []).map((p) => {
              const isMarked = deletedPages.has(p.pageNumber);
              return (
                <PageThumbnail
                  key={p.pageNumber}
                  pageNumber={p.pageNumber}
                  rotation={p.rotation}
                  thumbnailUrl={p.thumbnailUrl}
                  isDeleted={isMarked}
                  showDeleteControl={true}
                  onToggleDelete={handleToggleDelete}
                />
              );
            })}
          </div>

          <button
            id="delete-pages-submit-btn"
            onClick={handleDeleteSubmit}
            disabled={deletedPages.size === 0}
            className="w-full py-4 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-rose-600/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>
              {deletedPages.size === 0
                ? 'Select at least 1 page to delete'
                : `Delete ${deletedPages.size} Pages & Save (${remainingCount} pages remaining)`}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
