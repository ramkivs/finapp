import { APP_AS_OF_DATE, DateBounds } from '../domain/types';

export function formatDisplayDate(isoStr: string = APP_AS_OF_DATE): string {
  const d = new Date(isoStr + 'T00:00:00');
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export class DateRangeService {
  static getBounds(
    range: string,
    asOfDateStr: string = APP_AS_OF_DATE,
    customStart: string | null = null,
    customEnd: string | null = null
  ): DateBounds {
    const asOf = new Date(asOfDateStr + 'T00:00:00');
    const pad = (n: number) => String(n).padStart(2, '0');
    const toISODate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    let start = new Date(asOf);
    let end = new Date(asOf);

    if (range === 'This Week') {
      const day = start.getDay() || 7; // Monday = 1
      start.setDate(start.getDate() - day + 1);
    } else if (range === 'This Month') {
      start.setDate(1);
    } else if (range === 'Last 30 Days') {
      start.setDate(start.getDate() - 29);
    } else if (range === 'Last Month') {
      start = new Date(asOf.getFullYear(), asOf.getMonth() - 1, 1);
      end = new Date(asOf.getFullYear(), asOf.getMonth(), 0);
    } else if (range === '3M') {
      start = new Date(asOf.getFullYear(), asOf.getMonth() - 3, 1);
    } else if (range === '6M') {
      start = new Date(asOf.getFullYear(), asOf.getMonth() - 6, 1);
    } else if (range === '12M') {
      start = new Date(asOf.getFullYear(), asOf.getMonth() - 11, 1);
    } else if (range === 'YTD') {
      start = new Date(asOf.getFullYear(), 0, 1);
    } else if (range === 'Custom' && customStart && customEnd) {
      return { startDate: customStart, endDate: customEnd };
    }

    return { startDate: toISODate(start), endDate: toISODate(end) };
  }
}
