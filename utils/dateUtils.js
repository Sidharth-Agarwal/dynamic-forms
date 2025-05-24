/**
 * Date utility functions for the Form Builder module
 */

/**
 * Format date to various string formats
 * @param {Date|string|number} date - Date to format
 * @param {string} format - Format string
 * @param {string} locale - Locale for formatting
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'YYYY-MM-DD', locale = 'en-US') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  // Custom format patterns
  const patterns = {
    'YYYY': dateObj.getFullYear(),
    'YY': dateObj.getFullYear().toString().slice(-2),
    'MM': String(dateObj.getMonth() + 1).padStart(2, '0'),
    'M': dateObj.getMonth() + 1,
    'DD': String(dateObj.getDate()).padStart(2, '0'),
    'D': dateObj.getDate(),
    'HH': String(dateObj.getHours()).padStart(2, '0'),
    'H': dateObj.getHours(),
    'mm': String(dateObj.getMinutes()).padStart(2, '0'),
    'm': dateObj.getMinutes(),
    'ss': String(dateObj.getSeconds()).padStart(2, '0'),
    's': dateObj.getSeconds(),
    'SSS': String(dateObj.getMilliseconds()).padStart(3, '0'),
    'A': dateObj.getHours() >= 12 ? 'PM' : 'AM',
    'a': dateObj.getHours() >= 12 ? 'pm' : 'am'
  };
  
  // Replace patterns in format string
  let formatted = format;
  Object.entries(patterns).forEach(([pattern, value]) => {
    formatted = formatted.replace(new RegExp(pattern, 'g'), value);
  });
  
  return formatted;
};

/**
 * Parse date string to Date object
 * @param {string} dateString - Date string to parse
 * @param {string} format - Expected format
 * @returns {Date|null} Parsed date or null if invalid
 */
export const parseDate = (dateString, format = 'YYYY-MM-DD') => {
  if (!dateString) return null;
  
  try {
    // Handle ISO format
    if (format === 'ISO' || dateString.includes('T')) {
      return new Date(dateString);
    }
    
    // Handle common formats
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    return null;
  }
};

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days")
 * @param {Date|string|number} date - Date to compare
 * @param {Date} baseDate - Base date for comparison (default: now)
 * @param {string} locale - Locale for formatting
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date, baseDate = new Date(), locale = 'en-US') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  const baseObj = new Date(baseDate);
  
  if (isNaN(dateObj.getTime()) || isNaN(baseObj.getTime())) return '';
  
  const diffMs = dateObj.getTime() - baseObj.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  
  if (Math.abs(diffYears) >= 1) {
    return rtf.format(diffYears, 'year');
  } else if (Math.abs(diffMonths) >= 1) {
    return rtf.format(diffMonths, 'month');
  } else if (Math.abs(diffWeeks) >= 1) {
    return rtf.format(diffWeeks, 'week');
  } else if (Math.abs(diffDays) >= 1) {
    return rtf.format(diffDays, 'day');
  } else if (Math.abs(diffHours) >= 1) {
    return rtf.format(diffHours, 'hour');
  } else if (Math.abs(diffMinutes) >= 1) {
    return rtf.format(diffMinutes, 'minute');
  } else {
    return rtf.format(diffSeconds, 'second');
  }
};

/**
 * Check if date is valid
 * @param {any} date - Date to validate
 * @returns {boolean} True if valid date
 */
export const isValidDate = (date) => {
  if (!date) return false;
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
};

/**
 * Check if date is today
 * @param {Date|string|number} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
  if (!isValidDate(date)) return false;
  
  const dateObj = new Date(date);
  const today = new Date();
  
  return dateObj.getDate() === today.getDate() &&
         dateObj.getMonth() === today.getMonth() &&
         dateObj.getFullYear() === today.getFullYear();
};

/**
 * Check if date is yesterday
 * @param {Date|string|number} date - Date to check
 * @returns {boolean} True if date is yesterday
 */
export const isYesterday = (date) => {
  if (!isValidDate(date)) return false;
  
  const dateObj = new Date(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  return dateObj.getDate() === yesterday.getDate() &&
         dateObj.getMonth() === yesterday.getMonth() &&
         dateObj.getFullYear() === yesterday.getFullYear();
};

/**
 * Check if date is tomorrow
 * @param {Date|string|number} date - Date to check
 * @returns {boolean} True if date is tomorrow
 */
export const isTomorrow = (date) => {
  if (!isValidDate(date)) return false;
  
  const dateObj = new Date(date);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return dateObj.getDate() === tomorrow.getDate() &&
         dateObj.getMonth() === tomorrow.getMonth() &&
         dateObj.getFullYear() === tomorrow.getFullYear();
};

/**
 * Check if date is in the past
 * @param {Date|string|number} date - Date to check
 * @param {Date} baseDate - Base date for comparison (default: now)
 * @returns {boolean} True if date is in the past
 */
export const isPast = (date, baseDate = new Date()) => {
  if (!isValidDate(date)) return false;
  return new Date(date) < baseDate;
};

/**
 * Check if date is in the future
 * @param {Date|string|number} date - Date to check
 * @param {Date} baseDate - Base date for comparison (default: now)
 * @returns {boolean} True if date is in the future
 */
export const isFuture = (date, baseDate = new Date()) => {
  if (!isValidDate(date)) return false;
  return new Date(date) > baseDate;
};

/**
 * Check if date is within range
 * @param {Date|string|number} date - Date to check
 * @param {Date|string|number} startDate - Start date
 * @param {Date|string|number} endDate - End date
 * @returns {boolean} True if date is within range
 */
export const isWithinRange = (date, startDate, endDate) => {
  if (!isValidDate(date) || !isValidDate(startDate) || !isValidDate(endDate)) {
    return false;
  }
  
  const dateObj = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return dateObj >= start && dateObj <= end;
};

/**
 * Get start of day
 * @param {Date|string|number} date - Date
 * @returns {Date} Start of day
 */
export const startOfDay = (date = new Date()) => {
  const dateObj = new Date(date);
  dateObj.setHours(0, 0, 0, 0);
  return dateObj;
};

/**
 * Get end of day
 * @param {Date|string|number} date - Date
 * @returns {Date} End of day
 */
export const endOfDay = (date = new Date()) => {
  const dateObj = new Date(date);
  dateObj.setHours(23, 59, 59, 999);
  return dateObj;
};

/**
 * Get start of week
 * @param {Date|string|number} date - Date
 * @param {number} weekStartsOn - Day of week that starts the week (0 = Sunday, 1 = Monday)
 * @returns {Date} Start of week
 */
export const startOfWeek = (date = new Date(), weekStartsOn = 0) => {
  const dateObj = new Date(date);
  const day = dateObj.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  
  dateObj.setDate(dateObj.getDate() - diff);
  return startOfDay(dateObj);
};

/**
 * Get end of week
 * @param {Date|string|number} date - Date
 * @param {number} weekStartsOn - Day of week that starts the week (0 = Sunday, 1 = Monday)
 * @returns {Date} End of week
 */
export const endOfWeek = (date = new Date(), weekStartsOn = 0) => {
  const startWeek = startOfWeek(date, weekStartsOn);
  const endWeek = new Date(startWeek);
  endWeek.setDate(endWeek.getDate() + 6);
  return endOfDay(endWeek);
};

/**
 * Get start of month
 * @param {Date|string|number} date - Date
 * @returns {Date} Start of month
 */
export const startOfMonth = (date = new Date()) => {
  const dateObj = new Date(date);
  dateObj.setDate(1);
  return startOfDay(dateObj);
};

/**
 * Get end of month
 * @param {Date|string|number} date - Date
 * @returns {Date} End of month
 */
export const endOfMonth = (date = new Date()) => {
  const dateObj = new Date(date);
  dateObj.setMonth(dateObj.getMonth() + 1, 0);
  return endOfDay(dateObj);
};

/**
 * Get start of year
 * @param {Date|string|number} date - Date
 * @returns {Date} Start of year
 */
export const startOfYear = (date = new Date()) => {
  const dateObj = new Date(date);
  dateObj.setMonth(0, 1);
  return startOfDay(dateObj);
};

/**
 * Get end of year
 * @param {Date|string|number} date - Date
 * @returns {Date} End of year
 */
export const endOfYear = (date = new Date()) => {
  const dateObj = new Date(date);
  dateObj.setMonth(11, 31);
  return endOfDay(dateObj);
};

/**
 * Add time to date
 * @param {Date|string|number} date - Base date
 * @param {number} amount - Amount to add
 * @param {string} unit - Unit (years, months, weeks, days, hours, minutes, seconds)
 * @returns {Date} New date with added time
 */
export const addTime = (date, amount, unit) => {
  const dateObj = new Date(date);
  
  switch (unit) {
    case 'years':
      dateObj.setFullYear(dateObj.getFullYear() + amount);
      break;
    case 'months':
      dateObj.setMonth(dateObj.getMonth() + amount);
      break;
    case 'weeks':
      dateObj.setDate(dateObj.getDate() + (amount * 7));
      break;
    case 'days':
      dateObj.setDate(dateObj.getDate() + amount);
      break;
/**
 * Add time to date
 * @param {Date|string|number} date - Base date
 * @param {number} amount - Amount to add
 * @param {string} unit - Unit (years, months, weeks, days, hours, minutes, seconds)
 * @returns {Date} New date with added time
 */
export const addTime = (date, amount, unit) => {
  const dateObj = new Date(date);
  
  switch (unit) {
    case 'years':
      dateObj.setFullYear(dateObj.getFullYear() + amount);
      break;
    case 'months':
      dateObj.setMonth(dateObj.getMonth() + amount);
      break;
    case 'weeks':
      dateObj.setDate(dateObj.getDate() + (amount * 7));
      break;
    case 'days':
      dateObj.setDate(dateObj.getDate() + amount);
      break;
    case 'hours':
      dateObj.setHours(dateObj.getHours() + amount);
      break;
    case 'minutes':
      dateObj.setMinutes(dateObj.getMinutes() + amount);
      break;
    case 'seconds':
      dateObj.setSeconds(dateObj.getSeconds() + amount);
      break;
    case 'milliseconds':
      dateObj.setMilliseconds(dateObj.getMilliseconds() + amount);
      break;
    default:
      throw new Error(`Invalid unit: ${unit}`);
  }
  
  return dateObj;
};

/**
 * Subtract time from date
 * @param {Date|string|number} date - Base date
 * @param {number} amount - Amount to subtract
 * @param {string} unit - Unit (years, months, weeks, days, hours, minutes, seconds)
 * @returns {Date} New date with subtracted time
 */
export const subtractTime = (date, amount, unit) => {
  return addTime(date, -amount, unit);
};

/**
 * Get difference between two dates
 * @param {Date|string|number} date1 - First date
 * @param {Date|string|number} date2 - Second date
 * @param {string} unit - Unit for result (years, months, weeks, days, hours, minutes, seconds, milliseconds)
 * @returns {number} Difference in specified unit
 */
export const getDifference = (date1, date2, unit = 'milliseconds') => {
  const dateObj1 = new Date(date1);
  const dateObj2 = new Date(date2);
  
  if (!isValidDate(dateObj1) || !isValidDate(dateObj2)) {
    return NaN;
  }
  
  const diffMs = dateObj1.getTime() - dateObj2.getTime();
  
  switch (unit) {
    case 'years':
      return diffMs / (1000 * 60 * 60 * 24 * 365.25);
    case 'months':
      return diffMs / (1000 * 60 * 60 * 24 * 30.44);
    case 'weeks':
      return diffMs / (1000 * 60 * 60 * 24 * 7);
    case 'days':
      return diffMs / (1000 * 60 * 60 * 24);
    case 'hours':
      return diffMs / (1000 * 60 * 60);
    case 'minutes':
      return diffMs / (1000 * 60);
    case 'seconds':
      return diffMs / 1000;
    case 'milliseconds':
      return diffMs;
    default:
      return diffMs;
  }
};

/**
 * Get age from birth date
 * @param {Date|string|number} birthDate - Birth date
 * @param {Date|string|number} currentDate - Current date (default: now)
 * @returns {number} Age in years
 */
export const getAge = (birthDate, currentDate = new Date()) => {
  const birth = new Date(birthDate);
  const current = new Date(currentDate);
  
  if (!isValidDate(birth) || !isValidDate(current)) {
    return NaN;
  }
  
  let age = current.getFullYear() - birth.getFullYear();
  const monthDiff = current.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && current.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Get number of days in month
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {number} Number of days in month
 */
export const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

/**
 * Check if year is leap year
 * @param {number} year - Year to check
 * @returns {boolean} True if leap year
 */
export const isLeapYear = (year) => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

/**
 * Get day of year (1-366)
 * @param {Date|string|number} date - Date
 * @returns {number} Day of year
 */
export const getDayOfYear = (date) => {
  const dateObj = new Date(date);
  const start = startOfYear(dateObj);
  const diff = getDifference(dateObj, start, 'days');
  return Math.floor(diff) + 1;
};

/**
 * Get week of year (1-53)
 * @param {Date|string|number} date - Date
 * @param {number} weekStartsOn - Day of week that starts the week (0 = Sunday, 1 = Monday)
 * @returns {number} Week of year
 */
export const getWeekOfYear = (date, weekStartsOn = 1) => {
  const dateObj = new Date(date);
  const startYear = startOfYear(dateObj);
  const startWeekOfYear = startOfWeek(startYear, weekStartsOn);
  
  const diff = getDifference(dateObj, startWeekOfYear, 'days');
  return Math.floor(diff / 7) + 1;
};

/**
 * Get quarter of year (1-4)
 * @param {Date|string|number} date - Date
 * @returns {number} Quarter of year
 */
export const getQuarter = (date) => {
  const dateObj = new Date(date);
  return Math.floor(dateObj.getMonth() / 3) + 1;
};

/**
 * Format duration in human readable format
 * @param {number} milliseconds - Duration in milliseconds
 * @param {object} options - Formatting options
 * @returns {string} Formatted duration
 */
export const formatDuration = (milliseconds, options = {}) => {
  const {
    units = ['hours', 'minutes', 'seconds'],
    precision = 2,
    separator = ', ',
    lastSeparator = ' and '
  } = options;
  
  if (!milliseconds || milliseconds < 0) return '0 seconds';
  
  const timeUnits = {
    years: 365 * 24 * 60 * 60 * 1000,
    months: 30 * 24 * 60 * 60 * 1000,
    weeks: 7 * 24 * 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
    hours: 60 * 60 * 1000,
    minutes: 60 * 1000,
    seconds: 1000,
    milliseconds: 1
  };
  
  const parts = [];
  let remaining = milliseconds;
  
  for (const unit of units) {
    if (timeUnits[unit] && remaining >= timeUnits[unit]) {
      const value = Math.floor(remaining / timeUnits[unit]);
      remaining = remaining % timeUnits[unit];
      parts.push(`${value} ${unit === 'milliseconds' ? 'ms' : unit}`);
      
      if (parts.length >= precision) break;
    }
  }
  
  if (parts.length === 0) {
    const smallestUnit = units[units.length - 1] || 'milliseconds';
    return `0 ${smallestUnit}`;
  }
  
  if (parts.length === 1) return parts[0];
  
  const lastPart = parts.pop();
  return parts.join(separator) + lastSeparator + lastPart;
};

/**
 * Parse duration string to milliseconds
 * @param {string} durationString - Duration string (e.g., "2h 30m", "1 day", "45 seconds")
 * @returns {number} Duration in milliseconds
 */
export const parseDuration = (durationString) => {
  if (!durationString || typeof durationString !== 'string') return 0;
  
  const timeUnits = {
    y: 365 * 24 * 60 * 60 * 1000,
    year: 365 * 24 * 60 * 60 * 1000,
    years: 365 * 24 * 60 * 60 * 1000,
    mo: 30 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
    months: 30 * 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    weeks: 7 * 24 * 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
    h: 60 * 60 * 1000,
    hour: 60 * 60 * 1000,
    hours: 60 * 60 * 1000,
    m: 60 * 1000,
    min: 60 * 1000,
    minute: 60 * 1000,
    minutes: 60 * 1000,
    s: 1000,
    sec: 1000,
    second: 1000,
    seconds: 1000,
    ms: 1,
    millisecond: 1,
    milliseconds: 1
  };
  
  const regex = /(\d+(?:\.\d+)?)\s*([a-zA-Z]+)/g;
  let total = 0;
  let match;
  
  while ((match = regex.exec(durationString)) !== null) {
    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    
    if (timeUnits[unit]) {
      total += value * timeUnits[unit];
    }
  }
  
  return total;
};

/**
 * Get business days between two dates
 * @param {Date|string|number} startDate - Start date
 * @param {Date|string|number} endDate - End date
 * @param {array} holidays - Array of holiday dates
 * @returns {number} Number of business days
 */
export const getBusinessDays = (startDate, endDate, holidays = []) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (!isValidDate(start) || !isValidDate(end)) return 0;
  if (start > end) return 0;
  
  const holidaySet = new Set(holidays.map(h => formatDate(h, 'YYYY-MM-DD')));
  let businessDays = 0;
  const current = new Date(start);
  
  while (current <= end) {
    const dayOfWeek = current.getDay();
    const dateString = formatDate(current, 'YYYY-MM-DD');
    
    // Monday = 1, Tuesday = 2, ..., Friday = 5
    if (dayOfWeek >= 1 && dayOfWeek <= 5 && !holidaySet.has(dateString)) {
      businessDays++;
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  return businessDays;
};

/**
 * Check if date is a weekend
 * @param {Date|string|number} date - Date to check
 * @returns {boolean} True if weekend (Saturday or Sunday)
 */
export const isWeekend = (date) => {
  const dateObj = new Date(date);
  if (!isValidDate(dateObj)) return false;
  
  const dayOfWeek = dateObj.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
};

/**
 * Check if date is a weekday
 * @param {Date|string|number} date - Date to check
 * @returns {boolean} True if weekday (Monday through Friday)
 */
export const isWeekday = (date) => {
  return !isWeekend(date);
};

/**
 * Get timezone offset in minutes
 * @param {Date|string|number} date - Date
 * @returns {number} Timezone offset in minutes
 */
export const getTimezoneOffset = (date = new Date()) => {
  const dateObj = new Date(date);
  return dateObj.getTimezoneOffset();
};

/**
 * Convert date to different timezone
 * @param {Date|string|number} date - Date to convert
 * @param {string} timezone - Target timezone (e.g., 'America/New_York')
 * @returns {Date} Date in target timezone
 */
export const convertTimezone = (date, timezone) => {
  if (!isValidDate(date)) return null;
  
  try {
    const dateObj = new Date(date);
    return new Date(dateObj.toLocaleString('en-US', { timeZone: timezone }));
  } catch (error) {
    console.error('Invalid timezone:', timezone);
    return new Date(date);
  }
};

/**
 * Get list of dates between two dates
 * @param {Date|string|number} startDate - Start date
 * @param {Date|string|number} endDate - End date
 * @param {string} step - Step unit (days, weeks, months, years)
 * @param {number} stepSize - Step size (default: 1)
 * @returns {Date[]} Array of dates
 */
export const getDateRange = (startDate, endDate, step = 'days', stepSize = 1) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dates = [];
  
  if (!isValidDate(start) || !isValidDate(end) || start > end) {
    return dates;
  }
  
  const current = new Date(start);
  
  while (current <= end) {
    dates.push(new Date(current));
    current = addTime(current, stepSize, step);
  }
  
  return dates;
};

/**
 * Get closest date from array
 * @param {Date|string|number} targetDate - Target date
 * @param {array} dates - Array of dates to search
 * @returns {Date|null} Closest date or null if no dates provided
 */
export const getClosestDate = (targetDate, dates) => {
  if (!Array.isArray(dates) || dates.length === 0) return null;
  if (!isValidDate(targetDate)) return null;
  
  const target = new Date(targetDate);
  let closest = null;
  let minDiff = Infinity;
  
  for (const date of dates) {
    if (!isValidDate(date)) continue;
    
    const diff = Math.abs(getDifference(target, date, 'milliseconds'));
    if (diff < minDiff) {
      minDiff = diff;
      closest = new Date(date);
    }
  }
  
  return closest;
};

/**
 * Create date picker constraints
 * @param {object} options - Constraint options
 * @returns {object} Date picker constraints
 */
export const createDateConstraints = (options = {}) => {
  const {
    minDate,
    maxDate,
    disabledDates = [],
    enabledDaysOfWeek = [0, 1, 2, 3, 4, 5, 6], // All days enabled by default
    holidays = [],
    disableWeekends = false,
    disableHolidays = false
  } = options;
  
  return {
    isDateDisabled: (date) => {
      const dateObj = new Date(date);
      const dayOfWeek = dateObj.getDay();
      const dateString = formatDate(dateObj, 'YYYY-MM-DD');
      
      // Check min/max dates
      if (minDate && dateObj < new Date(minDate)) return true;
      if (maxDate && dateObj > new Date(maxDate)) return true;
      
      // Check disabled dates
      if (disabledDates.some(d => formatDate(d, 'YYYY-MM-DD') === dateString)) return true;
      
      // Check enabled days of week
      if (!enabledDaysOfWeek.includes(dayOfWeek)) return true;
      
      // Check weekends
      if (disableWeekends && isWeekend(dateObj)) return true;
      
      // Check holidays
      if (disableHolidays && holidays.some(h => formatDate(h, 'YYYY-MM-DD') === dateString)) return true;
      
      return false;
    },
    
    getNextEnabledDate: (date) => {
      let current = new Date(date);
      let attempts = 0;
      const maxAttempts = 365; // Prevent infinite loop
      
      while (attempts < maxAttempts) {
        if (!this.isDateDisabled(current)) {
          return current;
        }
        current = addTime(current, 1, 'days');
        attempts++;
      }
      
      return null;
    },
    
    getPreviousEnabledDate: (date) => {
      let current = new Date(date);
      let attempts = 0;
      const maxAttempts = 365; // Prevent infinite loop
      
      while (attempts < maxAttempts) {
        if (!this.isDateDisabled(current)) {
          return current;
        }
        current = subtractTime(current, 1, 'days');
        attempts++;
      }
      
      return null;
    }
  };
};

export default {
  formatDate,
  parseDate,
  getRelativeTime,
  isValidDate,
  isToday,
  isYesterday,
  isTomorrow,
  isPast,
  isFuture,
  isWithinRange,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  addTime,
  subtractTime,
  getDifference,
  getAge,
  getDaysInMonth,
  isLeapYear,
  getDayOfYear,
  getWeekOfYear,
  getQuarter,
  formatDuration,
  parseDuration,
  getBusinessDays,
  isWeekend,
  isWeekday,
  getTimezoneOffset,
  convertTimezone,
  getDateRange,
  getClosestDate,
  createDateConstraints
}