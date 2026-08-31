import React, { useState } from 'react';
import { FileType, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { FileUploader } from '../../components/FileUploader';
import { FileCard } from '../../components/FileCard';
import { ProcessingStatus } from '../../components/ProcessingStatus';
import { ResultCard } from '../../components/ResultCard';
import { UploadedFileItem, ProcessingResult } from '../../types';
import { convertWordToPdf } from '../../utils/wordEngine';
import { saveHistoryRecord } from '../../utils/storage';
import { generateOutputFileName } from '../../utils/formatters';

interface WordToPdfToolProps {
  onViewHistory: () => void;
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const WordToPdfTool: React.FC<WordToPdfToolProps> = ({ onViewHistory, showToast }) => {
  const [fileItem, setFileItem] = useState<UploadedFileItem | null>(null);
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

  const handleConvert = async () => {
    if (!fileItem) return;

    setIsProcessing(true);
    setProgress(10);
    setCurrentStep('Parsing Word document elements...');

    try {
      const { blob, size } = await convertWordToPdf(fileItem.file, (pct, step) => {
        setProgress(pct);
        setCurrentStep(step);
      });

      const outputName = generateOutputFileName(fileItem.name, 'converted', '.pdf');

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
        toolId: 'word-to-pdf',
        toolName: 'Word to PDF',
        fileName: fileItem.name,
        outputFileName: outputName,
        originalSize: fileItem.size,
        outputSize: size,
        status: 'completed',
      });

      showToast('success', 'Word document converted to PDF successfully!');
    } catch (err: any) {
      console.error(err);
      setIsProcessing(false);
      showToast('error', err.message || 'Failed to convert Word file. Please verify the file is a valid DOCX or DOC document.');
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
          toolName="Word to PDF"
          onReset={handleReset}
          onViewHistory={onViewHistory}
        />
      ) : isProcessing ? (
        <ProcessingStatus
          percent={progress}
          currentStep={currentStep}
          toolName="Word to PDF"
        />
      ) : !fileItem ? (
        <FileUploader
          onFilesSelected={handleFiles}
          allowedExtensions={['.docx', '.doc', '.txt', '.rtf']}
          multiple={false}
          title="Drag & Drop your Word file here"
          subtitle="Supports .docx, .doc, .txt, and .rtf formats with layout preservation."
        />
      ) : (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Selected Word Document
            </h3>
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Change File
            </button>
          </div>

          <FileCard item={fileItem} onRemove={handleReset} />

          <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <div className="font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Universal Standard PDF</span>
            </div>
            <p>
              Your document formatting, typography, and page breaks will be converted into high-fidelity PDF/A compliant standards.
            </p>
          </div>

          <button
            id="convert-word-to-pdf-btn"
            onClick={handleConvert}
            className="w-full py-4 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Convert to PDF</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
