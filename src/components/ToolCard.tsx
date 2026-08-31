import React from 'react';
import {
  FileText,
  FileType,
  Minimize2,
  Scale,
  Layers,
  Scissors,
  RotateCw,
  Trash2,
  Copy,
  Grid,
  Image as ImageIcon,
  FileImage,
  FileCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { ToolDefinition } from '../types';

interface ToolCardProps {
  tool: ToolDefinition;
  onClick: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  FileText,
  FileType,
  Minimize2,
  Scale,
  Layers,
  Scissors,
  RotateCw,
  Trash2,
  Copy,
  Grid,
  Image: ImageIcon,
  FileImage,
  FileCheck,
};

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onClick }) => {
  const IconComponent = ICON_MAP[tool.iconName] || FileText;

  // Custom accent badge based on category
  const categoryColor =
    tool.category === 'pdf'
      ? 'from-red-500/10 to-rose-500/10 text-red-600 dark:text-red-400 border-red-200/60 dark:border-red-900/40'
      : tool.category === 'word'
      ? 'from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-900/40'
      : tool.category === 'image'
      ? 'from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-900/40'
      : 'from-purple-500/10 to-violet-500/10 text-purple-600 dark:text-purple-400 border-purple-200/60 dark:border-purple-900/40';

  return (
    <div
      id={`tool-card-${tool.id}`}
      onClick={onClick}
      className="group relative flex flex-col justify-between p-6 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-lg shadow-slate-200/40 dark:shadow-black/30 hover:bg-white/85 dark:hover:bg-slate-850/85 hover:border-blue-400/70 dark:hover:border-blue-500/50 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden text-left"
    >
      {/* Top Bar: Icon + Badges */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${categoryColor} border flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm backdrop-blur-sm`}
          >
            <IconComponent className="w-6 h-6" />
          </div>

          {tool.isPopular && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-amber-50/80 dark:bg-amber-950/80 border border-amber-200/80 dark:border-amber-800 text-amber-700 dark:text-amber-300 backdrop-blur-sm">
              <Sparkles className="w-3 h-3" /> Popular
            </span>
          )}
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {tool.name}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {tool.shortDescription}
          </p>
        </div>
      </div>

      {/* Bottom Bar: Format Tags + Arrow */}
      <div className="mt-5 pt-4 border-t border-white/60 dark:border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
          <span className="bg-white/70 dark:bg-slate-800/70 border border-white/80 dark:border-white/10 px-2 py-0.5 rounded-md backdrop-blur-sm">
            {tool.supportedFormats[0]}
          </span>
          <span>→</span>
          <span className="bg-blue-50/80 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-semibold px-2 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-800/40 backdrop-blur-sm">
            {tool.outputFormat}
          </span>
        </div>

        <div className="w-7 h-7 rounded-full bg-white/70 dark:bg-slate-800/70 border border-white/80 dark:border-white/10 group-hover:bg-blue-600 text-slate-500 dark:text-slate-300 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm">
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};
