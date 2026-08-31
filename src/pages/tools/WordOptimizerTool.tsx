import React, { useState } from 'react';
import { FileType, ArrowRight, RefreshCw, CheckCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { FileUploader } from '../../components/FileUploader';
import { FileCard } from '../../components/FileCard';
import { ProcessingStatus } from '../../components/ProcessingStatus';
import { ResultCard } from '../../components/ResultCard';
import { UploadedFileItem, ProcessingResult } from '../../types';
import { optimizeWordDocx } from '../../utils/wordEngine';
import { saveHistoryRecord } from '../../utils/storage';
import { generateOutputFileName } from '../../utils/formatters';

interface WordOptimizerToolProps {
  mode: 'compress' | 'reduce' | 'optimize';
  title: string;
  toolId: string;
  onViewHistory: () => void;
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const WordOptimizerTool: React.FC<WordOptimizerToolProps> = ({
  mode,
  title,
  toolId,
  onViewHistory,
  showToast,
}) => {
  const [fileItem, setFileItem] = useState<UploadedFileItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [result, setResult] = useState<ProcessingResult | null>(null);

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setFileItem({
      id: `word_${Date.now()}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
    });
    setResult(null);
  };

  const handleProcess = async () => {
    if (!fileItem) return;

    setIsProcessing(true);
    setProgress(10);
    setCurrentStep('Analyzing Word OpenXML archive components...');

    try {
      const { blob, originalSize, outputSize } = await optimizeWordDocx(fileItem.file, (pct, step) => {
        setProgress(pct);
        setCurrentStep(step);
      });

      const suffix = mode === 'compress' ? 'compressed' : mode === 'reduce' ? 'reduced' : 'optimized';
      const outputName = generateOutputFileName(fileItem.name, suffix, '.docx');

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
        toolId,
        toolName: title,
        fileName: fileItem.name,
        outputFileName: outputName,
        originalSize,
        outputSize,
        status: 'completed',
      });

      showToast('success', `${title} completed successfully!`);
    } catch (err: any) {
      console.error(err);
      setIsProcessing(false);
      showToast('error', err.message || 'Failed to optimize Word document.');
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
          toolName={title}
          onReset={handleReset}
          onViewHistory={onViewHistory}
        />
      ) : isProcessing ? (
        <ProcessingStatus
          percent={progress}
          currentStep={currentStep}
          toolName={title}
        />
      ) : !fileItem ? (
        <FileUploader
          onFilesSelected={handleFiles}
          allowedExtensions={['.docx', '.doc']}
          multiple={false}
          title={`Drag & Drop Word File to ${title}`}
          subtitle="Strip bloated metadata, compact embedded schemas, and maximize compatibility."
        />
      ) : (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Selected Word File
            </h3>
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Change File
            </button>
          </div>

          <FileCard item={fileItem} onRemove={handleReset} />

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Optimization Plan</span>
            </div>
            <ul className="space-y-1 pl-4 list-disc text-slate-500 dark:text-slate-400">
              <li>Re-compresses XML schema trees using high DEFLATE compression.</li>
              <li>Purges orphan revision tags and unlinked media thumbnails.</li>
              <li>Validates strict ECMA-376 / ISO/IEC 29500 Office Open XML standards.</li>
            </ul>
          </div>

          <button
            id="word-optimizer-submit-btn"
            onClick={handleProcess}
            className="w-full py-4 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{title}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
