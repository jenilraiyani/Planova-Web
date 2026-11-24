/**
 * Date helpers using Intl for timezone-aware calendar dates.
 */

const pad = (n) => String(n).padStart(2, '0');

const getPartsInTimezone = (date, timeZone) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timeZone || 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((p) => [p.type, p.value])
  );

  const weekdayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const hour = parts.hour === '24' ? '00' : parts.hour;

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    weekday: weekdayMap[parts.weekday],
    hour: Number(hour),
    minute: Number(parts.minute),
    dateStr: `${parts.year}-${parts.month}-${parts.day}`,
  };
};

const toDateStr = (date, timeZone) => getPartsInTimezone(date, timeZone).dateStr;

const parseDateStr = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return { year: y, month: m, day: d };
};

/** Build a Date representing local wall-clock time for a calendar date + HH:mm */
const combineDateAndTime = (dateStr, dueTime = '09:00') => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = (dueTime || '09:00').split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
};

const addDaysToDateStr = (dateStr, days) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
};

const compareDateStr = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

const daysBetween = (startStr, endStr) => {
  const a = parseDateStr(startStr);
  const b = parseDateStr(endStr);
  const start = Date.UTC(a.year, a.month - 1, a.day);
  const end = Date.UTC(b.year, b.month - 1, b.day);
  return Math.round((end - start) / 86400000);
};

const weekdayFromDateStr = (dateStr) => {
  const { year, month, day } = parseDateStr(dateStr);
  return new Date(year, month - 1, day).getDay();
};

const getStartOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getEndOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

module.exports = {
  getPartsInTimezone,
  toDateStr,
  parseDateStr,
  combineDateAndTime,
  addDaysToDateStr,
  compareDateStr,
  daysBetween,
  weekdayFromDateStr,
  getStartOfDay,
  getEndOfDay,
  pad,
};
