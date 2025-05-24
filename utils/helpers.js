/**
 * General utility helper functions for the Form Builder module
 */

/**
 * Generate a unique identifier
 * @param {string} prefix - Optional prefix for the ID
 * @returns {string} Unique identifier
 */
export const generateId = (prefix = 'id') => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 9);
  return `${prefix}_${timestamp}_${randomPart}`;
};

/**
 * Generate a unique field ID
 * @param {string} fieldType - Type of field
 * @returns {string} Unique field ID
 */
export const generateFieldId = (fieldType = 'field') => {
  return generateId(`${fieldType}_field`);
};

/**
 * Generate a unique form ID
 * @returns {string} Unique form ID
 */
export const generateFormId = () => {
  return generateId('form');
};

/**
 * Deep clone an object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (obj instanceof File) return obj; // Don't clone File objects
  
  if (typeof obj === 'object') {
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  
  return obj;
};

/**
 * Deep merge two objects
 * @param {object} target - Target object
 * @param {object} source - Source object
 * @returns {object} Merged object
 */
export const deepMerge = (target, source) => {
  const result = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (
        source[key] && 
        typeof source[key] === 'object' && 
        !Array.isArray(source[key]) &&
        !(source[key] instanceof Date) &&
        !(source[key] instanceof File)
      ) {
        result[key] = deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  
  return result;
};

/**
 * Debounce function execution
 * @param {function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute immediately on first call
 * @returns {function} Debounced function
 */
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
};

/**
 * Throttle function execution
 * @param {function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Capitalize first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert string to title case
 * @param {string} str - String to convert
 * @returns {string} Title case string
 */
export const toTitleCase = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.toLowerCase().split(' ').map(capitalize).join(' ');
};

/**
 * Convert string to camelCase
 * @param {string} str - String to convert
 * @returns {string} CamelCase string
 */
export const toCamelCase = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
};

/**
 * Convert string to kebab-case
 * @param {string} str - String to convert
 * @returns {string} Kebab-case string
 */
export const toKebabCase = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
};

/**
 * Convert string to snake_case
 * @param {string} str - String to convert
 * @returns {string} Snake_case string
 */
export const toSnakeCase = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/\s+/g, '_')
    .toLowerCase();
};

/**
 * Truncate string with ellipsis
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated string
 */
export const truncate = (str, length, suffix = '...') => {
  if (!str || typeof str !== 'string') return '';
  if (str.length <= length) return str;
  return str.substring(0, length - suffix.length) + suffix;
};

/**
 * Format file size in human readable format
 * @param {number} bytes - Size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Format number with thousands separator
 * @param {number} num - Number to format
 * @param {string} locale - Locale for formatting
 * @returns {string} Formatted number
 */
export const formatNumber = (num, locale = 'en-US') => {
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat(locale).format(num);
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @param {string} locale - Locale for formatting
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  if (isNaN(amount)) return '$0.00';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Format percentage
 * @param {number} value - Value to format (0-1 or 0-100)
 * @param {number} decimals - Number of decimal places
 * @param {boolean} isDecimal - Whether input is decimal (0-1) or percentage (0-100)
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, decimals = 1, isDecimal = true) => {
  if (isNaN(value)) return '0%';
  const percentage = isDecimal ? value * 100 : value;
  return `${percentage.toFixed(decimals)}%`;
};

/**
 * Get nested object property safely
 * @param {object} obj - Object to access
 * @param {string} path - Dot notation path (e.g., 'user.profile.name')
 * @param {any} defaultValue - Default value if path not found
 * @returns {any} Property value or default
 */
export const getNestedProperty = (obj, path, defaultValue = undefined) => {
  if (!obj || !path) return defaultValue;
  
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : defaultValue;
  }, obj);
};

/**
 * Set nested object property safely
 * @param {object} obj - Object to modify
 * @param {string} path - Dot notation path
 * @param {any} value - Value to set
 * @returns {object} Modified object
 */
export const setNestedProperty = (obj, path, value) => {
  const keys = path.split('.');
  const lastKey = keys.pop();
  
  const target = keys.reduce((current, key) => {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    return current[key];
  }, obj);
  
  target[lastKey] = value;
  return obj;
};

/**
 * Remove duplicates from array
 * @param {array} arr - Array to deduplicate
 * @param {string|function} key - Key to use for comparison or function
 * @returns {array} Deduplicated array
 */
export const removeDuplicates = (arr, key = null) => {
  if (!Array.isArray(arr)) return [];
  
  if (!key) {
    return [...new Set(arr)];
  }
  
  if (typeof key === 'function') {
    const seen = new Set();
    return arr.filter(item => {
      const keyValue = key(item);
      if (seen.has(keyValue)) {
        return false;
      }
      seen.add(keyValue);
      return true;
    });
  }
  
  const seen = new Set();
  return arr.filter(item => {
    const keyValue = getNestedProperty(item, key);
    if (seen.has(keyValue)) {
      return false;
    }
    seen.add(keyValue);
    return true;
  });
};

/**
 * Group array by property
 * @param {array} arr - Array to group
 * @param {string|function} key - Key to group by or function
 * @returns {object} Grouped object
 */
export const groupBy = (arr, key) => {
  if (!Array.isArray(arr)) return {};
  
  return arr.reduce((groups, item) => {
    const groupKey = typeof key === 'function' ? key(item) : getNestedProperty(item, key);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {});
};

/**
 * Sort array by property
 * @param {array} arr - Array to sort
 * @param {string|function} key - Key to sort by or function
 * @param {string} direction - Sort direction ('asc' or 'desc')
 * @returns {array} Sorted array
 */
export const sortBy = (arr, key, direction = 'asc') => {
  if (!Array.isArray(arr)) return [];
  
  const sorted = [...arr].sort((a, b) => {
    let aVal = typeof key === 'function' ? key(a) : getNestedProperty(a, key);
    let bVal = typeof key === 'function' ? key(b) : getNestedProperty(b, key);
    
    // Handle different data types
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
  
  return sorted;
};

/**
 * Filter array by multiple conditions
 * @param {array} arr - Array to filter
 * @param {object} filters - Filter conditions
 * @returns {array} Filtered array
 */
export const filterBy = (arr, filters) => {
  if (!Array.isArray(arr) || !filters) return arr;
  
  return arr.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      const itemValue = getNestedProperty(item, key);
      
      // Handle different filter types
      if (Array.isArray(value)) {
        return value.includes(itemValue);
      }
      
      if (typeof value === 'object' && value !== null) {
        if (value.min !== undefined && itemValue < value.min) return false;
        if (value.max !== undefined && itemValue > value.max) return false;
        if (value.includes && !itemValue.toLowerCase().includes(value.includes.toLowerCase())) return false;
        return true;
      }
      
      if (typeof value === 'string' && typeof itemValue === 'string') {
        return itemValue.toLowerCase().includes(value.toLowerCase());
      }
      
      return itemValue === value;
    });
  });
};

/**
 * Paginate array
 * @param {array} arr - Array to paginate
 * @param {number} page - Page number (1-based)
 * @param {number} pageSize - Items per page
 * @returns {object} Pagination result
 */
export const paginate = (arr, page = 1, pageSize = 10) => {
  if (!Array.isArray(arr)) return { data: [], pagination: {} };
  
  const totalItems = arr.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    data: arr.slice(startIndex, endIndex),
    pagination: {
      currentPage,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
      startIndex,
      endIndex: Math.min(endIndex, totalItems)
    }
  };
};

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 * @param {any} value - Value to check
 * @returns {boolean} True if empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (value instanceof Date) return false;
  if (value instanceof File) return false;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  if (typeof value === 'number') return isNaN(value);
  return false;
};

/**
 * Check if value is not empty
 * @param {any} value - Value to check
 * @returns {boolean} True if not empty
 */
export const isNotEmpty = (value) => !isEmpty(value);

/**
 * Retry function with exponential backoff
 * @param {function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} Promise that resolves when function succeeds or max retries reached
 */
export const retry = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        break;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Create a promise that resolves after specified delay
 * @param {number} ms - Delay in milliseconds
 * @returns {Promise} Promise that resolves after delay
 */
export const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Generate random string
 * @param {number} length - Length of string
 * @param {string} chars - Characters to use
 * @returns {string} Random string
 */
export const randomString = (length = 10, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generate random number between min and max
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {boolean} integer - Whether to return integer
 * @returns {number} Random number
 */
export const randomNumber = (min = 0, max = 100, integer = true) => {
  const random = Math.random() * (max - min) + min;
  return integer ? Math.floor(random) : random;
};

/**
 * Shuffle array randomly
 * @param {array} arr - Array to shuffle
 * @returns {array} Shuffled array
 */
export const shuffle = (arr) => {
  if (!Array.isArray(arr)) return [];
  const shuffled = [...arr];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
};

/**
 * Pick random item from array
 * @param {array} arr - Array to pick from
 * @returns {any} Random item
 */
export const pickRandom = (arr) => {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
};

/**
 * Clamp number between min and max
 * @param {number} num - Number to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped number
 */
export const clamp = (num, min, max) => {
  return Math.min(Math.max(num, min), max);
};

/**
 * Map number from one range to another
 * @param {number} value - Value to map
 * @param {number} inMin - Input minimum
 * @param {number} inMax - Input maximum
 * @param {number} outMin - Output minimum
 * @param {number} outMax - Output maximum
 * @returns {number} Mapped value
 */
export const mapRange = (value, inMin, inMax, outMin, outMax) => {
  return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
};

/**
 * Check if object has property
 * @param {object} obj - Object to check
 * @param {string} path - Property path
 * @returns {boolean} True if property exists
 */
export const hasProperty = (obj, path) => {
  return getNestedProperty(obj, path) !== undefined;
};

/**
 * Create URL with query parameters
 * @param {string} baseUrl - Base URL
 * @param {object} params - Query parameters
 * @returns {string} URL with query string
 */
export const createUrl = (baseUrl, params = {}) => {
  const url = new URL(baseUrl, window.location.origin);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, value.toString());
    }
  });
  
  return url.toString();
};

/**
 * Parse query string to object
 * @param {string} queryString - Query string
 * @returns {object} Parsed parameters
 */
export const parseQueryString = (queryString = window.location.search) => {
  const params = {};
  const urlParams = new URLSearchParams(queryString);
  
  for (const [key, value] of urlParams) {
    params[key] = value;
  }
  
  return params;
};

/**
 * Download data as file
 * @param {string|Blob} data - Data to download
 * @param {string} filename - File name
 * @param {string} mimeType - MIME type
 */
export const downloadFile = (data, filename, mimeType = 'text/plain') => {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Promise that resolves to success status
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const result = document.execCommand('copy');
    document.body.removeChild(textArea);
    return result;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Detect device type
 * @returns {object} Device information
 */
export const detectDevice = () => {
  const userAgent = navigator.userAgent;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)/i.test(userAgent);
  const isDesktop = !isMobile && !isTablet;
  
  return {
    isMobile: isMobile && !isTablet,
    isTablet,
    isDesktop,
    userAgent,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight
  };
};

/**
 * Check if element is in viewport
 * @param {HTMLElement} element - Element to check
 * @param {number} threshold - Threshold percentage (0-1)
 * @returns {boolean} True if in viewport
 */
export const isInViewport = (element, threshold = 0) => {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;
  
  const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
  const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);
  
  if (threshold > 0) {
    const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
    const visibleWidth = Math.min(rect.right, windowWidth) - Math.max(rect.left, 0);
    const visibleArea = visibleHeight * visibleWidth;
    const totalArea = rect.height * rect.width;
    const visiblePercentage = visibleArea / totalArea;
    
    return vertInView && horInView && visiblePercentage >= threshold;
  }
  
  return vertInView && horInView;
};

/**
 * Scroll element into view smoothly
 * @param {HTMLElement} element - Element to scroll to
 * @param {object} options - Scroll options
 */
export const scrollToElement = (element, options = {}) => {
  if (!element) return;
  
  const {
    behavior = 'smooth',
    block = 'start',
    inline = 'nearest',
    offset = 0
  } = options;
  
  if (offset !== 0) {
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition + offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior
    });
  } else {
    element.scrollIntoView({
      behavior,
      block,
      inline
    });
  }
};

/**
 * Local storage helpers with error handling
 */
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

export default {
  generateId,
  generateFieldId,
  generateFormId,
  deepClone,
  deepMerge,
  debounce,
  throttle,
  capitalize,
  toTitleCase,
  toCamelCase,
  toKebabCase,
  toSnakeCase,
  truncate,
  formatFileSize,
  formatNumber,
  formatCurrency,
  formatPercentage,
  getNestedProperty,
  setNestedProperty,
  removeDuplicates,
  groupBy,
  sortBy,
  filterBy,
  paginate,
  isEmpty,
  isNotEmpty,
  retry,
  delay,
  randomString,
  randomNumber,
  shuffle,
  pickRandom,
  clamp,
  mapRange,
  hasProperty,
  createUrl,
  parseQueryString,
  downloadFile,
  copyToClipboard,
  detectDevice,
  isInViewport,
  scrollToElement,
  storage
};