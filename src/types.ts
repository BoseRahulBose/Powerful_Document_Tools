export type ToolId =
  | 'pdf-to-word'
  | 'word-to-pdf'
  | 'compress-pdf'
  | 'reduce-pdf-size'
  | 'merge-pdf'
  | 'split-pdf'
  | 'rotate-pdf'
  | 'delete-pdf-pages'
  | 'extract-pdf-pages'
  | 'organize-pdf'
  | 'image-to-pdf'
  | 'pdf-to-image'
  | 'compress-word'
  | 'reduce-word-size'
  | 'optimize-word'
  | 'word-optimizer';


export type ToolCategory = 'all' | 'pdf' | 'word' | 'image' | 'organize';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface PdfPageInfo {
  pageNumber: number;
  rotation: number;
  thumbnailUrl?: string;
  selected?: boolean;
  deleted?: boolean;
}

export interface ToolDefinition {
  id: ToolId;
  name: string;
  shortDescription: string;
  longDescription: string;
  category: ToolCategory;
  supportedFormats: string[];
  outputFormat: string;
  iconName: string;
  isPopular?: boolean;
  isNew?: boolean;
  route: string;
  howToSteps: { title: string; desc: string }[];
  faqs: { question: string; answer: string }[];
}

export interface UploadedFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  pageCount?: number;
  previewUrl?: string;
  pages?: PdfPageInfo[];
}

export type ProcessingState = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';

export interface ProcessingProgress {
  state: ProcessingState;
  percent: number;
  currentStep: string;
  errorMessage?: string;
}

export interface ProcessingResult {
  success: boolean;
  downloadUrl?: string;
  blob?: Blob;
  fileName: string;
  originalSize: number;
  outputSize: number;
  processingTimeMs?: number;
  additionalFiles?: { name: string; blob: Blob; downloadUrl?: string }[];
  message?: string;
}

export interface HistoryRecord {
  id: string;
  toolId: string;
  toolName: string;
  fileName: string;
  outputFileName: string;
  originalSize: number;
  outputSize?: number;
  timestamp: number;
  status: 'completed' | 'failed';
}

export type HistoryItem = HistoryRecord;

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'es' | 'fr' | 'de' | 'ja';
  autoDownload: boolean;
  processingMode: 'auto' | 'client' | 'server';
  deleteHistoryOnClose: boolean;
  preserveClientMemory?: boolean;
}

export type CompressionLevel = 'low' | 'medium' | 'high';

