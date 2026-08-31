import React, { useState } from 'react';
import { Scissors, ArrowRight, RefreshCw, Check } from 'lucide-react';
import { FileUploader } from '../../components/FileUploader';
import { FileCard } from '../../components/FileCard';
import { PageThumbnail } from '../../components/PageThumbnail';
import { ProcessingStatus } from '../../components/ProcessingStatus';
import { ResultCard } from '../../components/ResultCard';
import { UploadedFileItem, ProcessingResult } from '../../types';
import { splitPdf, inspectPdfDocument } from '../../utils/pdfEngine';
import { saveHistoryRecord } from '../../utils/storage';

interface SplitPdfToolProps {
  onViewHistory: () => void;
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const SplitPdfTool: React.FC<SplitPdfToolProps> = ({ onViewHistory, showToast }) => {
  const [fileItem, setFileItem] = useState<UploadedFileItem | null>(null);
  const [mode, setMode] = useState<'ranges' | 'interval' | 'selected'>('ranges');
  const [rangeInput, setRangeInput] = useState<string>('1-2, 3-4');
  const [intervalCount, setIntervalCount] = useState<number>(1);
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
        pages: info.pages.map((p) => ({ ...p, selected: p.pageNumber === 1 })),
      });
      setSelectedPages(new Set([1]));
      setRangeInput(info.pageCount > 2 ? `1-${Math.ceil(info.pageCount / 2)}, ${Math.ceil(info.pageCount / 2) + 1}-${info.pageCount}` : '1, 2');
    } catch (e) {
      setFileItem({
        id: `file_${Date.now()}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
      });
    }
    setResult(null);
  };

  const handleToggleSelectPage = (pageNum: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageNum)) {
        if (next.size > 1) next.delete(pageNum);
      } else {
        next.add(pageNum);
      }
      return next;
    });
  };

  const handleSplit = async () => {
    if (!fileItem) return;

    setIsProcessing(true);
    setProgress(5);
    setCurrentStep('Executing split operation...');

    try {
      const { blob, size, isZip, additionalFiles } = await splitPdf(
        fileItem.file,
        mode,
        {
          ranges: rangeInput,
          interval: intervalCount,
          selectedPages: Array.from(selectedPages),
        },
        (pct, step) => {
          setProgress(pct);
          setCurrentStep(step);
        }
      );

      const baseName = fileItem.name.replace(/\.[^/.]+$/, '');
      const outputName = isZip ? `${baseName}_split_files.zip` : `${baseName}_split.pdf`;

      const processResult: ProcessingResult = {
        success: true,
        blob,
        fileName: outputName,
        originalSize: fileItem.size,
        outputSize: size,
        additionalFiles,
      };

      setResult(processResult);
      setIsProcessing(false);

      saveHistoryRecord({
        toolId: 'split-pdf',
        toolName: 'Split PDF',
        fileName: fileItem.name,
        outputFileName: outputName,
        originalSize: fileItem.size,
        outputSize: size,
        status: 'completed',
      });

      showToast('success', 'PDF split completed successfully!');
    } catch (err: any) {
      console.error(err);
      setIsProcessing(false);
      showToast('error', err.message || 'Failed to split PDF.');
    }
  };

  const handleReset = () => {
    setFileItem(null);
    setResult(null);
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      {result ? (
        <ResultCard
          result={result}
          toolName="Split PDF"
          onReset={handleReset}
          onViewHistory={onViewHistory}
        />
      ) : isProcessing ? (
        <ProcessingStatus
          percent={progress}
          currentStep={currentStep}
          toolName="Split PDF"
        />
      ) : !fileItem ? (
        <FileUploader
          onFilesSelected={handleFiles}
          allowedExtensions={['.pdf']}
          multiple={false}
          title="Drag & Drop PDF to Split"
          subtitle="Separate pages by ranges, fixed intervals, or individual selection."
        />
      ) : (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Split Configuration
            </h3>
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Change File
            </button>
          </div>

          <FileCard item={fileItem} onRemove={handleReset} />

          {/* Mode Selector */}
          <div className="grid grid-cols-3 gap-2.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('ranges')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                mode === 'ranges'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Custom Ranges
            </button>
            <button
              type="button"
              onClick={() => setMode('interval')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                mode === 'interval'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Split Every X Pages
            </button>
            <button
              type="button"
              onClick={() => setMode('selected')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                mode === 'selected'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Select Pages
            </button>
          </div>

          {/* Mode-specific settings */}
          {mode === 'ranges' && (
            <div className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Page Ranges (comma separated, e.g. 1-3, 4-7, 8-12):
              </label>
              <input
                type="text"
                value={rangeInput}
                onChange={(e) => setRangeInput(e.target.value)}
                placeholder="e.g. 1-2, 3-5"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-500">
                Total pages in document: {fileItem.pageCount || 'Unknown'}
              </p>
            </div>
          )}

          {mode === 'interval' && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Split into separate files every:
              </span>
              <select
                value={intervalCount}
                onChange={(e) => setIntervalCount(parseInt(e.target.value, 10))}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
              >
                <option value={1}>1 Page (All individual pages)</option>
                <option value={2}>2 Pages</option>
                <option value={5}>5 Pages</option>
                <option value={10}>10 Pages</option>
              </select>
            </div>
          )}

          {/* Page thumbnails for visual picking */}
          {fileItem.pages && fileItem.pages.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Page Previews ({fileItem.pages.length} pages)
                </span>
                {mode === 'selected' && (
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                    {selectedPages.size} selected
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-72 overflow-y-auto p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/40">
                {fileItem.pages.map((p) => (
                  <PageThumbnail
                    key={p.pageNumber}
                    pageNumber={p.pageNumber}
                    rotation={p.rotation}
                    thumbnailUrl={p.thumbnailUrl}
                    isSelected={selectedPages.has(p.pageNumber)}
                    showSelectCheckbox={mode === 'selected'}
                    onToggleSelect={mode === 'selected' ? handleToggleSelectPage : undefined}
                  />
                ))}
              </div>
            </div>
          )}

          <button
            id="split-pdf-submit-btn"
            onClick={handleSplit}
            className="w-full py-4 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Split PDF Document</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
