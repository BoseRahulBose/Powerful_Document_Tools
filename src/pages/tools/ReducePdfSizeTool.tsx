import React, { useState } from 'react';
import { Scale, ArrowRight, AlertTriangle, Check, RefreshCw } from 'lucide-react';
import { FileUploader } from '../../components/FileUploader';
import { FileCard } from '../../components/FileCard';
import { ProcessingStatus } from '../../components/ProcessingStatus';
import { ResultCard } from '../../components/ResultCard';
import { UploadedFileItem, ProcessingResult } from '../../types';
import { compressPdf } from '../../utils/pdfEngine';
import { saveHistoryRecord } from '../../utils/storage';
import { formatBytes, generateOutputFileName } from '../../utils/formatters';

interface ReducePdfSizeToolProps {
  onViewHistory: () => void;
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const ReducePdfSizeTool: React.FC<ReducePdfSizeToolProps> = ({ onViewHistory, showToast }) => {
  const [fileItem, setFileItem] = useState<UploadedFileItem | null>(null);
  const [targetLimitMb, setTargetLimitMb] = useState<number>(2);
  const [customMb, setCustomMb] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [result, setResult] = useState<ProcessingResult | null>(null);

  const targets = [
    { label: 'Under 10 MB', value: 10 },
    { label: 'Under 5 MB', value: 5 },
    { label: 'Under 2 MB', value: 2 },
    { label: 'Under 1 MB', value: 1 },
  ];

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setFileItem({
      id: `file_${Date.now()}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
    });
    setResult(null);
  };

  const currentLimit = customMb ? parseFloat(customMb) || 2 : targetLimitMb;
  const isExtremeReduction = fileItem && fileItem.size > currentLimit * 1024 * 1024 * 4;

  const handleOptimize = async () => {
    if (!fileItem) return;

    setIsProcessing(true);
    setProgress(10);
    setCurrentStep(`Targeting reduction to under ${currentLimit} MB...`);

    try {
      const level = currentLimit <= 1 ? 'high' : currentLimit <= 5 ? 'medium' : 'low';
      const { blob, originalSize, outputSize } = await compressPdf(
        fileItem.file,
        level,
        (pct, step) => {
          setProgress(pct);
          setCurrentStep(step);
        }
      );

      const outputName = generateOutputFileName(fileItem.name, `under_${currentLimit}mb`, '.pdf');

      const processResult: ProcessingResult = {
        success: true,
        blob,
        fileName: outputName,
        originalSize,
        outputSize,
      };

      setResult(processResult);
      setIsProcessing(false);

      saveHistoryRecord({
        toolId: 'reduce-pdf-size',
        toolName: 'Reduce PDF Size',
        fileName: fileItem.name,
        outputFileName: outputName,
        originalSize,
        outputSize,
        status: 'completed',
      });

      showToast('success', `PDF reduced to target size (${formatBytes(outputSize)}).`);
    } catch (err: any) {
      console.error(err);
      setIsProcessing(false);
      showToast('error', err.message || 'Failed to optimize PDF to target size.');
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
          toolName="Reduce PDF Size"
          onReset={handleReset}
          onViewHistory={onViewHistory}
        />
      ) : isProcessing ? (
        <ProcessingStatus
          percent={progress}
          currentStep={currentStep}
          toolName="Reduce PDF Size"
        />
      ) : !fileItem ? (
        <FileUploader
          onFilesSelected={handleFiles}
          allowedExtensions={['.pdf']}
          multiple={false}
          title="Drag & Drop PDF to Reduce Size"
          subtitle="Specify target file size limits for email or portal uploads."
        />
      ) : (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Choose Target File Size Limit
            </h3>
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Change File
            </button>
          </div>

          <FileCard item={fileItem} onRemove={handleReset} />

          {/* Target options */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {targets.map((t) => {
              const isSelected = !customMb && targetLimitMb === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => {
                    setCustomMb('');
                    setTargetLimitMb(t.value);
                  }}
                  className={`p-3.5 rounded-xl border text-center font-bold text-xs sm:text-sm transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Custom Size Input */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
              Or Custom Target:
            </span>
            <div className="flex items-center gap-2 flex-1 max-w-[140px]">
              <input
                type="number"
                min="0.5"
                max="50"
                step="0.5"
                placeholder="e.g. 3.5"
                value={customMb}
                onChange={(e) => setCustomMb(e.target.value)}
                className="w-full px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="text-xs font-bold text-slate-500">MB</span>
            </div>
          </div>

          {/* Quality warning if target is extremely small compared to current */}
          {isExtremeReduction && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Quality Notice:</strong> Reducing a {formatBytes(fileItem.size)} document down to under {currentLimit} MB requires aggressive compression. Vector text will remain crisp, but high-res photos may be downscaled.
              </span>
            </div>
          )}

          <button
            id="reduce-pdf-submit-btn"
            onClick={handleOptimize}
            className="w-full py-4 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Reduce to Target Size</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
