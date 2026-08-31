import React, { useState } from 'react';
import { Copy, ArrowRight, RefreshCw, CheckCheck } from 'lucide-react';
import { FileUploader } from '../../components/FileUploader';
import { FileCard } from '../../components/FileCard';
import { PageThumbnail } from '../../components/PageThumbnail';
import { ProcessingStatus } from '../../components/ProcessingStatus';
import { ResultCard } from '../../components/ResultCard';
import { UploadedFileItem, ProcessingResult } from '../../types';
import { extractPdfPages, inspectPdfDocument } from '../../utils/pdfEngine';
import { saveHistoryRecord } from '../../utils/storage';
import { generateOutputFileName } from '../../utils/formatters';

interface ExtractPdfPagesToolProps {
  onViewHistory: () => void;
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const ExtractPdfPagesTool: React.FC<ExtractPdfPagesToolProps> = ({ onViewHistory, showToast }) => {
  const [fileItem, setFileItem] = useState<UploadedFileItem | null>(null);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set([1]));
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
      setSelectedPages(new Set([1]));
    } catch (e) {
      showToast('error', 'Could not inspect PDF.');
    }
    setResult(null);
  };

  const handleToggleSelect = (pageNum: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageNum)) {
        next.delete(pageNum);
      } else {
        next.add(pageNum);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (!fileItem || !fileItem.pageCount) return;
    const all = new Set<number>();
    for (let i = 1; i <= fileItem.pageCount; i++) all.add(i);
    setSelectedPages(all);
  };

  const handleDeselectAll = () => {
    setSelectedPages(new Set());
  };

  const handleExtract = async () => {
    if (!fileItem) return;
    if (selectedPages.size === 0) {
      showToast('error', 'Please select at least 1 page to extract.');
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setCurrentStep(`Extracting ${selectedPages.size} selected pages...`);

    try {
      const sortedPages: number[] = Array.from(selectedPages).map(Number).sort((a, b) => a - b);
      const { blob, size } = await extractPdfPages(fileItem.file, sortedPages, (pct, step) => {
        setProgress(pct);
        setCurrentStep(step);
      });

      const outputName = generateOutputFileName(fileItem.name, 'extracted', '.pdf');

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
        toolId: 'extract-pdf-pages',
        toolName: 'Extract PDF Pages',
        fileName: fileItem.name,
        outputFileName: outputName,
        originalSize: fileItem.size,
        outputSize: size,
        status: 'completed',
      });

      showToast('success', `Extracted ${selectedPages.size} pages into a new PDF!`);
    } catch (err: any) {
      console.error(err);
      setIsProcessing(false);
      showToast('error', err.message || 'Failed to extract PDF pages.');
    }
  };

  const handleReset = () => {
    setFileItem(null);
    setSelectedPages(new Set([1]));
    setResult(null);
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      {result ? (
        <ResultCard
          result={result}
          toolName="Extract PDF Pages"
          onReset={handleReset}
          onViewHistory={onViewHistory}
        />
      ) : isProcessing ? (
        <ProcessingStatus
          percent={progress}
          currentStep={currentStep}
          toolName="Extract PDF Pages"
        />
      ) : !fileItem ? (
        <FileUploader
          onFilesSelected={handleFiles}
          allowedExtensions={['.pdf']}
          multiple={false}
          title="Drag & Drop PDF to Extract Pages"
          subtitle="Choose specific pages to extract into a standalone document."
        />
      ) : (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Select Pages to Extract ({selectedPages.size} of {fileItem.pageCount} chosen)
              </h3>
              <p className="text-xs text-slate-500">
                Click any page to include or exclude from the new extracted PDF.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              >
                Clear
              </button>
            </div>
          </div>

          <FileCard item={fileItem} onRemove={handleReset} />

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 max-h-96 overflow-y-auto p-2 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/40 dark:bg-slate-950/30">
            {(fileItem.pages || []).map((p) => {
              const isSelected = selectedPages.has(p.pageNumber);
              return (
                <PageThumbnail
                  key={p.pageNumber}
                  pageNumber={p.pageNumber}
                  rotation={p.rotation}
                  thumbnailUrl={p.thumbnailUrl}
                  isSelected={isSelected}
                  showSelectCheckbox={true}
                  onToggleSelect={handleToggleSelect}
                />
              );
            })}
          </div>

          <button
            id="extract-pages-submit-btn"
            onClick={handleExtract}
            disabled={selectedPages.size === 0}
            className="w-full py-4 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-indigo-600/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Copy className="w-4 h-4" />
            <span>
              {selectedPages.size === 0
                ? 'Select at least 1 page to extract'
                : `Extract ${selectedPages.size} Selected Pages`}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
