import { TimeData } from '@/services/analytics';

export function formatTimeWithI18n(
  timeData: TimeData,
  t: (key: string, params?: Record<string, string | number>) => string
): string {
  const { hours, minutes } = timeData;

  if (hours > 0 && minutes > 0) {
    return t('timeFormat.hoursAndMinutes', { hours, minutes });
  } else if (hours > 0) {
    return t('timeFormat.hoursOnly', { hours });
  } else if (minutes > 0) {
    return t('timeFormat.minutesOnly', { minutes });
  } else {
    return t('timeFormat.zero');
  }
}

export function formatTimeVietnamese(timeData: TimeData): string {
  const { hours, minutes } = timeData;

  if (hours > 0 && minutes > 0) {
    return `${hours.toLocaleString('vi-VN')} giờ ${minutes} phút`;
  } else if (hours > 0) {
    return `${hours.toLocaleString('vi-VN')} giờ`;
  } else if (minutes > 0) {
    return `${minutes} phút`;
  } else {
    return '0 phút';
  }
}
