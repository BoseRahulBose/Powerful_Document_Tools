import React, { useState } from 'react';
import {
  CheckCircle2,
  Download,
  RotateCcw,
  FileCheck,
  TrendingDown,
  Clock,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { ProcessingResult } from '../types';
import { formatBytes } from '../utils/formatters';

interface ResultCardProps {
  result: ProcessingResult;
  toolName: string;
  onReset: () => void;
  onViewHistory?: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  toolName,
  onReset,
  onViewHistory,
}) => {
  const [downloaded, setDownloaded] = useState(false);

  const isPdf = result.fileName.toLowerCase().endsWith('.pdf');
  const isImage =
    result.fileName.toLowerCase().endsWith('.jpg') ||
    result.fileName.toLowerCase().endsWith('.jpeg') ||
    result.fileName.toLowerCase().endsWith('.png') ||
    result.fileName.toLowerCase().endsWith('.webp');

  const handleDownload = (blobOrUrl?: Blob | string, customName?: string) => {
    setDownloaded(true);
    const targetName = customName || result.fileName;
    const targetBlob = blobOrUrl instanceof Blob ? blobOrUrl : result.blob;
    const targetUrl = typeof blobOrUrl === 'string' ? blobOrUrl : result.downloadUrl;

    if (targetBlob) {
      const url = URL.createObjectURL(targetBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = targetName;
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } else if (targetUrl) {
      const a = document.createElement('a');
      a.href = targetUrl;
      a.download = targetName;
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleOpenPreview = () => {
    if (result.blob) {
      const url = URL.createObjectURL(result.blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } else if (result.downloadUrl) {
      window.open(result.downloadUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const hasReduction = result.originalSize > 0 && result.outputSize < result.originalSize;
  const savingsPercent = hasReduction
    ? Math.round(((result.originalSize - result.outputSize) / result.originalSize) * 100)
    : 0;

  return (
    <div className="w-full max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-white/65 dark:bg-slate-900/65 backdrop-blur-2xl border border-white/80 dark:border-white/10 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
      {/* Top Success Badge */}
      <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/10 backdrop-blur-sm">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      {/* Headings */}
      <div className="space-y-1">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
          Your file is ready!
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Successfully processed with <span className="font-semibold text-slate-700 dark:text-slate-200">{toolName}</span>.
        </p>
      </div>

      {/* File Details Card */}
      <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-850/60 border border-white/80 dark:border-white/10 backdrop-blur-md text-left space-y-3 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <FileCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="font-bold text-sm text-slate-800 dark:text-white truncate">
              {result.fileName}
            </span>
          </div>
          <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-md bg-blue-50/80 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/40 shrink-0 backdrop-blur-sm">
            {formatBytes(result.outputSize)}
          </span>
        </div>

        {/* Compression / Size comparison if applicable */}
        {hasReduction && (
          <div className="flex items-center justify-between pt-2 border-t border-white/60 dark:border-white/10 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <span>{formatBytes(result.originalSize)}</span>
              <span>→</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{formatBytes(result.outputSize)}</span>
            </div>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-200/50 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
              <TrendingDown className="w-3.5 h-3.5" />
              {savingsPercent}% smaller
            </span>
          </div>
        )}
      </div>

      {/* Additional Files (e.g. if split created multiple or images) */}
      {result.additionalFiles && result.additionalFiles.length > 1 && (
        <div className="space-y-2 text-left">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Individual Files ({result.additionalFiles.length})
          </p>
          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
            {result.additionalFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-white/10 backdrop-blur-sm text-xs"
              >
                <span className="truncate max-w-[220px] text-slate-700 dark:text-slate-300 font-medium">
                  {file.name}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      const url = URL.createObjectURL(file.blob);
                      window.open(url, '_blank', 'noopener,noreferrer');
                      setTimeout(() => URL.revokeObjectURL(url), 30000);
                    }}
                    className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium flex items-center gap-1 cursor-pointer"
                    title="Preview in browser"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                  <button
                    onClick={() => handleDownload(file.blob, file.name)}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Primary Action Buttons */}
      <div className="space-y-3 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            id="result-download-btn"
            onClick={() => handleDownload()}
            className="w-full py-3.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xl shadow-blue-500/25 hover:shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{downloaded ? 'Download Again' : 'Download File'}</span>
          </button>

          {(isPdf || isImage) ? (
            <button
              id="result-preview-btn"
              onClick={handleOpenPreview}
              className="w-full py-3.5 px-5 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-white font-semibold text-sm border border-slate-200/80 dark:border-white/10 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Open in New Tab</span>
            </button>
          ) : (
            <button
              id="result-process-another-btn-primary"
              onClick={onReset}
              className="w-full py-3.5 px-5 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-white font-semibold text-sm border border-slate-200/80 dark:border-white/10 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Process Another</span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-center gap-3">
          {(isPdf || isImage) && (
            <button
              id="result-process-another-btn"
              onClick={onReset}
              className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/60 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-white/60"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Process Another File</span>
            </button>
          )}

          {onViewHistory && (
            <button
              onClick={onViewHistory}
              className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/60 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-white/60"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>View in History</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
