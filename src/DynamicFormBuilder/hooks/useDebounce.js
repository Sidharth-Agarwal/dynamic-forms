// hooks/useDebounce.js
import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for debouncing values
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} - Debounced value
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Custom hook for debounced callbacks
 * @param {Function} callback - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @param {Array} deps - Dependencies array
 * @returns {Function} - Debounced callback function
 */
export const useDebouncedCallback = (callback, delay = 300, deps = []) => {
  const timeoutRef = useRef(null);

  const debouncedCallback = useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay, ...deps]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Cancel function to manually cancel pending debounced calls
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return [debouncedCallback, cancel];
};

/**
 * Custom hook for debounced state updates
 * @param {any} initialValue - Initial state value
 * @param {number} delay - Delay in milliseconds
 * @returns {[any, Function, any]} - [debouncedValue, setValue, immediateValue]
 */
export const useDebouncedState = (initialValue, delay = 300) => {
  const [immediateValue, setImmediateValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(immediateValue);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [immediateValue, delay]);

  return [debouncedValue, setImmediateValue, immediateValue];
};

/**
 * Custom hook for debounced search functionality
 * @param {Function} searchFunction - Function to execute search
 * @param {number} delay - Delay in milliseconds
 * @returns {[Function, boolean, Function]} - [search, isSearching, cancel]
 */
export const useDebouncedSearch = (searchFunction, delay = 500) => {
  const [isSearching, setIsSearching] = useState(false);
  const timeoutRef = useRef(null);
  const currentSearchRef = useRef(null);

  const search = useCallback(
    async (searchTerm) => {
      // Cancel any pending search
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Cancel current search if it's still running
      if (currentSearchRef.current) {
        currentSearchRef.current.cancelled = true;
      }

      if (!searchTerm?.trim()) {
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      timeoutRef.current = setTimeout(async () => {
        const searchPromise = { cancelled: false };
        currentSearchRef.current = searchPromise;

        try {
          const result = await searchFunction(searchTerm);
          
          // Only update if this search wasn't cancelled
          if (!searchPromise.cancelled) {
            setIsSearching(false);
            return result;
          }
        } catch (error) {
          if (!searchPromise.cancelled) {
            setIsSearching(false);
            throw error;
          }
        }
      }, delay);
    },
    [searchFunction, delay]
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (currentSearchRef.current) {
      currentSearchRef.current.cancelled = true;
      currentSearchRef.current = null;
    }
    
    setIsSearching(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return [search, isSearching, cancel];
};

export default useDebounce;