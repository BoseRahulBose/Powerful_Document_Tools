import React from 'react';
import { RotateCw, RotateCcw, Trash2, Check, Copy, GripVertical } from 'lucide-react';

interface PageThumbnailProps {
  pageNumber: number;
  rotation: number;
  thumbnailUrl?: string;
  isSelected?: boolean;
  isDeleted?: boolean;
  showSelectCheckbox?: boolean;
  showRotateControls?: boolean;
  showDeleteControl?: boolean;
  showDuplicateControl?: boolean;
  showDragHandle?: boolean;
  onToggleSelect?: (pageNumber: number) => void;
  onRotate?: (pageNumber: number, delta: number) => void;
  onToggleDelete?: (pageNumber: number) => void;
  onDuplicate?: (pageNumber: number) => void;
}

export const PageThumbnail: React.FC<PageThumbnailProps> = ({
  pageNumber,
  rotation,
  thumbnailUrl,
  isSelected = false,
  isDeleted = false,
  showSelectCheckbox = false,
  showRotateControls = false,
  showDeleteControl = false,
  showDuplicateControl = false,
  showDragHandle = false,
  onToggleSelect,
  onRotate,
  onToggleDelete,
  onDuplicate,
}) => {
  return (
    <div
      className={`relative flex flex-col items-center p-3 rounded-2xl border transition-all duration-200 group ${
        isDeleted
          ? 'opacity-40 border-rose-300 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20'
          : isSelected
          ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 ring-2 ring-indigo-500/30 shadow-md'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
      }`}
    >
      {/* Header controls badge */}
      <div className="w-full flex items-center justify-between gap-1 mb-2 px-1">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
          Page {pageNumber}
        </span>

        {/* Checkbox */}
        {showSelectCheckbox && onToggleSelect && (
          <button
            type="button"
            onClick={() => onToggleSelect(pageNumber)}
            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
              isSelected
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-indigo-500'
            }`}
          >
            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </button>
        )}

        {/* Delete button */}
        {showDeleteControl && onToggleDelete && (
          <button
            type="button"
            onClick={() => onToggleDelete(pageNumber)}
            title={isDeleted ? 'Restore page' : 'Delete page'}
            className={`p-1 rounded-md transition-colors ${
              isDeleted
                ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/80'
                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Page Preview Canvas Box */}
      <div
        onClick={() => onToggleSelect && onToggleSelect(pageNumber)}
        className="w-full aspect-[1/1.4] rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 overflow-hidden flex items-center justify-center relative cursor-pointer group-hover:shadow-sm"
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={`Page ${pageNumber}`}
            className="w-full h-full object-contain transition-transform duration-200"
            style={{ transform: `rotate(${rotation}deg)` }}
          />
        ) : (
          <div
            className="w-full h-full p-4 flex flex-col justify-between bg-white dark:bg-slate-850 text-slate-400"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <div className="space-y-1.5 opacity-60">
              <div className="h-2 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-2 w-5/6 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-2 w-2/3 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
            <div className="text-center font-mono text-[10px] text-slate-400">
              [Page {pageNumber}]
            </div>
            <div className="space-y-1.5 opacity-60">
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-2 w-4/5 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
        )}

        {isDeleted && (
          <div className="absolute inset-0 bg-rose-900/40 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow">
              DELETED
            </span>
          </div>
        )}
      </div>

      {/* Bottom action bar */}
      <div className="w-full flex items-center justify-center gap-1.5 mt-2.5 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
        {showRotateControls && onRotate && (
          <>
            <button
              type="button"
              onClick={() => onRotate(pageNumber, -90)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
              title="Rotate Counter-Clockwise"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onRotate(pageNumber, 90)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
              title="Rotate Clockwise"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        {showDuplicateControl && onDuplicate && (
          <button
            type="button"
            onClick={() => onDuplicate(pageNumber)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
            title="Duplicate Page"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
