import React, { useState } from 'react';
import { Image as ImageIcon, ArrowRight, RefreshCw, Layers } from 'lucide-react';
import { FileUploader } from '../../components/FileUploader';
import { FileCard } from '../../components/FileCard';
import { ProcessingStatus } from '../../components/ProcessingStatus';
import { ResultCard } from '../../components/ResultCard';
import { UploadedFileItem, ProcessingResult } from '../../types';
import { convertImagesToPdf } from '../../utils/pdfEngine';
import { saveHistoryRecord } from '../../utils/storage';
import { formatBytes } from '../../utils/formatters';

interface ImageToPdfToolProps {
  onViewHistory: () => void;
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const ImageToPdfTool: React.FC<ImageToPdfToolProps> = ({ onViewHistory, showToast }) => {
  const [fileItems, setFileItems] = useState<UploadedFileItem[]>([]);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margin, setMargin] = useState<'none' | 'small' | 'big'>('small');
  const [fit, setFit] = useState<'fit' | 'fill'>('fit');

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [result, setResult] = useState<ProcessingResult | null>(null);

  const handleFiles = (files: File[]) => {
    const newItems: UploadedFileItem[] = files.map((f) => ({
      id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      file: f,
      name: f.name,
      size: f.size,
      type: f.type,
    }));
    setFileItems((prev) => [...prev, ...newItems]);
    setResult(null);
  };

  const handleRemove = (id: string) => {
    setFileItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setFileItems((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
      return updated;
    });
  };

  const handleMoveDown = (index: number) => {
    setFileItems((prev) => {
      if (index === prev.length - 1) return prev;
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
      return updated;
    });
  };

  const handleConvert = async () => {
    if (fileItems.length === 0) return;

    setIsProcessing(true);
    setProgress(5);
    setCurrentStep('Converting photos into PDF pages...');

    try {
      const rawFiles = fileItems.map((item) => item.file);
      const totalOriginalSize = fileItems.reduce((acc, f) => acc + f.size, 0);

      const { blob, size } = await convertImagesToPdf(
        rawFiles,
        { orientation, margin, fit },
        (pct, step) => {
          setProgress(pct);
          setCurrentStep(step);
        }
      );

      const outputName = fileItems.length === 1
        ? fileItems[0].name.replace(/\.[^/.]+$/, '') + '.pdf'
        : 'converted_images.pdf';

      const processResult: ProcessingResult = {
        success: true,
        blob,
        fileName: outputName,
        originalSize: totalOriginalSize,
        outputSize: size,
      };

      setResult(processResult);
      setIsProcessing(false);

      saveHistoryRecord({
        toolId: 'image-to-pdf',
        toolName: 'Images to PDF',
        fileName: `${fileItems.length} images`,
        outputFileName: outputName,
        originalSize: totalOriginalSize,
        outputSize: size,
        status: 'completed',
      });

      showToast('success', `Created PDF from ${fileItems.length} images!`);
    } catch (err: any) {
      console.error(err);
      setIsProcessing(false);
      showToast('error', err.message || 'Failed to convert images to PDF.');
    }
  };

  const handleReset = () => {
    setFileItems([]);
    setResult(null);
    setIsProcessing(false);
  };

  const totalBytes = fileItems.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="space-y-6">
      {result ? (
        <ResultCard
          result={result}
          toolName="Images to PDF"
          onReset={handleReset}
          onViewHistory={onViewHistory}
        />
      ) : isProcessing ? (
        <ProcessingStatus
          percent={progress}
          currentStep={currentStep}
          toolName="Images to PDF"
        />
      ) : fileItems.length === 0 ? (
        <FileUploader
          onFilesSelected={handleFiles}
          allowedExtensions={['.jpg', '.jpeg', '.png', '.webp']}
          multiple={true}
          title="Drag & Drop Images (JPG, PNG, WebP)"
          subtitle="Assemble multiple photos into a crisp, multi-page PDF document."
        />
      ) : (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Configure PDF Layout ({fileItems.length} images)
            </h3>
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Clear all
            </button>
          </div>

          {/* Configuration Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            {/* Orientation */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Orientation</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setOrientation('portrait')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold ${
                    orientation === 'portrait'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Portrait
                </button>
                <button
                  type="button"
                  onClick={() => setOrientation('landscape')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold ${
                    orientation === 'landscape'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Landscape
                </button>
              </div>
            </div>

            {/* Margins */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Margin</label>
              <div className="grid grid-cols-3 gap-1">
                {(['none', 'small', 'big'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMargin(m)}
                    className={`py-1.5 px-1.5 rounded-lg text-xs font-semibold capitalize ${
                      margin === m
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Fit */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Image Sizing</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setFit('fit')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold ${
                    fit === 'fit'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Fit Page
                </button>
                <button
                  type="button"
                  onClick={() => setFit('fill')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold ${
                    fit === 'fill'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Fill Page
                </button>
              </div>
            </div>
          </div>

          {/* Files List */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {fileItems.map((item, index) => (
              <FileCard
                key={item.id}
                item={item}
                index={index}
                total={fileItems.length}
                showReorder={true}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onRemove={handleRemove}
              />
            ))}
          </div>

          <FileUploader
            onFilesSelected={handleFiles}
            allowedExtensions={['.jpg', '.jpeg', '.png', '.webp']}
            multiple={true}
            isCompact={true}
          />

          <button
            id="image-to-pdf-submit-btn"
            onClick={handleConvert}
            className="w-full py-4 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Convert {fileItems.length} Images to PDF</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
