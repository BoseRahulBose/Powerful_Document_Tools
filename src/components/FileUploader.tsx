import React, { useRef, useState } from 'react';
import { UploadCloud, File, AlertCircle, Plus, Sparkles } from 'lucide-react';
import { formatBytes, isExtensionAllowed } from '../utils/formatters';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  allowedExtensions: string[];
  multiple?: boolean;
  maxSizeBytes?: number;
  title?: string;
  subtitle?: string;
  isCompact?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesSelected,
  allowedExtensions,
  multiple = false,
  maxSizeBytes = 50 * 1024 * 1024, // 50MB
  title,
  subtitle,
  isCompact = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndAddFiles = (fileList: FileList | null) => {
    setErrorMessage(null);
    if (!fileList || fileList.length === 0) return;

    const validFiles: File[] = [];
    const filesArray = Array.from(fileList);

    for (const file of filesArray) {
      // Check extension
      if (!isExtensionAllowed(file.name, allowedExtensions)) {
        setErrorMessage(
          `Invalid file format for "${file.name}". Supported: ${allowedExtensions.join(', ')}`
        );
        return;
      }

      // Check size
      if (file.size > maxSizeBytes) {
        setErrorMessage(
          `"${file.name}" is too large. Maximum allowed size is ${formatBytes(maxSizeBytes)}.`
        );
        return;
      }

      validFiles.push(file);
      if (!multiple) break; // only first file if single mode
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    validateAndAddFiles(e.dataTransfer.files);
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const acceptString = allowedExtensions.join(',');

  if (isCompact) {
    return (
      <div className="w-full">
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptString}
          multiple={multiple}
          onChange={(e) => validateAndAddFiles(e.target.files)}
          className="hidden"
        />
        <button
          onClick={handleBrowseClick}
          className="w-full py-3.5 px-4 rounded-2xl border-2 border-dashed border-slate-300/80 dark:border-slate-700/80 hover:border-blue-500 dark:hover:border-blue-500 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md hover:bg-white/70 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200 transition-all flex items-center justify-center gap-2 text-sm font-semibold cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4 text-blue-500" />
          <span>Add more files ({allowedExtensions.join(', ')})</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptString}
        multiple={multiple}
        onChange={(e) => validateAndAddFiles(e.target.files)}
        className="hidden"
      />

      <div
        id="drag-drop-upload-zone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        className={`relative group cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-300 p-8 sm:p-14 text-center flex flex-col items-center justify-center gap-4 backdrop-blur-xl ${
          isDragOver
            ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/60 scale-[1.01] shadow-2xl shadow-blue-500/20'
            : 'border-slate-300/70 dark:border-slate-700/70 hover:border-blue-400 dark:hover:border-blue-400 bg-white/40 dark:bg-slate-900/40 hover:bg-white/65 dark:hover:bg-slate-850/65 shadow-lg shadow-slate-200/40 dark:shadow-none'
        }`}
      >
        {/* Upload Icon Circle */}
        <div
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shadow-sm ${
            isDragOver
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-blue-50/90 dark:bg-blue-950/90 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 backdrop-blur-sm'
          }`}
        >
          <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>

        {/* Headings */}
        <div className="space-y-1.5 max-w-md">
          <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">
            {title || (multiple ? 'Choose files or drag & drop here' : 'Choose a file or drag & drop here')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {subtitle || 'Supports high-speed in-browser conversion with 100% privacy.'}
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 group-hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-500/25 group-hover:shadow-lg transition-all">
            <File className="w-4 h-4" />
            {multiple ? 'Select Files' : 'Select File'}
          </span>
        </div>

        {/* Formats and Size Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-3 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="bg-white/70 dark:bg-slate-800/70 border border-white/80 dark:border-white/10 px-2.5 py-1 rounded-md font-mono backdrop-blur-sm">
            {allowedExtensions.join(' ')}
          </span>
          <span>•</span>
          <span>Max size: {formatBytes(maxSizeBytes)}</span>
          {multiple && (
            <>
              <span>•</span>
              <span className="text-blue-600 dark:text-blue-400 font-semibold">Multiple files supported</span>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-4 p-3.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-center gap-2 animate-in fade-in backdrop-blur-md">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
