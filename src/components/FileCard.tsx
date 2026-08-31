import React from 'react';
import { FileText, FileType, Image as ImageIcon, Trash2, ArrowUp, ArrowDown, Move } from 'lucide-react';
import { UploadedFileItem } from '../types';
import { formatBytes } from '../utils/formatters';

interface FileCardProps {
  item: UploadedFileItem;
  index?: number;
  total?: number;
  onRemove: (id: string) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
  showReorder?: boolean;
}

export const FileCard: React.FC<FileCardProps> = ({
  item,
  index,
  total,
  onRemove,
  onMoveUp,
  onMoveDown,
  showReorder = false,
}) => {
  const isPdf = item.name.toLowerCase().endsWith('.pdf');
  const isWord = item.name.toLowerCase().endsWith('.docx') || item.name.toLowerCase().endsWith('.doc');
  const isImage = item.type.startsWith('image/');

  return (
    <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-white/80 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md shadow-sm hover:bg-white/80 dark:hover:bg-slate-850/80 transition-all group">
      {/* File Info */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Reorder arrows if enabled */}
        {showReorder && typeof index === 'number' && typeof total === 'number' && (
          <div className="flex flex-col gap-0.5 mr-1 text-slate-400">
            <button
              onClick={() => onMoveUp && onMoveUp(index)}
              disabled={index === 0}
              className="p-0.5 hover:text-blue-600 disabled:opacity-25 disabled:hover:text-slate-400 transition-colors cursor-pointer"
              title="Move up"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onMoveDown && onMoveDown(index)}
              disabled={index === total - 1}
              className="p-0.5 hover:text-blue-600 disabled:opacity-25 disabled:hover:text-slate-400 transition-colors cursor-pointer"
              title="Move down"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Icon */}
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm backdrop-blur-sm ${
            isPdf
              ? 'bg-red-50/80 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-900/50'
              : isWord
              ? 'bg-blue-50/80 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/50'
              : 'bg-emerald-50/80 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/50'
          }`}
        >
          {isPdf ? (
            <FileText className="w-5 h-5" />
          ) : isWord ? (
            <FileType className="w-5 h-5" />
          ) : (
            <ImageIcon className="w-5 h-5" />
          )}
        </div>

        {/* Name and Size */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-xs md:max-w-sm">
            {item.name}
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <span>{formatBytes(item.size)}</span>
            {item.pageCount && (
              <>
                <span>•</span>
                <span>{item.pageCount} {item.pageCount === 1 ? 'page' : 'pages'}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Remove Action */}
      <button
        onClick={() => onRemove(item.id)}
        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50/80 dark:hover:bg-rose-950/40 transition-colors ml-2 cursor-pointer"
        title="Remove file"
        aria-label={`Remove ${item.name}`}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};
