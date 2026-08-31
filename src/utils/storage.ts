import { HistoryRecord, UserSettings } from '../types';

const HISTORY_STORAGE_KEY = 'docuflow_history_v1';
const SETTINGS_STORAGE_KEY = 'docuflow_settings_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  language: 'en',
  autoDownload: true,
  processingMode: 'auto',
  deleteHistoryOnClose: false,
};

export function getLocalHistory(): HistoryRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load history from localStorage', err);
    return [];
  }
}

export function saveHistoryRecord(record: Omit<HistoryRecord, 'id' | 'timestamp'>): HistoryRecord {
  try {
    const records = getLocalHistory();
    const newRecord: HistoryRecord = {
      ...record,
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now(),
    };
    // Keep maximum 50 records
    const updated = [newRecord, ...records].slice(0, 50);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return newRecord;
  } catch (err) {
    console.error('Failed to save history record', err);
    return {
      ...record,
      id: `hist_${Date.now()}`,
      timestamp: Date.now(),
    };
  }
}

export function clearLocalHistory(): void {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear history', err);
  }
}

export function removeHistoryRecord(id: string): void {
  try {
    const records = getLocalHistory();
    const updated = records.filter((r) => r.id !== id);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to remove history record', err);
  }
}

export function getUserSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Failed to load settings', err);
    return DEFAULT_SETTINGS;
  }
}

export function saveUserSettings(settings: Partial<UserSettings>): UserSettings {
  try {
    const current = getUserSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save settings', err);
    return DEFAULT_SETTINGS;
  }
}

export const getHistory = getLocalHistory;
export const clearHistory = clearLocalHistory;
export const getSettings = getUserSettings;
export const saveSettings = saveUserSettings;

