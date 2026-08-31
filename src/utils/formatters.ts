/**
 * Format raw byte size into human-readable string (Bytes, KB, MB, GB)
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 Bytes';
  if (bytes < 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const safeI = Math.min(i, sizes.length - 1);

  return `${parseFloat((bytes / Math.pow(k, safeI)).toFixed(dm))} ${sizes[safeI]}`;
}

/**
 * Format timestamp into relative or readable string
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (isToday) {
    return `Today, ${timeString}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return `Yesterday, ${timeString}`;
  }

  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeString}`;
}

/**
 * Generate a clean output filename based on tool action
 */
export function generateOutputFileName(originalName: string, prefixOrSuffix: string, newExtension?: string): string {
  const lastDotIndex = originalName.lastIndexOf('.');
  const baseName = lastDotIndex !== -1 ? originalName.substring(0, lastDotIndex) : originalName;
  const currentExt = lastDotIndex !== -1 ? originalName.substring(lastDotIndex) : '';
  const ext = newExtension ? (newExtension.startsWith('.') ? newExtension : `.${newExtension}`) : currentExt;

  return `${baseName}_${prefixOrSuffix}${ext}`;
}

/**
 * Validate allowed extensions
 */
export function isExtensionAllowed(fileName: string, allowedExtensions: string[]): boolean {
  const lowerName = fileName.toLowerCase();
  return allowedExtensions.some((ext) => lowerName.endsWith(ext.toLowerCase()));
}
