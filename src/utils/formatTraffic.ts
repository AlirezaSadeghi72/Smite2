/**
 * Traffic and rate formatting utilities.
 */

export function formatTraffic(bytes: number | null | undefined, decimals = 2): string {
  if (bytes === null || bytes === undefined || isNaN(bytes) || bytes < 0) {
    return '0 B';
  }
  if (bytes === 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const safeI = Math.min(i, sizes.length - 1);
  const value = parseFloat((bytes / Math.pow(k, safeI)).toFixed(dm));

  return `${value} ${sizes[safeI]}`;
}

export function formatRate(bytesPerSec: number | null | undefined, decimals = 1): string {
  if (!bytesPerSec || bytesPerSec <= 0) return '0 B/s';
  return `${formatTraffic(bytesPerSec, decimals)}/s`;
}

export function formatUptime(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return '0s';
  const sec = Math.floor(seconds);
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const remSec = sec % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 && days === 0) parts.push(`${minutes}m`);
  if (parts.length === 0 || (days === 0 && hours === 0)) parts.push(`${remSec}s`);

  return parts.join(' ');
}
