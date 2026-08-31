import React, { useState } from 'react';
import { FileImage, ArrowRight, RefreshCw, Layers } from 'lucide-react';
import { FileUploader } from '../../components/FileUploader';
import { FileCard } from '../../components/FileCard';
import { ProcessingStatus } from '../../components/ProcessingStatus';
import { ResultCard } from '../../components/ResultCard';
import { UploadedFileItem, ProcessingResult } from '../../types';
import { convertPdfToImages, inspectPdfDocument } from '../../utils/pdfEngine';
import { saveHistoryRecord } from '../../utils/storage';

interface PdfToImageToolProps {
  onViewHistory: () => void;
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const PdfToImageTool: React.FC<PdfToImageToolProps> = ({ onViewHistory, showToast }) => {
  const [fileItem, setFileItem] = useState<UploadedFileItem | null>(null);
  const [imageFormat, setImageFormat] = useState<'png' | 'jpeg'>('png');
  const [dpiQuality, setDpiQuality] = useState<72 | 150 | 300>(150);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [result, setResult] = useState<ProcessingResult | null>(null);

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    try {
      const info = await inspectPdfDocument(file);
      setFileItem({
        id: `file_${Date.now()}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        pageCount: info.pageCount,
        pages: info.pages,
      });
    } catch (e) {
      setFileItem({
        id: `file_${Date.now()}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
      });
    }
    setResult(null);
  };

  const handleConvert = async () => {
    if (!fileItem) return;

    setIsProcessing(true);
    setProgress(5);
    setCurrentStep('Rendering high-fidelity raster images...');

    try {
      const qualityMode = dpiQuality === 300 ? 'maximum' : dpiQuality === 150 ? 'high' : 'standard';
      const { blob, size, isZip, images } = await convertPdfToImages(
        fileItem.file,
        imageFormat,
        qualityMode,
        (pct, step) => {
          setProgress(pct);
          setCurrentStep(step);
        }
      );

      const baseName = fileItem.name.replace(/\.[^/.]+$/, '');
      const outputName = isZip ? `${baseName}_images.zip` : `${baseName}_page_1.${imageFormat}`;

      const processResult: ProcessingResult = {
        success: true,
        blob,
        fileName: outputName,
        originalSize: fileItem.size,
        outputSize: size,
        additionalFiles: images?.map((img) => ({
          name: img.name,
          blob: img.blob,
          downloadUrl: img.dataUrl,
        })),
      };


      setResult(processResult);
      setIsProcessing(false);

      saveHistoryRecord({
        toolId: 'pdf-to-image',
        toolName: 'PDF to Images',
        fileName: fileItem.name,
        outputFileName: outputName,
        originalSize: fileItem.size,
        outputSize: size,
        status: 'completed',
      });

      showToast('success', `Exported PDF pages to ${imageFormat.toUpperCase()} images!`);
    } catch (err: any) {
      console.error(err);
      setIsProcessing(false);
      showToast('error', err.message || 'Failed to extract images from PDF.');
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
          toolName="PDF to Images"
          onReset={handleReset}
          onViewHistory={onViewHistory}
        />
      ) : isProcessing ? (
        <ProcessingStatus
          percent={progress}
          currentStep={currentStep}
          toolName="PDF to Images"
        />
      ) : !fileItem ? (
        <FileUploader
          onFilesSelected={handleFiles}
          allowedExtensions={['.pdf']}
          multiple={false}
          title="Drag & Drop PDF to Convert to Images"
          subtitle="Extract high-resolution JPG or PNG images from each page in your PDF."
        />
      ) : (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Export Configuration
            </h3>
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Change File
            </button>
          </div>

          <FileCard item={fileItem} onRemove={handleReset} />

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            {/* Format */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Image Format</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setImageFormat('png')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    imageFormat === 'png'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  PNG (Lossless)
                </button>
                <button
                  type="button"
                  onClick={() => setImageFormat('jpeg')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    imageFormat === 'jpeg'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  JPG (Compact)
                </button>
              </div>
            </div>

            {/* Quality DPI */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Rendering Resolution</label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setDpiQuality(72)}
                  className={`py-2 px-2 rounded-lg text-xs font-bold ${
                    dpiQuality === 72
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  72 DPI
                </button>
                <button
                  type="button"
                  onClick={() => setDpiQuality(150)}
                  className={`py-2 px-2 rounded-lg text-xs font-bold ${
                    dpiQuality === 150
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  150 DPI
                </button>
                <button
                  type="button"
                  onClick={() => setDpiQuality(300)}
                  className={`py-2 px-2 rounded-lg text-xs font-bold ${
                    dpiQuality === 300
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  300 DPI
                </button>
              </div>
            </div>
          </div>

          <button
            id="pdf-to-image-submit-btn"
            onClick={handleConvert}
            className="w-full py-4 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileImage className="w-4 h-4" />
            <span>Convert PDF to {imageFormat.toUpperCase()}</span>
          </button>
        </div>
      )}
    </div>
  );
};
