import React from 'react';
import {
  FileText,
  FileType,
  Minimize2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock,
  Sparkles,
  UploadCloud,
} from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  onStartTools: () => void;
  onExploreAll: () => void;
  onSelectSpecificTool: (route: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onStartTools,
  onExploreAll,
  onSelectSpecificTool,
}) => {
  return (
    <section className="relative pt-6 pb-14 md:pt-12 md:pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Heading & CTAs */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div>
              <span className="inline-block px-3 py-1 bg-blue-50/80 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-[11px] font-bold uppercase tracking-wider rounded-md border border-blue-200/50 dark:border-blue-800/40 backdrop-blur-sm mb-4">
                All-in-one workspace
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-[1.1] mb-4 tracking-tight">
                Powerful Document Tools.<br />
                <span className="text-blue-600 dark:text-blue-400">Made Simple.</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-500 dark:text-slate-300 max-w-xl leading-relaxed">
                Convert, compress, merge, split, and manage your PDF and Word files in seconds with zero limits and bank-grade privacy.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                id="hero-primary-cta"
                onClick={onStartTools}
                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/35 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <span>Explore All Tools</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-[10px] font-bold text-blue-700 dark:text-blue-300">
                    PDF
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                    DOC
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                    ZIP
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Client-side private
                </span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Zero Wait Times</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-blue-500" />
                <span>100% In-Browser Privacy</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>High Precision Output</span>
              </div>
            </div>
          </div>

          {/* Right Column: Frosted Glass Dashboard Card */}
          <div className="lg:col-span-6">
            <div className="bg-white/45 dark:bg-slate-900/45 backdrop-blur-2xl border border-white/80 dark:border-white/10 p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
              {/* Pulse light in top right */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Engine Ready
                </span>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
              </div>

              {/* Central Drop Zone Mockup & Direct Tool Trigger */}
              <div
                onClick={onStartTools}
                className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300/60 dark:border-slate-700/60 bg-white/30 dark:bg-slate-800/30 rounded-2xl p-8 sm:p-10 group cursor-pointer hover:bg-white/50 dark:hover:bg-slate-800/50 hover:border-blue-400 dark:hover:border-blue-400 transition-all text-center"
              >
                <div className="w-16 h-16 bg-blue-50/80 dark:bg-blue-950/80 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1.5">
                  Select a document to begin
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-4">
                  Drag & drop your PDF or Word file, or choose from tools below
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  <span className="px-2.5 py-1 bg-white/70 dark:bg-slate-800/70 rounded-md border border-white/80 dark:border-white/10 uppercase">
                    Max 50MB
                  </span>
                  <span className="px-2.5 py-1 bg-white/70 dark:bg-slate-800/70 rounded-md border border-white/80 dark:border-white/10 uppercase">
                    Local Memory
                  </span>
                  <span className="px-2.5 py-1 bg-white/70 dark:bg-slate-800/70 rounded-md border border-white/80 dark:border-white/10 uppercase">
                    Auto-Cleanup
                  </span>
                </div>
              </div>

              {/* Quick Launch Frosted Tool Cards Grid */}
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div
                  onClick={() => onSelectSpecificTool('/pdf-to-word')}
                  className="bg-white/60 dark:bg-slate-800/60 p-3.5 rounded-xl flex flex-col justify-between border border-white/80 dark:border-white/10 hover:bg-white/90 dark:hover:bg-slate-750/90 transition-all cursor-pointer group shadow-sm"
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/80 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-2 group-hover:scale-105 transition-transform">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">PDF to Word</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Editable .docx</p>
                  </div>
                </div>

                <div
                  onClick={() => onSelectSpecificTool('/word-to-pdf')}
                  className="bg-white/60 dark:bg-slate-800/60 p-3.5 rounded-xl flex flex-col justify-between border border-white/80 dark:border-white/10 hover:bg-white/90 dark:hover:bg-slate-750/90 transition-all cursor-pointer group shadow-sm"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/80 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-105 transition-transform">
                    <FileType className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">Word to PDF</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Universal layout</p>
                  </div>
                </div>

                <div
                  onClick={() => onSelectSpecificTool('/compress-pdf')}
                  className="bg-white/60 dark:bg-slate-800/60 p-3.5 rounded-xl flex flex-col justify-between border border-white/80 dark:border-white/10 hover:bg-white/90 dark:hover:bg-slate-750/90 transition-all cursor-pointer group shadow-sm"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2 group-hover:scale-105 transition-transform">
                    <Minimize2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">Compress</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Reduce size</p>
                  </div>
                </div>

                <div
                  onClick={() => onSelectSpecificTool('/merge-pdf')}
                  className="bg-white/60 dark:bg-slate-800/60 p-3.5 rounded-xl flex flex-col justify-between border border-white/80 dark:border-white/10 hover:bg-white/90 dark:hover:bg-slate-750/90 transition-all cursor-pointer group shadow-sm"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2 group-hover:scale-105 transition-transform">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">Merge PDF</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Combine files</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
