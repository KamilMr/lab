const {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  differenceInDays,
  differenceInMonths,
  differenceInWeeks,
  differenceInYears,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  formatDistance,
  formatDistanceToNow,
  formatRelative,
  getDate,
  getDay,
  getMonth,
  getYear,
  isAfter,
  isBefore,
  isEqual,
  isSameDay,
  isSameMonth,
  isSameWeek,
  isSameYear,
  isWeekend,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} = require('date-fns');

const {
  TZDate,
  TZDateMini,
  tzName,
  tzOffset,
} = require('@date-fns/tz');

const now = new Date();
console.log('=== Current Date ===');
console.log('now:', now);
console.log('');

console.log('=== Formatting ===');
console.log('format(now, "yyyy-MM-dd"):', format(now, 'yyyy-MM-dd'));
console.log('format(now, "HH:mm:ss"):', format(now, 'HH:mm:ss'));
console.log('format(now, "yyyy-MM-dd HH:mm:ss"):', format(now, 'yyyy-MM-dd HH:mm:ss'));
console.log('format(now, "EEEE, MMMM do, yyyy"):', format(now, 'EEEE, MMMM do, yyyy'));
console.log('');

console.log('=== Adding Time ===');
console.log('addDays(now, 7):', addDays(now, 7));
console.log('addWeeks(now, 2):', addWeeks(now, 2));
console.log('addMonths(now, 3):', addMonths(now, 3));
console.log('addYears(now, 1):', addYears(now, 1));
console.log('');

console.log('=== Subtracting Time ===');
console.log('subDays(now, 7):', subDays(now, 7));
console.log('subWeeks(now, 2):', subWeeks(now, 2));
console.log('subMonths(now, 3):', subMonths(now, 3));
console.log('subYears(now, 1):', subYears(now, 1));
console.log('');

console.log('=== Start/End of Periods ===');
console.log('startOfDay(now):', startOfDay(now));
console.log('endOfDay(now):', endOfDay(now));
console.log('startOfWeek(now):', startOfWeek(now));
console.log('endOfWeek(now):', endOfWeek(now));
console.log('startOfMonth(now):', startOfMonth(now));
console.log('endOfMonth(now):', endOfMonth(now));
console.log('startOfYear(now):', startOfYear(now));
console.log('endOfYear(now):', endOfYear(now));
console.log('');

console.log('=== Date Differences ===');
const pastDate = subDays(now, 30);
console.log('pastDate (30 days ago):', pastDate);
console.log('differenceInDays(now, pastDate):', differenceInDays(now, pastDate));
console.log('differenceInWeeks(now, pastDate):', differenceInWeeks(now, pastDate));
console.log('differenceInMonths(now, pastDate):', differenceInMonths(now, pastDate));
console.log('differenceInYears(now, pastDate):', differenceInYears(now, pastDate));
console.log('');

console.log('=== Date Comparisons ===');
const futureDate = addDays(now, 10);
console.log('futureDate (10 days from now):', futureDate);
console.log('isAfter(futureDate, now):', isAfter(futureDate, now));
console.log('isBefore(futureDate, now):', isBefore(futureDate, now));
console.log('isEqual(now, now):', isEqual(now, now));
console.log('isSameDay(now, now):', isSameDay(now, now));
console.log('isSameWeek(now, futureDate):', isSameWeek(now, futureDate));
console.log('isSameMonth(now, futureDate):', isSameMonth(now, futureDate));
console.log('isSameYear(now, futureDate):', isSameYear(now, futureDate));
console.log('');

console.log('=== Date Properties ===');
console.log('isWeekend(now):', isWeekend(now));
console.log('getDay(now) (0=Sunday):', getDay(now));
console.log('getDate(now):', getDate(now));
console.log('getMonth(now) (0-based):', getMonth(now));
console.log('getYear(now):', getYear(now));
console.log('');

console.log('=== Relative Formatting ===');
console.log('formatDistance(pastDate, now):', formatDistance(pastDate, now));
console.log('formatDistanceToNow(pastDate):', formatDistanceToNow(pastDate));
console.log('formatRelative(pastDate, now):', formatRelative(pastDate, now));
console.log('formatRelative(futureDate, now):', formatRelative(futureDate, now));
console.log('');

console.log('=== Timezone Functions ===');
const timeZone = 'Europe/Berlin';
const tzDate = TZDate.tz(timeZone);
const tzDateMini = TZDateMini.tz(timeZone);
console.log('TZDate.tz("Europe/Berlin"):', tzDate);
console.log('TZDateMini.tz("Europe/Berlin"):', tzDateMini);
console.log('tzOffset("Europe/Berlin", now):', tzOffset(timeZone, now));
console.log('tzName("Europe/Berlin", now, "short"):', tzName(timeZone, now, 'short'));
console.log('tzName("Europe/Berlin", now, "long"):', tzName(timeZone, now, 'long'));
console.log('');

console.log('=== Parsing ===');
const isoString = '2024-12-25T10:30:00.000Z';
console.log('parseISO("2024-12-25T10:30:00.000Z"):', parseISO(isoString));
console.log('');
