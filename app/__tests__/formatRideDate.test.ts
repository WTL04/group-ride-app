/**
 * @format
 */

import { formatRideDate, formatRideDateTime } from '../src/lib/formatRideDate';

test.each([
  ['2026-11-01T08:00:00', 'November 1, 2026'],
  ['2026-11-03T18:00:00', 'November 3, 2026'],
  ['2026-01-05T00:00:00', 'January 5, 2026'],
  ['2026-12-31T23:59:59', 'December 31, 2026'],
])('formats %s as %s', (input, expected) => {
  expect(formatRideDate(input)).toBe(expected);
});

test('passes unparseable input through unchanged', () => {
  expect(formatRideDate('not a date')).toBe('not a date');
  expect(formatRideDate('')).toBe('');
});

test.each([
  [new Date(2026, 10, 1, 8, 0), 'November 1, 2026 at 8:00 AM'],
  [new Date(2026, 10, 1, 0, 5), 'November 1, 2026 at 12:05 AM'],
  [new Date(2026, 10, 1, 12, 30), 'November 1, 2026 at 12:30 PM'],
  [new Date(2026, 0, 5, 23, 59), 'January 5, 2026 at 11:59 PM'],
])('formats datetime %s', (date, expected) => {
  expect(formatRideDateTime(date.toISOString())).toBe(expected);
});

test('formatRideDateTime passes unparseable input through unchanged', () => {
  expect(formatRideDateTime('not a date')).toBe('not a date');
});
