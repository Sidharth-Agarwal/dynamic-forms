import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for localStorage with JSON serialization
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value
 * @returns {array} [value, setValue, removeValue]
 */
export const useLocalStorage = (key, defaultValue = null) => {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const setStoredValue = useCallback((newValue) => {
    try {
      setValue(newValue);
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  const removeValue = useCallback(() => {
    try {
      setValue(defaultValue);
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, defaultValue]);

  return [value, setStoredValue, removeValue];
};

/**
 * Hook for localStorage with expiration
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value
 * @param {number} ttl - Time to live in milliseconds
 * @returns {array} [value, setValue, removeValue, isExpired]
 */
export const useLocalStorageWithExpiry = (key, defaultValue = null, ttl = 24 * 60 * 60 * 1000) => {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;

      const parsed = JSON.parse(item);
      
      // Check if item has expiry and is expired
      if (parsed.expiry && Date.now() > parsed.expiry) {
        localStorage.removeItem(key);
        return defaultValue;
      }

      return parsed.value || defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const [isExpired, setIsExpired] = useState(false);

  const setStoredValue = useCallback((newValue) => {
    try {
      const expiry = Date.now() + ttl;
      const item = {
        value: newValue,
        expiry,
        createdAt: new Date().toISOString()
      };
      
      setValue(newValue);
      localStorage.setItem(key, JSON.stringify(item));
      setIsExpired(false);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, ttl]);

  const removeValue = useCallback(() => {
    try {
      setValue(defaultValue);
      localStorage.removeItem(key);
      setIsExpired(false);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, defaultValue]);

  // Check expiry periodically
  useEffect(() => {
    const checkExpiry = () => {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          if (parsed.expiry && Date.now() > parsed.expiry) {
            setValue(defaultValue);
            localStorage.removeItem(key);
            setIsExpired(true);
          }
        }
      } catch (error) {
        console.warn(`Error checking expiry for key "${key}":`, error);
      }
    };

    const interval = setInterval(checkExpiry, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [key, defaultValue]);

  return [value, setStoredValue, removeValue, isExpired];
};

/**
 * Hook for multiple localStorage keys
 * @param {object} keys - Object with key-defaultValue pairs
 * @returns {object} Object with values, setters, and removers
 */
export const useMultipleLocalStorage = (keys = {}) => {
  const [values, setValues] = useState(() => {
    const initialValues = {};
    
    Object.entries(keys).forEach(([key, defaultValue]) => {
      try {
        const item = localStorage.getItem(key);
        initialValues[key] = item ? JSON.parse(item) : defaultValue;
      } catch (error) {
        console.warn(`Error reading localStorage key "${key}":`, error);
        initialValues[key] = defaultValue;
      }
    });
    
    return initialValues;
  });

  const setValue = useCallback((key, newValue) => {
    try {
      setValues(prev => ({ ...prev, [key]: newValue }));
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, []);

  const removeValue = useCallback((key) => {
    try {
      const defaultValue = keys[key];
      setValues(prev => ({ ...prev, [key]: defaultValue }));
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [keys]);

  const clearAll = useCallback(() => {
    Object.keys(keys).forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Error removing localStorage key "${key}":`, error);
      }
    });
    
    setValues(Object.fromEntries(
      Object.entries(keys).map(([key, defaultValue]) => [key, defaultValue])
    ));
  }, [keys]);

  return {
    values,
    setValue,
    removeValue,
    clearAll
  };
};

/**
 * Hook for localStorage with sync across tabs
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value
 * @returns {array} [value, setValue, removeValue]
 */
export const useLocalStorageSync = (key, defaultValue = null) => {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const setStoredValue = useCallback((newValue) => {
    try {
      setValue(newValue);
      localStorage.setItem(key, JSON.stringify(newValue));
      
      // Dispatch custom event to notify other tabs
      window.dispatchEvent(new CustomEvent('local-storage-change', {
        detail: { key, value: newValue }
      }));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  const removeValue = useCallback(() => {
    try {
      setValue(defaultValue);
      localStorage.removeItem(key);
      
      // Dispatch custom event to notify other tabs
      window.dispatchEvent(new CustomEvent('local-storage-change', {
        detail: { key, value: defaultValue }
      }));
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, defaultValue]);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key) {
        try {
          const newValue = e.newValue ? JSON.parse(e.newValue) : defaultValue;
          setValue(newValue);
        } catch (error) {
          console.warn(`Error parsing storage change for key "${key}":`, error);
        }
      }
    };

    const handleCustomStorageChange = (e) => {
      if (e.detail.key === key) {
        setValue(e.detail.value);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage-change', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage-change', handleCustomStorageChange);
    };
  }, [key, defaultValue]);

  return [value, setStoredValue, removeValue];
};

/**
 * Hook for localStorage with validation
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value
 * @param {function} validator - Validation function
 * @returns {array} [value, setValue, removeValue, isValid]
 */
export const useLocalStorageWithValidation = (key, defaultValue = null, validator = null) => {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      const parsedValue = item ? JSON.parse(item) : defaultValue;
      
      // Validate the value if validator is provided
      if (validator && !validator(parsedValue)) {
        localStorage.removeItem(key);
        return defaultValue;
      }
      
      return parsedValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const [isValid, setIsValid] = useState(true);

  const setStoredValue = useCallback((newValue) => {
    try {
      // Validate before setting
      if (validator && !validator(newValue)) {
        setIsValid(false);
        console.warn(`Validation failed for localStorage key "${key}"`);
        return false;
      }

      setValue(newValue);
      localStorage.setItem(key, JSON.stringify(newValue));
      setIsValid(true);
      return true;
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
      setIsValid(false);
      return false;
    }
  }, [key, validator]);

  const removeValue = useCallback(() => {
    try {
      setValue(defaultValue);
      localStorage.removeItem(key);
      setIsValid(true);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, defaultValue]);

  return [value, setStoredValue, removeValue, isValid];
};

/**
 * Hook for localStorage with size limit
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value
 * @param {number} maxSize - Maximum size in bytes
 * @returns {array} [value, setValue, removeValue, size, isOverLimit]
 */
export const useLocalStorageWithSizeLimit = (key, defaultValue = null, maxSize = 1024 * 1024) => {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const [size, setSize] = useState(0);
  const [isOverLimit, setIsOverLimit] = useState(false);

  const calculateSize = useCallback((data) => {
    return new Blob([JSON.stringify(data)]).size;
  }, []);

  const setStoredValue = useCallback((newValue) => {
    try {
      const valueSize = calculateSize(newValue);
      
      if (valueSize > maxSize) {
        setIsOverLimit(true);
        console.warn(`Value size (${valueSize} bytes) exceeds limit (${maxSize} bytes) for key "${key}"`);
        return false;
      }

      setValue(newValue);
      localStorage.setItem(key, JSON.stringify(newValue));
      setSize(valueSize);
      setIsOverLimit(false);
      return true;
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
      return false;
    }
  }, [key, maxSize, calculateSize]);

  const removeValue = useCallback(() => {
    try {
      setValue(defaultValue);
      localStorage.removeItem(key);
      setSize(0);
      setIsOverLimit(false);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, defaultValue]);

  // Calculate initial size
  useEffect(() => {
    setSize(calculateSize(value));
  }, [value, calculateSize]);

  return [value, setStoredValue, removeValue, size, isOverLimit];
};

/**
 * Hook for localStorage with compression
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value
 * @param {boolean} compress - Whether to compress data
 * @returns {array} [value, setValue, removeValue]
 */
export const useLocalStorageWithCompression = (key, defaultValue = null, compress = true) => {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;

      if (compress && item.startsWith('compressed:')) {
        // Simple compression placeholder - in real implementation, use LZ-string or similar
        const compressedData = item.substring(11);
        return JSON.parse(atob(compressedData));
      }

      return JSON.parse(item);
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const setStoredValue = useCallback((newValue) => {
    try {
      setValue(newValue);
      
      if (compress) {
        // Simple compression placeholder - in real implementation, use LZ-string or similar
        const compressed = 'compressed:' + btoa(JSON.stringify(newValue));
        localStorage.setItem(key, compressed);
      } else {
        localStorage.setItem(key, JSON.stringify(newValue));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, compress]);

  const removeValue = useCallback(() => {
    try {
      setValue(defaultValue);
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, defaultValue]);

  return [value, setStoredValue, removeValue];
};

export default {
  useLocalStorage,
  useLocalStorageWithExpiry,
  useMultipleLocalStorage,
  useLocalStorageSync,
  useLocalStorageWithValidation,
  useLocalStorageWithSizeLimit,
  useLocalStorageWithCompression
};