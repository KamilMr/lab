=== Current Date ===
now: 2025-09-05T14:45:30.389Z

=== Formatting ===
format(now, "yyyy-MM-dd"): 2025-09-05
format(now, "HH:mm:ss"): 16:45:30
format(now, "yyyy-MM-dd HH:mm:ss"): 2025-09-05 16:45:30
format(now, "EEEE, MMMM do, yyyy"): Friday, September 5th, 2025

=== Adding Time ===
addDays(now, 7): 2025-09-12T14:45:30.389Z
addWeeks(now, 2): 2025-09-19T14:45:30.389Z
addMonths(now, 3): 2025-12-05T15:45:30.389Z
addYears(now, 1): 2026-09-05T14:45:30.389Z

=== Subtracting Time ===
subDays(now, 7): 2025-08-29T14:45:30.389Z
subWeeks(now, 2): 2025-08-22T14:45:30.389Z
subMonths(now, 3): 2025-06-05T14:45:30.389Z
subYears(now, 1): 2024-09-05T14:45:30.389Z

=== Start/End of Periods ===
startOfDay(now): 2025-09-04T22:00:00.000Z
endOfDay(now): 2025-09-05T21:59:59.999Z
startOfWeek(now): 2025-08-30T22:00:00.000Z
endOfWeek(now): 2025-09-06T21:59:59.999Z
startOfMonth(now): 2025-08-31T22:00:00.000Z
endOfMonth(now): 2025-09-30T21:59:59.999Z
startOfYear(now): 2024-12-31T23:00:00.000Z
endOfYear(now): 2025-12-31T22:59:59.999Z

=== Date Differences ===
pastDate (30 days ago): 2025-08-06T14:45:30.389Z
differenceInDays(now, pastDate): 30
differenceInWeeks(now, pastDate): 4
differenceInMonths(now, pastDate): 0
differenceInYears(now, pastDate): 0

=== Date Comparisons ===
futureDate (10 days from now): 2025-09-15T14:45:30.389Z
isAfter(futureDate, now): true
isBefore(futureDate, now): false
isEqual(now, now): true
isSameDay(now, now): true
isSameWeek(now, futureDate): false
isSameMonth(now, futureDate): true
isSameYear(now, futureDate): true

=== Date Properties ===
isWeekend(now): false
getDay(now) (0=Sunday): 5
getDate(now): 5
getMonth(now) (0-based): 8
getYear(now): 2025

=== Relative Formatting ===
formatDistance(pastDate, now): about 1 month
formatDistanceToNow(pastDate): about 1 month
formatRelative(pastDate, now): 08/06/2025
formatRelative(futureDate, now): 09/15/2025

=== Timezone Functions ===
TZDate.tz("Europe/Berlin"): TZDate 2025-09-05T14:45:30.393Z {
  timeZone: 'Europe/Berlin',
  internal: 2025-09-05T16:45:30.393Z
}
TZDateMini.tz("Europe/Berlin"): TZDateMini 2025-09-05T14:45:30.401Z {
  timeZone: 'Europe/Berlin',
  internal: 2025-09-05T16:45:30.401Z
}
tzOffset("Europe/Berlin", now): 120
tzName("Europe/Berlin", now, "short"): GMT+2
tzName("Europe/Berlin", now, "long"): Central European Summer Time
tz(now, "Asia/Tokyo"): [Function (anonymous)]

=== Parsing ===
parseISO("2024-12-25T10:30:00.000Z"): 2024-12-25T10:30:00.000Z

