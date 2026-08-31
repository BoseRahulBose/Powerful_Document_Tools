import React from 'react';
import { motion } from 'motion/react';

interface ProgressBarProps {
  percent: number;
  label?: string;
  sublabel?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ percent, label, sublabel }) => {
  const safePercent = Math.min(100, Math.max(0, percent));

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
        <span className="text-slate-700 dark:text-slate-200">{label || 'Processing...'}</span>
        <span className="text-indigo-600 dark:text-indigo-400 font-bold font-mono">{safePercent}%</span>
      </div>

      <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700/60 shadow-inner">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500 rounded-full shadow-sm"
          initial={{ width: 0 }}
          animate={{ width: `${safePercent}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      {sublabel && (
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center animate-pulse">
          {sublabel}
        </p>
      )}
    </div>
  );
};
