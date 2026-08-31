import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Monitor,
  Download,
  Shield,
  Trash2,
  CheckCircle2,
  HardDrive,
} from 'lucide-react';
import { UserSettings } from '../types';
import { getSettings, saveSettings, clearHistory } from '../utils/storage';

interface SettingsPageProps {
  darkMode: boolean;
  setDarkMode: (enabled: boolean) => void;
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  darkMode,
  setDarkMode,
  showToast,
}) => {
  const [settings, setSettingsState] = useState<UserSettings>(getSettings());

  useEffect(() => {
    setSettingsState(getSettings());
  }, []);

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettingsState(updated);
    saveSettings(updated);

    if (key === 'theme') {
      if (value === 'dark') setDarkMode(true);
      else if (value === 'light') setDarkMode(false);
      else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(prefersDark);
      }
    }

    showToast('success', 'Preferences updated.');
  };

  const handleClearCache = () => {
    clearHistory();
    showToast('info', 'Local cache and processing history cleared.');
  };

  return (
    <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-white/60 dark:border-white/10 space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-blue-50/80 dark:bg-blue-950/80 border border-blue-200/50 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center backdrop-blur-sm">
            <SettingsIcon className="w-4 h-4" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">
            Workspace Settings
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Configure appearance, default download behaviors, and client-side processing preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* Appearance Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-lg shadow-slate-200/40 dark:shadow-none space-y-4">
          <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Appearance & Theme</span>
          </h3>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'light', label: 'Light', icon: Sun },
              { id: 'dark', label: 'Dark', icon: Moon },
              { id: 'system', label: 'System', icon: Monitor },
            ].map((theme) => {
              const Icon = theme.icon;
              const isSelected = settings.theme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => updateSetting('theme', theme.id as any)}
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-2 font-bold text-xs transition-all cursor-pointer backdrop-blur-sm ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20'
                      : 'border-white/60 dark:border-white/10 bg-white/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{theme.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Behavior Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-lg shadow-slate-200/40 dark:shadow-none space-y-4">
          <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Workflow & Downloads</span>
          </h3>

          <div className="space-y-4 divide-y divide-white/60 dark:divide-white/10">
            {/* Auto Download Toggle */}
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-slate-800 dark:text-white">
                  Automatic Instant Download
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Trigger file save prompt immediately upon successful conversion.
                </p>
              </div>
              <button
                onClick={() => updateSetting('autoDownload', !settings.autoDownload)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.autoDownload ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 shadow-sm absolute top-0.5 ${
                    settings.autoDownload ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* In-Memory Priority Toggle */}
            <div className="flex items-center justify-between pt-4">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-slate-800 dark:text-white">
                  Client-First Processing Guarantee
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Always prefer local WebAssembly execution whenever supported by the format.
                </p>
              </div>
              <button
                onClick={() => updateSetting('preserveClientMemory', !settings.preserveClientMemory)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.preserveClientMemory ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 shadow-sm absolute top-0.5 ${
                    settings.preserveClientMemory ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Local Storage & Cache Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-lg shadow-slate-200/40 dark:shadow-none space-y-4">
          <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-500" />
            <span>Local Storage & Cache</span>
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            DocuFlow stores no personal identifiers. You can instantly reset all local logs, thumbnails, and preference caches.
          </p>

          <button
            onClick={handleClearCache}
            className="px-4 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/80 hover:bg-rose-50/80 dark:hover:bg-rose-950/40 border border-white/60 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-rose-600 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Local Storage Cache</span>
          </button>
        </div>
      </div>
    </div>
  );
};
