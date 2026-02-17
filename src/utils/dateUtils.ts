/**
 * Date utility functions for UCL Fantasy
 * ALWAYS use these helpers for date/time operations
 */

import {
  format,
  formatDistance,
  formatRelative,
  isAfter,
  isBefore,
  isPast,
  isFuture,
  parseISO,
  addDays,
  addHours,
  addMinutes,
  subDays,
  subHours,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  startOfDay,
  endOfDay,
  isWithinInterval,
} from 'date-fns';

/**
 * Format a date to a readable string
 * @param date - Date string or Date object
 * @param formatStr - Format string (default: 'PPP' = Jan 1, 2024)
 */
export function formatDate(date: string | Date, formatStr: string = 'PPP'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Format a date with time
 * @param date - Date string or Date object
 */
export function formatDateTime(date: string | Date): string {
  return formatDate(date, 'PPP p'); // Jan 1, 2024 at 3:00 PM
}

/**
 * Format a date for match display (e.g., "Wed, Jan 1 at 3:00 PM")
 */
export function formatMatchDate(date: string | Date): string {
  return formatDate(date, "EEE, MMM d 'at' h:mm a");
}

/**
 * Get relative time (e.g., "2 hours ago", "in 3 days")
 */
export function getRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistance(dateObj, new Date(), { addSuffix: true });
}

/**
 * Get relative time with context (e.g., "tomorrow at 3:00 PM")
 */
export function getRelativeTimeWithContext(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatRelative(dateObj, new Date());
}

/**
 * Check if a date is in the past
 */
export function isDatePast(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isPast(dateObj);
}

/**
 * Check if a date is in the future
 */
export function isDateFuture(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isFuture(dateObj);
}

/**
 * Check if date1 is after date2
 */
export function isDateAfter(date1: string | Date, date2: string | Date): boolean {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return isAfter(d1, d2);
}

/**
 * Check if date1 is before date2
 */
export function isDateBefore(date1: string | Date, date2: string | Date): boolean {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return isBefore(d1, d2);
}

/**
 * Check if predictions are locked for a match (e.g., 1 hour before kickoff)
 */
export function arePredictionsLocked(matchDate: string | Date, lockMinutes: number = 60): boolean {
  const dateObj = typeof matchDate === 'string' ? parseISO(matchDate) : matchDate;
  const lockTime = subHours(dateObj, lockMinutes / 60);
  return isAfter(new Date(), lockTime);
}

/**
 * Get time remaining until match starts
 */
export function getTimeUntilMatch(matchDate: string | Date): {
  days: number;
  hours: number;
  minutes: number;
  isPast: boolean;
} {
  const dateObj = typeof matchDate === 'string' ? parseISO(matchDate) : matchDate;
  const now = new Date();

  if (isPast(dateObj)) {
    return { days: 0, hours: 0, minutes: 0, isPast: true };
  }

  const days = differenceInDays(dateObj, now);
  const hours = differenceInHours(dateObj, now) % 24;
  const minutes = differenceInMinutes(dateObj, now) % 60;

  return { days, hours, minutes, isPast: false };
}

/**
 * Check if a date is within a range
 */
export function isDateInRange(
  date: string | Date,
  start: string | Date,
  end: string | Date
): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const startObj = typeof start === 'string' ? parseISO(start) : start;
  const endObj = typeof end === 'string' ? parseISO(end) : end;

  return isWithinInterval(dateObj, { start: startObj, end: endObj });
}

/**
 * Parse ISO date string to Date object
 */
export function parseDate(dateString: string): Date {
  return parseISO(dateString);
}

// Re-export commonly used date-fns functions
export {
  addDays,
  addHours,
  addMinutes,
  subDays,
  subHours,
  startOfDay,
  endOfDay,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
};
