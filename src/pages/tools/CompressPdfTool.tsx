import React, { useState } from 'react';
import { Minimize2, ArrowRight, Check, Sparkles, TrendingDown, RefreshCw } from 'lucide-react';
import { FileUploader } from '../../components/FileUploader';
import { FileCard } from '../../components/FileCard';
import { ProcessingStatus } from '../../components/ProcessingStatus';
import { ResultCard } from '../../components/ResultCard';
import { UploadedFileItem, ProcessingResult, CompressionLevel } from '../../types';
import { compressPdf } from '../../utils/pdfEngine';
import { saveHistoryRecord } from '../../utils/storage';
import { formatBytes, generateOutputFileName } from '../../utils/formatters';

interface CompressPdfToolProps {
  onViewHistory: () => void;
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const CompressPdfTool: React.FC<CompressPdfToolProps> = ({ onViewHistory, showToast }) => {
  const [fileItem, setFileItem] = useState<UploadedFileItem | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('medium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [result, setResult] = useState<ProcessingResult | null>(null);

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

  const getEstimatedSize = (originalSize: number, level: CompressionLevel): number => {
    const ratio = level === 'high' ? 0.45 : level === 'medium' ? 0.65 : 0.85;
    return Math.max(Math.round(originalSize * ratio), 1024);
  };

  const handleCompress = async () => {
    if (!fileItem) return;

    setIsProcessing(true);
    setProgress(10);
    setCurrentStep('Analyzing object streams and font tables...');

    try {
      const { blob, originalSize, outputSize } = await compressPdf(
        fileItem.file,
        compressionLevel,
        (pct, step) => {
          setProgress(pct);
          setCurrentStep(step);
        }
      );

      const outputName = generateOutputFileName(fileItem.name, 'compressed', '.pdf');

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
        toolId: 'compress-pdf',
        toolName: 'Compress PDF',
        fileName: fileItem.name,
        outputFileName: outputName,
        originalSize,
        outputSize,
        status: 'completed',
      });

      const savings = Math.round(((originalSize - outputSize) / originalSize) * 100);
      showToast('success', `PDF compressed successfully! Saved ${savings}%.`);
    } catch (err: any) {
      console.error(err);
      setIsProcessing(false);
      showToast('error', err.message || 'Failed to compress PDF.');
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
          toolName="Compress PDF"
          onReset={handleReset}
          onViewHistory={onViewHistory}
        />
      ) : isProcessing ? (
        <ProcessingStatus
          percent={progress}
          currentStep={currentStep}
          toolName="Compress PDF"
        />
      ) : !fileItem ? (
        <FileUploader
          onFilesSelected={handleFiles}
          allowedExtensions={['.pdf']}
          multiple={false}
          title="Drag & Drop PDF to Compress"
          subtitle="Reduce PDF file size while keeping crisp vector text and graphics."
        />
      ) : (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Select Compression Level
            </h3>
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Change File
            </button>
          </div>

          <FileCard item={fileItem} onRemove={handleReset} />

          {/* Compression Level Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Low Compression */}
            <div
              onClick={() => setCompressionLevel('low')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                compressionLevel === 'low'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Low Compression</span>
                {compressionLevel === 'low' && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Better Quality</p>
              <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-100/70 dark:bg-indigo-950 px-2 py-0.5 rounded">
                ~15% reduction
              </span>
            </div>

            {/* Medium Compression (Recommended) */}
            <div
              onClick={() => setCompressionLevel('medium')}
              className={`relative p-4 rounded-xl border cursor-pointer transition-all ${
                compressionLevel === 'medium'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850'
              }`}
            >
              <span className="absolute -top-2.5 right-3 bg-indigo-600 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                Recommended
              </span>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Medium</span>
                {compressionLevel === 'medium' && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Good balance</p>
              <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-100/70 dark:bg-indigo-950 px-2 py-0.5 rounded">
                ~40% reduction
              </span>
            </div>

            {/* High Compression */}
            <div
              onClick={() => setCompressionLevel('high')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                compressionLevel === 'high'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">High Compression</span>
                {compressionLevel === 'high' && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Smaller File</p>
              <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-100/70 dark:bg-indigo-950 px-2 py-0.5 rounded">
                ~60% reduction
              </span>
            </div>
          </div>

          {/* Real-time Size Estimation Indicator */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs sm:text-sm">
            <div className="space-y-0.5">
              <span className="text-slate-500 dark:text-slate-400">Original Size:</span>
              <p className="font-bold text-slate-800 dark:text-slate-200">{formatBytes(fileItem.size)}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <div className="space-y-0.5 text-right">
              <span className="text-slate-500 dark:text-slate-400">Estimated Size:</span>
              <p className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatBytes(getEstimatedSize(fileItem.size, compressionLevel))}
              </p>
            </div>
          </div>

          <button
            id="compress-pdf-submit-btn"
            onClick={handleCompress}
            className="w-full py-4 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Compress PDF Document</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
