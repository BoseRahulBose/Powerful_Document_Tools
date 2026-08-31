import React from 'react';
import { Zap, Sparkles, FolderArchive, ShieldCheck, Cpu } from 'lucide-react';

export const TrustSection: React.FC = () => {
  const trustPoints = [
    {
      icon: Zap,
      title: 'Fast Processing',
      description: 'Zero server roundtrip delays for client operations. Instant document manipulation.',
    },
    {
      icon: Sparkles,
      title: 'Easy to Use',
      description: 'Clean, intuitive drag & drop interface built for non-technical users.',
    },
    {
      icon: FolderArchive,
      title: 'Multiple File Formats',
      description: 'Comprehensive support for PDF, DOCX, DOC, JPG, PNG, WEBP, and ZIP files.',
    },
    {
      icon: ShieldCheck,
      title: 'Secure Processing',
      description: 'Client-first architecture ensures your documents remain private on your machine.',
    },
    {
      icon: Cpu,
      title: 'No Complex Software',
      description: 'Runs entirely in your web browser. No bloated software or plugin downloads required.',
    },
  ];

  return (
    <section className="py-12 border-y border-white/60 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
          {trustPoints.map((point, index) => {
            const Icon = point.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center p-4 rounded-2xl hover:bg-white/50 dark:hover:bg-slate-800/40 transition-all border border-transparent hover:border-white/60"
              >
                <div className="w-11 h-11 rounded-2xl bg-blue-50/80 dark:bg-blue-950/80 border border-blue-200/50 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 shadow-sm backdrop-blur-sm">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">
                  {point.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {point.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
