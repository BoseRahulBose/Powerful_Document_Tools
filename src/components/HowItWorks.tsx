import React from 'react';
import { UploadCloud, Sliders, DownloadCloud, ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Upload',
      desc: 'Choose your document or drag it into the clean upload area.',
      icon: UploadCloud,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/80 border border-blue-200/50 dark:border-blue-900/40',
    },
    {
      num: '02',
      title: 'Process',
      desc: 'Select your desired operation and let DocuFlow process it seamlessly.',
      icon: Sliders,
      color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50/80 dark:bg-cyan-950/80 border border-cyan-200/50 dark:border-cyan-900/40',
    },
    {
      num: '03',
      title: 'Download',
      desc: 'Download your converted or optimized file instantly to your computer.',
      icon: DownloadCloud,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/80 border border-emerald-200/50 dark:border-emerald-900/40',
    },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <span className="text-xs uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
            Effortless Workflow
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How DocuFlow Works
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
            Three simple steps to manage, convert, and optimize any document in your browser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative p-8 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-lg shadow-slate-200/40 dark:shadow-none hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 space-y-4"
              >
                {/* Number Badge */}
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm backdrop-blur-sm ${step.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-2xl font-black text-slate-300/80 dark:text-slate-700">
                    {step.num}
                  </span>
                </div>

                <div className="space-y-2 pt-2">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
