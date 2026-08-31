import React, { useState, useEffect } from 'react';
import {
  Clock,
  Trash2,
  FileCheck,
  ArrowRight,
  TrendingDown,
  Sparkles,
  ShieldCheck,
  FolderOpen,
} from 'lucide-react';
import { HistoryItem } from '../types';
import { getHistory, clearHistory } from '../utils/storage';
import { formatBytes, formatTimestamp } from '../utils/formatters';

interface HistoryPageProps {
  onNavigate: (route: string) => void;
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigate, showToast }) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setHistoryItems(getHistory());
  }, []);

  const handleClear = () => {
    if (confirm('Are you sure you want to clear your local processing history?')) {
      clearHistory();
      setHistoryItems([]);
      showToast('info', 'Local processing history cleared.');
    }
  };

  return (
    <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/60 dark:border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50/80 dark:bg-blue-950/80 border border-blue-200/50 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center backdrop-blur-sm">
              <Clock className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">
              Processing History
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Stored only on your local device. Files are not saved on remote servers.
          </p>
        </div>

        {historyItems.length > 0 && (
          <button
            onClick={handleClear}
            className="self-start sm:self-auto px-3.5 py-2 rounded-xl border border-rose-200/80 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-100/80 flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* History Records */}
      {historyItems.length > 0 ? (
        <div className="space-y-3">
          {historyItems.map((item) => {
            const hasReduction = item.outputSize && item.outputSize < item.originalSize;
            const savings = hasReduction
              ? Math.round(((item.originalSize - item.outputSize!) / item.originalSize) * 100)
              : 0;

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-sm hover:bg-white/80 dark:hover:bg-slate-850/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left side: Tool info & filename */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50/80 dark:bg-blue-950/80 border border-blue-200/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 backdrop-blur-sm">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-white/60 dark:border-white/10">
                        {item.toolName}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {formatTimestamp(item.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-sm sm:max-w-md">
                      {item.fileName}
                    </p>
                  </div>
                </div>

                {/* Right side: Sizes & actions */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/60 dark:border-white/10 text-xs">
                  <div className="text-right">
                    <div className="font-mono font-medium text-slate-700 dark:text-slate-300">
                      {formatBytes(item.originalSize)}
                      {item.outputSize && (
                        <span> → <strong className="text-blue-600 dark:text-blue-400">{formatBytes(item.outputSize)}</strong></span>
                      )}
                    </div>
                    {hasReduction && (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        -{savings}% saved
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => onNavigate(`/${item.toolId}`)}
                    className="p-2 rounded-xl bg-white/70 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-600 dark:text-slate-300 hover:text-blue-600 border border-white/60 dark:border-white/10 transition-colors cursor-pointer"
                    title="Open tool"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-white/10 space-y-4 max-w-md mx-auto shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-blue-50/80 dark:bg-blue-950/80 border border-blue-200/50 text-blue-500 mx-auto flex items-center justify-center">
            <FolderOpen className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              No Processing History Yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              When you convert, compress, or merge documents, your recent operations will be logged here for quick reference.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/')}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            Explore Tools
          </button>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-850/40 backdrop-blur-md border border-white/60 dark:border-white/10 flex items-center gap-3 text-xs text-slate-500">
        <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
        <span>
          DocuFlow respects your absolute privacy. History entries reside solely inside your browser's private storage (`localStorage`) and are never sent to external analytic trackers.
        </span>
      </div>
    </div>
  );
};
