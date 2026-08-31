import React from 'react';
import { HelpCircle, AlertCircle, CheckCircle2, ShieldCheck, FileQuestion } from 'lucide-react';
import { FAQAccordion } from '../components/FAQAccordion';

export const HelpPage: React.FC = () => {
  const troubleshootingGuides = [
    {
      issue: 'Why is my PDF conversion failing?',
      solution:
        'The document might be password-protected or have DRM security restrictions enabled. Remove permissions/passwords in Adobe Acrobat or your PDF reader before uploading.',
    },
    {
      issue: 'Why did the compressed file size not change much?',
      solution:
        'If your PDF is already heavily optimized or consists purely of vector typography without large uncompressed images, additional lossless compression yields smaller gains.',
    },
    {
      issue: 'Images in my converted Word file look low-res?',
      solution:
        'When converting rasterized PDF pages into DOCX, DocuFlow preserves original asset resolution. For crisp typography, ensure the PDF contains actual selectable text rather than flat scanned images.',
    },
    {
      issue: 'How do I combine multiple photos into 1 document?',
      solution:
        'Go to "Images to PDF", select or drag multiple JPG/PNG/WebP files, arrange page order with up/down arrows, and click "Convert to PDF".',
    },
  ];

  return (
    <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-50/80 dark:bg-blue-950/80 border border-blue-200/50 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto backdrop-blur-sm shadow-sm">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Help & Support Center
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Troubleshooting tips, formatting guidelines, and answers to common questions.
        </p>
      </div>

      {/* Troubleshooting Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          <span>Quick Troubleshooting</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {troubleshootingGuides.map((guide, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-white/10 space-y-2 shadow-sm hover:shadow-md transition-all"
            >
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">
                {guide.issue}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {guide.solution}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Supported Specs Matrix */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-white/10 space-y-4 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span>Supported File Standards</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-white/80 dark:border-white/10 backdrop-blur-sm shadow-xs">
            <p className="font-bold text-slate-800 dark:text-white">PDF</p>
            <p className="text-slate-500 dark:text-slate-400 mt-1">PDF 1.3 - 2.0, PDF/A, AcroForms</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-white/80 dark:border-white/10 backdrop-blur-sm shadow-xs">
            <p className="font-bold text-slate-800 dark:text-white">Microsoft Word</p>
            <p className="text-slate-500 dark:text-slate-400 mt-1">.docx (OpenXML), .doc, .rtf, .txt</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-white/80 dark:border-white/10 backdrop-blur-sm shadow-xs">
            <p className="font-bold text-slate-800 dark:text-white">Images</p>
            <p className="text-slate-500 dark:text-slate-400 mt-1">PNG (24/32-bit), JPG/JPEG, WebP</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-white/80 dark:border-white/10 backdrop-blur-sm shadow-xs">
            <p className="font-bold text-slate-800 dark:text-white">Max Capacity</p>
            <p className="text-slate-500 dark:text-slate-400 mt-1">50 MB per file, 50 batch files</p>
          </div>
        </div>
      </div>

      {/* Global FAQ Accordion */}
      <FAQAccordion title="Frequently Asked Questions" showSearch={true} />
    </div>
  );
};
