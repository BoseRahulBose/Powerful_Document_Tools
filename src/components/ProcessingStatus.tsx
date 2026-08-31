import React from 'react';
import { Loader2, Shield, Sparkles } from 'lucide-react';
import { ProgressBar } from './ProgressBar';

interface ProcessingStatusProps {
  percent: number;
  currentStep: string;
  toolName: string;
  onCancel?: () => void;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  percent,
  currentStep,
  toolName,
  onCancel,
}) => {
  return (
    <div className="w-full max-w-lg mx-auto p-8 rounded-3xl bg-white/65 dark:bg-slate-900/65 backdrop-blur-2xl border border-white/80 dark:border-white/10 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
      {/* Animated icon */}
      <div className="relative mx-auto w-16 h-16 rounded-2xl bg-blue-50/80 dark:bg-blue-950/80 border border-blue-200/50 dark:border-blue-800/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm backdrop-blur-sm">
        <Loader2 className="w-8 h-8 animate-spin" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 animate-ping" />
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">
          Processing {toolName}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Your files are processed securely directly within your workspace.
        </p>
      </div>

      {/* Progress */}
      <div className="pt-2">
        <ProgressBar percent={percent} label={currentStep} />
      </div>

      {/* Trust Notice */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-white/60 dark:border-white/10">
        <Shield className="w-3.5 h-3.5 text-emerald-500" />
        <span>End-to-end memory isolated & auto-cleaned</span>
      </div>

      {onCancel && (
        <button
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline cursor-pointer"
        >
          Cancel operation
        </button>
      )}
    </div>
  );
};
