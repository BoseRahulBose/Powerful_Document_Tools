import React from 'react';
import { ChevronRight, Home, CheckCircle2, ArrowRight, Shield, Sparkles } from 'lucide-react';
import { ToolDefinition } from '../types';
import { TOOLS_DATA } from '../data/toolsData';
import { FAQAccordion } from '../components/FAQAccordion';

interface ToolLayoutProps {
  tool: ToolDefinition;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export const ToolLayout: React.FC<ToolLayoutProps> = ({
  tool,
  onNavigate,
  children,
}) => {
  // Related tools
  const relatedTools = TOOLS_DATA.filter((t) => t.id !== tool.id).slice(0, 3);

  return (
    <div className="min-h-[calc(100vh-16rem)] py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Breadcrumb Header */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/60 dark:border-white/10 w-fit shadow-sm">
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <button
          onClick={() => onNavigate(`/#${tool.category}-tools`)}
          className="capitalize hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
        >
          {tool.category} Tools
        </button>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="font-semibold text-slate-800 dark:text-white">{tool.name}</span>
      </nav>

      {/* Title & Description Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/80 dark:bg-blue-950/80 border border-blue-200/50 dark:border-blue-800/40 text-xs font-semibold text-blue-700 dark:text-blue-300 backdrop-blur-sm shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>High Precision Document Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {tool.name}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          {tool.longDescription}
        </p>
      </div>

      {/* Main Interactive Tool Work Area (Passed as children) */}
      <div className="max-w-4xl mx-auto">{children}</div>

      {/* How To Steps */}
      <div className="max-w-4xl mx-auto pt-8 border-t border-white/60 dark:border-white/10 space-y-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white text-center">
          How to use {tool.name}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tool.howToSteps.map((step, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white/55 dark:bg-slate-900/55 backdrop-blur-xl border border-white/80 dark:border-white/10 space-y-2.5 text-left shadow-lg shadow-slate-200/30 dark:shadow-none"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-50/90 dark:bg-blue-950/90 border border-blue-200/50 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center backdrop-blur-sm">
                {idx + 1}
              </div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">{step.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ for Tool */}
      {tool.faqs && tool.faqs.length > 0 && (
        <FAQAccordion
          customFaqs={tool.faqs}
          title={`${tool.name} FAQs`}
          showSearch={false}
        />
      )}

      {/* Related Tools */}
      <div className="max-w-4xl mx-auto pt-8 border-t border-white/60 dark:border-white/10 space-y-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white text-center">
          Related Tools You Might Need
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {relatedTools.map((rTool) => (
            <button
              key={rTool.id}
              onClick={() => onNavigate(rTool.route)}
              className="p-5 rounded-2xl bg-white/55 dark:bg-slate-900/55 backdrop-blur-xl border border-white/80 dark:border-white/10 hover:border-blue-400/80 text-left transition-all group flex flex-col justify-between cursor-pointer shadow-sm hover:shadow-md"
            >
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {rTool.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {rTool.shortDescription}
                </p>
              </div>
              <div className="mt-3 text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <span>Use tool</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
