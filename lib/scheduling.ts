/**
 * Scheduling engine for Parents Medicine Reminder
 * Timezone: Asia/Dhaka (UTC+6)
 * 
 * Active window: 08:00 → 23:00 (no reminders between 23:00 → 08:00)
 * 
 * Cortisol: [8, 10, 12, 14, 16, 18, 20, 22]
 * 4-Hour container: [8, 12, 16, 20]
 */

export const TIMEZONE = 'Asia/Dhaka';
export const ACTIVE_START_HOUR = 8;  // 8 AM
export const ACTIVE_END_HOUR = 23;   // 11 PM (last dose at 10 PM, but active until 11 PM)

export const CORTISOL_SCHEDULE = [8, 10, 12, 14, 16, 18, 20, 22];
export const FOUR_HOUR_SCHEDULE = [8, 12, 16, 20];

/**
 * Get current time in Asia/Dhaka timezone as a Date object
 */
export function getDhakaTime(): Date {
  const now = new Date();
  return now;
}

/**
 * Get current hour in Asia/Dhaka timezone (0-23)
 */
export function getDhakaHour(): number {
  const now = new Date();
  const dhakaString = now.toLocaleString('en-US', {
    timeZone: TIMEZONE,
    hour: 'numeric',
    hour12: false,
  });
  return parseInt(dhakaString, 10);
}

/**
 * Get today's date string (YYYY-MM-DD) in Asia/Dhaka timezone
 */
export function getDhakaDate(): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  return parts; // Returns YYYY-MM-DD
}

/**
 * Get full Dhaka datetime parts
 */
export function getDhakaDateParts(): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  dateString: string;
} {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const get = (type: string) => parseInt(parts.find((p) => p.type === type)?.value || '0', 10);

  const year = get('year');
  const month = get('month');
  const day = get('day');
  const hour = get('hour') === 24 ? 0 : get('hour');
  const minute = get('minute');
  const second = get('second');
  const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return { year, month, day, hour, minute, second, dateString };
}

/**
 * Get a Date object representing a specific hour today in Dhaka timezone (as UTC)
 */
export function getDhakaDateAtHour(dateString: string, hour: number): Date {
  // dateString is YYYY-MM-DD in Dhaka time
  // Returns a UTC Date representing that local time
  const [year, month, day] = dateString.split('-').map(Number);
  // Dhaka is UTC+6
  const utcHour = hour - 6;
  const date = new Date(Date.UTC(year, month - 1, day, utcHour, 0, 0, 0));
  return date;
}

/**
 * Check if current Dhaka time is in the active window (8 AM – 11 PM)
 */
export function isActiveWindow(): boolean {
  const { hour } = getDhakaDateParts();
  return hour >= ACTIVE_START_HOUR && hour < ACTIVE_END_HOUR;
}

/**
 * Get the next scheduled dose hour from now for a given schedule
 * Returns null if no more doses today (after 11 PM) or before 8 AM
 */
export function getNextScheduledHour(schedule: number[]): number | null {
  const { hour, minute } = getDhakaDateParts();
  
  // If before active window start, next is the first slot today
  if (hour < ACTIVE_START_HOUR) {
    return schedule[0];
  }
  
  // If after active window end, no more doses today
  if (hour >= ACTIVE_END_HOUR) {
    return null;
  }

  // Find next upcoming hour (strictly in the future, or current if within grace period)
  for (const h of schedule) {
    if (h > hour || (h === hour && minute < 30)) {
      return h;
    }
  }

  return null; // No more doses today
}

/**
 * Get the current scheduled hour (the dose window we're currently in)
 * A dose is "current" if we're within 30 minutes after its scheduled time
 */
export function getCurrentScheduledHour(schedule: number[]): number | null {
  const { hour, minute } = getDhakaDateParts();
  
  if (!isActiveWindow()) return null;

  for (const h of schedule) {
    if (h === hour && minute <= 30) {
      return h;
    }
    // Also check if we're within the window before the next slot
    const nextIdx = schedule.indexOf(h) + 1;
    const nextH = schedule[nextIdx];
    if (h < hour && (nextH === undefined || hour < nextH)) {
      // We're between h and nextH, the current slot is h
      if (hour - h <= 1) return h;
    }
  }

  return null;
}

/**
 * Format a time (hour 0-23) to display string like "৮:০০ AM"
 */
export function formatTimeBengali(hour: number, minute: number = 0): string {
  const bengaliDigits: Record<string, string> = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
  };

  const toBengali = (n: number) =>
    String(n).split('').map((d) => bengaliDigits[d] || d).join('');

  const period = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const minuteStr = minute === 0 ? '০০' : toBengali(minute);

  return `${toBengali(displayHour)}:${minuteStr} ${period}`;
}

/**
 * Format current date in Bengali-readable format
 */
export function formatDateBengali(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const months = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
  ];

  const bengaliDigits: Record<string, string> = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
  };

  const toBengali = (n: number) =>
    String(n).split('').map((d) => bengaliDigits[d] || d).join('');

  const days = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  const date = new Date(year, month - 1, day);
  const dayName = days[date.getDay()];

  return `${dayName}, ${toBengali(day)} ${months[month - 1]} ${toBengali(year)}`;
}

/**
 * Format time from a Date object in Bengali 
 */
export function formatDateTimeBengali(isoString: string): string {
  const date = new Date(isoString);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
  const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
  return formatTimeBengali(hour === 24 ? 0 : hour, minute);
}

/**
 * Get today's date string from a record (relative description)
 */
export function getRelativeDateBengali(dateString: string, todayString: string): string {
  if (dateString === todayString) return 'আজ';
  
  const recDate = new Date(dateString);
  const todDate = new Date(todayString);
  const diffMs = todDate.getTime() - recDate.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'গতকাল';
  if (diffDays === 2) return '২ দিন আগে';
  
  return formatDateBengali(dateString);
}
