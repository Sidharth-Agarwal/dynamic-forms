/**
 * Data formatting utilities for the Form Builder module
 * These functions handle data transformation, display formatting, and output preparation
 */

/**
 * Format form field value for display
 * @param {any} value - Value to format
 * @param {object} field - Field configuration
 * @param {object} options - Formatting options
 * @returns {string} Formatted value
 */
export const formatFieldValue = (value, field, options = {}) => {
  if (value === null || value === undefined || value === '') {
    return options.emptyText || '-';
  }
  
  const { type } = field;
  const { locale = 'en-US', dateFormat = 'MM/DD/YYYY', timeFormat = '12h' } = options;
  
  switch (type) {
    case 'text':
    case 'email':
    case 'textarea':
      return String(value);
      
    case 'number':
      return formatNumber(value, { locale, ...options });
      
    case 'date':
      return formatDate(value, dateFormat, timeFormat);
      
    case 'checkbox':
      return formatCheckboxValue(value, field.options);
      
    case 'radio':
    case 'select':
      return String(value);
      
    case 'file':
      return formatFileValue(value);
      
    default:
      return String(value);
  }
};

/**
 * Format number with locale-specific formatting
 * @param {number} value - Number to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted number
 */
export const formatNumber = (value, options = {}) => {
  const {
    locale = 'en-US',
    style = 'decimal',
    currency = 'USD',
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping = true
  } = options;
  
  if (isNaN(value)) return '0';
  
  const formatOptions = {
    style,
    useGrouping
  };
  
  if (style === 'currency') {
    formatOptions.currency = currency;
  }
  
  if (minimumFractionDigits !== undefined) {
    formatOptions.minimumFractionDigits = minimumFractionDigits;
  }
  
  if (maximumFractionDigits !== undefined) {
    formatOptions.maximumFractionDigits = maximumFractionDigits;
  }
  
  try {
    return new Intl.NumberFormat(locale, formatOptions).format(value);
  } catch (error) {
    return String(value);
  }
};

/**
 * Format currency value
 * @param {number} value - Amount to format
 * @param {string} currency - Currency code
 * @param {string} locale - Locale for formatting
 * @returns {string} Formatted currency
 */
export const formatCurrency = (value, currency = 'USD', locale = 'en-US') => {
  return formatNumber(value, { style: 'currency', currency, locale });
};

/**
 * Format percentage value
 * @param {number} value - Value to format (0-1 or 0-100)
 * @param {object} options - Formatting options
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, options = {}) => {
  const {
    locale = 'en-US',
    minimumFractionDigits = 1,
    maximumFractionDigits = 2,
    isDecimal = true
  } = options;
  
  const percentage = isDecimal ? value : value / 100;
  
  return formatNumber(percentage, {
    style: 'percent',
    locale,
    minimumFractionDigits,
    maximumFractionDigits
  });
};

/**
 * Format date value
 * @param {Date|string|number} value - Date to format
 * @param {string} format - Date format
 * @param {string} timeFormat - Time format (12h/24h)
 * @returns {string} Formatted date
 */
export const formatDate = (value, format = 'MM/DD/YYYY', timeFormat = '12h') => {
  if (!value) return '';
  
  const date = new Date(value);
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  // Custom format patterns
  const patterns = {
    'YYYY': date.getFullYear(),
    'YY': date.getFullYear().toString().slice(-2),
    'MM': String(date.getMonth() + 1).padStart(2, '0'),
    'M': date.getMonth() + 1,
    'DD': String(date.getDate()).padStart(2, '0'),
    'D': date.getDate(),
    'HH': String(date.getHours()).padStart(2, '0'),
    'H': date.getHours(),
    'hh': String(date.getHours() % 12 || 12).padStart(2, '0'),
    'h': date.getHours() % 12 || 12,
    'mm': String(date.getMinutes()).padStart(2, '0'),
    'm': date.getMinutes(),
    'ss': String(date.getSeconds()).padStart(2, '0'),
    's': date.getSeconds(),
    'A': date.getHours() >= 12 ? 'PM' : 'AM',
    'a': date.getHours() >= 12 ? 'pm' : 'am'
  };
  
  let formatted = format;
  
  // Replace patterns
  Object.entries(patterns).forEach(([pattern, value]) => {
    formatted = formatted.replace(new RegExp(pattern, 'g'), value);
  });
  
  return formatted;
};

/**
 * Format time value
 * @param {Date|string|number} value - Time to format
 * @param {string} format - Time format (12h/24h)
 * @param {boolean} includeSeconds - Include seconds
 * @returns {string} Formatted time
 */
export const formatTime = (value, format = '12h', includeSeconds = false) => {
  const timeFormat = includeSeconds ? 
    (format === '24h' ? 'HH:mm:ss' : 'h:mm:ss A') :
    (format === '24h' ? 'HH:mm' : 'h:mm A');
    
  return formatDate(value, timeFormat);
};

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {Date|string|number} value - Date to format
 * @param {string} locale - Locale for formatting
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (value, locale = 'en-US') => {
  if (!value) return '';
  
  const date = new Date(value);
  const now = new Date();
  
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    const diffMs = date.getTime() - now.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (Math.abs(diffDays) >= 1) {
      return rtf.format(diffDays, 'day');
    } else if (Math.abs(diffHours) >= 1) {
      return rtf.format(diffHours, 'hour');
    } else if (Math.abs(diffMinutes) >= 1) {
      return rtf.format(diffMinutes, 'minute');
    } else {
      return rtf.format(diffSeconds, 'second');
    }
  } catch (error) {
    return formatDate(value, 'MM/DD/YYYY');
  }
};

/**
 * Format checkbox values
 * @param {array} values - Selected values
 * @param {array} options - Available options
 * @returns {string} Formatted checkbox value
 */
export const formatCheckboxValue = (values, options = []) => {
  if (!Array.isArray(values) || values.length === 0) {
    return 'None selected';
  }
  
  return values.join(', ');
};

/**
 * Format file value
 * @param {object|string} value - File value
 * @returns {string} Formatted file value
 */
export const formatFileValue = (value) => {
  if (!value) return 'No file';
  
  if (typeof value === 'string') {
    return value; // Assume it's a filename
  }
  
  if (typeof value === 'object') {
    if (value.name) {
      return `${value.name} (${formatFileSize(value.size || 0)})`;
    }
    if (value.url) {
      return value.url.split('/').pop() || 'File';
    }
  }
  
  return 'File uploaded';
};

/**
 * Format file size in human readable format
 * @param {number} bytes - Size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 B';
  if (!bytes || isNaN(bytes)) return 'Unknown size';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Format phone number
 * @param {string} value - Phone number to format
 * @param {string} format - Format type (us, international)
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (value, format = 'us') => {
  if (!value) return '';
  
  // Remove all non-digits
  const cleaned = value.replace(/\D/g, '');
  
  if (format === 'us') {
    // Format as (XXX) XXX-XXXX
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    if (cleaned.length === 11 && cleaned[0] === '1') {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
  }
  
  // Return original if cannot format
  return value;
};

/**
 * Format address
 * @param {object} address - Address object
 * @param {string} format - Format type (single-line, multi-line)
 * @returns {string} Formatted address
 */
export const formatAddress = (address, format = 'single-line') => {
  if (!address || typeof address !== 'object') return '';
  
  const {
    street,
    street2,
    city,
    state,
    zipCode,
    country
  } = address;
  
  const parts = [];
  
  if (street) parts.push(street);
  if (street2) parts.push(street2);
  
  const cityStateZip = [city, state, zipCode].filter(Boolean).join(' ');
  if (cityStateZip) parts.push(cityStateZip);
  
  if (country) parts.push(country);
  
  if (format === 'multi-line') {
    return parts.join('\n');
  }
  
  return parts.join(', ');
};

/**
 * Format boolean value
 * @param {boolean} value - Boolean value
 * @param {object} options - Formatting options
 * @returns {string} Formatted boolean
 */
export const formatBoolean = (value, options = {}) => {
  const {
    trueText = 'Yes',
    falseText = 'No',
    nullText = 'Not specified'
  } = options;
  
  if (value === null || value === undefined) return nullText;
  return value ? trueText : falseText;
};

/**
 * Format form submission data for display
 * @param {object} submission - Form submission
 * @param {array} fields - Form fields configuration
 * @param {object} options - Formatting options
 * @returns {object} Formatted submission data
 */
export const formatSubmissionData = (submission, fields, options = {}) => {
  if (!submission || !submission.data) return {};
  
  const formatted = {};
  
  fields.forEach(field => {
    const value = submission.data[field.id];
    formatted[field.id] = {
      label: field.label,
      value: formatFieldValue(value, field, options),
      rawValue: value,
      fieldType: field.type
    };
  });
  
  return formatted;
};

/**
 * Format array as readable list
 * @param {array} items - Array of items
 * @param {object} options - Formatting options
 * @returns {string} Formatted list
 */
export const formatList = (items, options = {}) => {
  if (!Array.isArray(items) || items.length === 0) {
    return options.emptyText || '';
  }
  
  const {
    separator = ', ',
    lastSeparator = ' and ',
    maxItems = null,
    moreText = 'more'
  } = options;
  
  let displayItems = items;
  
  if (maxItems && items.length > maxItems) {
    displayItems = items.slice(0, maxItems);
    displayItems.push(`${items.length - maxItems} ${moreText}`);
  }
  
  if (displayItems.length === 1) {
    return String(displayItems[0]);
  }
  
  if (displayItems.length === 2) {
    return displayItems.join(lastSeparator);
  }
  
  const allButLast = displayItems.slice(0, -1);
  const last = displayItems[displayItems.length - 1];
  
  return allButLast.join(separator) + lastSeparator + last;
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 100, suffix = '...') => {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= length) return text;
  
  return text.substring(0, length - suffix.length) + suffix;
};

/**
 * Capitalize first letter of each word
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export const capitalizeWords = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  return text.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
};

/**
 * Format JSON for display
 * @param {any} data - Data to format as JSON
 * @param {number} indent - Indentation spaces
 * @returns {string} Formatted JSON string
 */
export const formatJSON = (data, indent = 2) => {
  try {
    return JSON.stringify(data, null, indent);
  } catch (error) {
    return String(data);
  }
};

/**
 * Format validation errors for display
 * @param {array} errors - Array of validation errors
 * @param {object} options - Formatting options
 * @returns {string} Formatted error message
 */
export const formatValidationErrors = (errors, options = {}) => {
  if (!Array.isArray(errors) || errors.length === 0) {
    return '';
  }
  
  const {
    separator = '\n',
    includeFieldNames = true,
    bulletPoint = '• '
  } = options;
  
  return errors.map(error => {
    let message = bulletPoint + error.message;
    
    if (includeFieldNames && error.fieldLabel) {
      message = `${error.fieldLabel}: ${error.message}`;
    }
    
    return message;
  }).join(separator);
};

/**
 * Format form statistics for display
 * @param {object} stats - Form statistics
 * @param {object} options - Formatting options
 * @returns {object} Formatted statistics
 */
export const formatFormStats = (stats, options = {}) => {
  const {
    locale = 'en-US',
    includePercentages = true
  } = options;
  
  const formatted = {
    totalSubmissions: formatNumber(stats.totalSubmissions || 0, { locale }),
    completionRate: formatPercentage((stats.completionRate || 0) / 100, { locale }),
    averageTime: formatDuration(stats.averageTimeMs || 0),
    bounceRate: formatPercentage((stats.bounceRate || 0) / 100, { locale })
  };
  
  if (includePercentages && stats.fieldStats) {
    formatted.fieldCompletion = Object.entries(stats.fieldStats).reduce((acc, [fieldId, fieldStat]) => {
      acc[fieldId] = {
        ...fieldStat,
        completionRate: formatPercentage((fieldStat.completionRate || 0) / 100, { locale })
      };
      return acc;
    }, {});
  }
  
  return formatted;
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
    lastSeparator = ' and ',
    showZero = false
  } = options;
  
  if (!milliseconds || milliseconds < 0) return '0 seconds';
  
  const timeUnits = {
    years: 365 * 24 * 60 * 60 * 1000,
    months: 30 * 24 * 60 * 60 * 1000,
    weeks: 7 * 24 * 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
    hours: 60 * 60 * 1000,
    minutes: 60 * 1000,
    seconds: 1000
  };
  
  const parts = [];
  let remaining = milliseconds;
  
  for (const unit of units) {
    if (timeUnits[unit] && remaining >= timeUnits[unit]) {
      const value = Math.floor(remaining / timeUnits[unit]);
      remaining = remaining % timeUnits[unit];
      
      if (value > 0 || showZero) {
        const unitName = value === 1 ? unit.slice(0, -1) : unit;
        parts.push(`${value} ${unitName}`);
      }
      
      if (parts.length >= precision) break;
    }
  }
  
  if (parts.length === 0) {
    const smallestUnit = units[units.length - 1] || 'seconds';
    const unitName = smallestUnit.slice(0, -1);
    return `0 ${unitName}`;
  }
  
  return formatList(parts, { separator, lastSeparator });
};

/**
 * Format bytes as data size
 * @param {number} bytes - Size in bytes
 * @param {object} options - Formatting options
 * @returns {string} Formatted size
 */
export const formatDataSize = (bytes, options = {}) => {
  const {
    decimals = 2,
    binary = false,
    separator = ' '
  } = options;
  
  if (bytes === 0) return `0${separator}B`;
  if (!bytes || isNaN(bytes)) return 'Unknown size';
  
  const k = binary ? 1024 : 1000;
  const sizes = binary 
    ? ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB']
    : ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(decimals));
  
  return `${value}${separator}${sizes[i]}`;
};

/**
 * Format URL for display
 * @param {string} url - URL to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted URL
 */
export const formatURL = (url, options = {}) => {
  if (!url || typeof url !== 'string') return '';
  
  const {
    removeProtocol = false,
    removeWWW = false,
    truncateLength = null,
    showDomain = false
  } = options;
  
  let formatted = url;
  
  try {
    const urlObj = new URL(url);
    
    if (showDomain) {
      formatted = urlObj.hostname;
    } else {
      formatted = urlObj.href;
    }
    
    if (removeProtocol) {
      formatted = formatted.replace(/^https?:\/\//, '');
    }
    
    if (removeWWW) {
      formatted = formatted.replace(/^www\./, '');
    }
    
    if (truncateLength && formatted.length > truncateLength) {
      formatted = truncateText(formatted, truncateLength);
    }
    
  } catch (error) {
    // Invalid URL, return original
    formatted = url;
  }
  
  return formatted;
};

/**
 * Format email for display
 * @param {string} email - Email to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted email
 */
export const formatEmail = (email, options = {}) => {
  if (!email || typeof email !== 'string') return '';
  
  const {
    maskDomain = false,
    maskUser = false,
    truncateLength = null
  } = options;
  
  let formatted = email.toLowerCase();
  
  if (maskUser || maskDomain) {
    const [user, domain] = formatted.split('@');
    
    let maskedUser = user;
    let maskedDomain = domain;
    
    if (maskUser && user.length > 2) {
      maskedUser = user[0] + '*'.repeat(user.length - 2) + user[user.length - 1];
    }
    
    if (maskDomain && domain.length > 4) {
      const [domainName, tld] = domain.split('.');
      maskedDomain = domainName[0] + '*'.repeat(domainName.length - 2) + domainName[domainName.length - 1] + '.' + tld;
    }
    
    formatted = maskedUser + '@' + maskedDomain;
  }
  
  if (truncateLength && formatted.length > truncateLength) {
    formatted = truncateText(formatted, truncateLength);
  }
  
  return formatted;
};

/**
 * Format form data for export
 * @param {array} submissions - Form submissions
 * @param {array} fields - Form fields
 * @param {object} options - Export formatting options
 * @returns {array} Formatted data for export
 */
export const formatForExport = (submissions, fields, options = {}) => {
  const {
    includeMetadata = true,
    flattenArrays = true,
    dateFormat = 'YYYY-MM-DD HH:mm:ss',
    emptyValue = '',
    booleanFormat = { true: 'Yes', false: 'No' }
  } = options;
  
  return submissions.map(submission => {
    const row = {};
    
    // Add metadata
    if (includeMetadata) {
      row['Submission ID'] = submission.id || '';
      row['Submitted At'] = submission.submittedAt ? 
        formatDate(submission.submittedAt, dateFormat) : '';
      row['User Email'] = submission.userEmail || '';
    }
    
    // Add field data
    fields.forEach(field => {
      const value = submission.data?.[field.id];
      let formattedValue = emptyValue;
      
      if (value !== null && value !== undefined && value !== '') {
        switch (field.type) {
          case 'checkbox':
            formattedValue = flattenArrays && Array.isArray(value) ? 
              value.join(', ') : value;
            break;
            
          case 'date':
            formattedValue = formatDate(value, dateFormat);
            break;
            
          case 'number':
            formattedValue = formatNumber(value);
            break;
            
          case 'file':
            formattedValue = formatFileValue(value);
            break;
            
          default:
            if (typeof value === 'boolean') {
              formattedValue = booleanFormat[value] || String(value);
            } else if (Array.isArray(value)) {
              formattedValue = flattenArrays ? value.join(', ') : JSON.stringify(value);
            } else if (typeof value === 'object') {
              formattedValue = JSON.stringify(value);
            } else {
              formattedValue = String(value);
            }
        }
      }
      
      row[field.label] = formattedValue;
    });
    
    return row;
  });
};

/**
 * Format field label for display
 * @param {object} field - Field configuration
 * @param {object} options - Formatting options
 * @returns {string} Formatted label
 */
export const formatFieldLabel = (field, options = {}) => {
  if (!field || !field.label) return '';
  
  const {
    includeRequired = true,
    requiredIndicator = ' *',
    includeType = false,
    typeFormat = ' ({type})'
  } = options;
  
  let label = field.label;
  
  if (includeRequired && field.required) {
    label += requiredIndicator;
  }
  
  if (includeType && field.type) {
    label += typeFormat.replace('{type}', field.type);
  }
  
  return label;
};

/**
 * Sanitize text for safe display
 * @param {string} text - Text to sanitize
 * @param {object} options - Sanitization options
 * @returns {string} Sanitized text
 */
export const sanitizeForDisplay = (text, options = {}) => {
  if (!text || typeof text !== 'string') return '';
  
  const {
    removeHtml = true,
    removeScripts = true,
    maxLength = null,
    allowedTags = []
  } = options;
  
  let sanitized = text;
  
  if (removeScripts) {
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  
  if (removeHtml) {
    if (allowedTags.length > 0) {
      // Remove all HTML except allowed tags
      const tagRegex = new RegExp(`<(?!/?(?:${allowedTags.join('|')})\s*\/?)[^>]+>`, 'gi');
      sanitized = sanitized.replace(tagRegex, '');
    } else {
      // Remove all HTML tags
      sanitized = sanitized.replace(/<[^>]*>/g, '');
    }
  }
  
  // Decode HTML entities
  sanitized = sanitized
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  if (maxLength && sanitized.length > maxLength) {
    sanitized = truncateText(sanitized, maxLength);
  }
  
  return sanitized.trim();
};

export default {
  formatFieldValue,
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatDate,
  formatTime,
  formatRelativeTime,
  formatCheckboxValue,
  formatFileValue,
  formatFileSize,
  formatPhoneNumber,
  formatAddress,
  formatBoolean,
  formatSubmissionData,
  formatList,
  truncateText,
  capitalizeWords,
  formatJSON,
  formatValidationErrors,
  formatFormStats,
  formatDuration,
  formatDataSize,
  formatURL,
  formatEmail,
  formatForExport,
  formatFieldLabel,
  sanitizeForDisplay
};