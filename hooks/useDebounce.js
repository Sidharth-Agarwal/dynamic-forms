import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * Basic debounce hook
 * Debounces a value with a specified delay
 */
export const useDebounce = (value, delay) => {
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
 * Advanced debounce hook with additional options
 * Provides more control over the debouncing behavior
 */
export const useAdvancedDebounce = (value, delay, options = {}) => {
  const {
    leading = false,
    trailing = true,
    maxWait = null
  } = options;

  const [debouncedValue, setDebouncedValue] = useState(value);
  const lastCallTime = useRef();
  const lastInvokeTime = useRef(0);
  const timerId = useRef();
  const lastArgs = useRef();

  const invokeFunc = useCallback((time) => {
    const args = lastArgs.current;
    lastArgs.current = undefined;
    lastInvokeTime.current = time;
    setDebouncedValue(args);
  }, []);

  const leadingEdge = useCallback((time) => {
    lastInvokeTime.current = time;
    timerId.current = setTimeout(timerExpired, delay);
    return leading ? invokeFunc(time) : debouncedValue;
  }, [delay, leading, invokeFunc, debouncedValue]);

  const remainingWait = useCallback((time) => {
    const timeSinceLastCall = time - lastCallTime.current;
    const timeSinceLastInvoke = time - lastInvokeTime.current;
    const timeWaiting = delay - timeSinceLastCall;

    return maxWait !== null
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }, [delay, maxWait]);

  const shouldInvoke = useCallback((time) => {
    const timeSinceLastCall = time - lastCallTime.current;
    const timeSinceLastInvoke = time - lastInvokeTime.current;

    return (
      lastCallTime.current === undefined ||
      timeSinceLastCall >= delay ||
      timeSinceLastCall < 0 ||
      (maxWait !== null && timeSinceLastInvoke >= maxWait)
    );
  }, [delay, maxWait]);

  const timerExpired = useCallback(() => {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timerId.current = setTimeout(timerExpired, remainingWait(time));
  }, [shouldInvoke, remainingWait]);

  const trailingEdge = useCallback((time) => {
    timerId.current = undefined;

    if (trailing && lastArgs.current) {
      return invokeFunc(time);
    }
    lastArgs.current = undefined;
    return debouncedValue;
  }, [trailing, invokeFunc, debouncedValue]);

  useEffect(() => {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs.current = value;
    lastCallTime.current = time;

    if (isInvoking) {
      if (timerId.current === undefined) {
        return leadingEdge(lastCallTime.current);
      }
      if (maxWait !== null) {
        timerId.current = setTimeout(timerExpired, delay);
        return invokeFunc(lastCallTime.current);
      }
    }
    if (timerId.current === undefined) {
      timerId.current = setTimeout(timerExpired, delay);
    }
  }, [value, delay, shouldInvoke, leadingEdge, timerExpired, invokeFunc, maxWait]);

  useEffect(() => {
    return () => {
      if (timerId.current) {
        clearTimeout(timerId.current);
      }
    };
  }, []);

  return debouncedValue;
};

/**
 * Debounced callback hook
 * Returns a memoized debounced version of the callback
 */
export const useDebouncedCallback = (callback, delay, deps = []) => {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef();

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay, ...deps]);

  // Cancel function
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  // Flush function (execute immediately)
  const flush = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    return callbackRef.current(...args);
  }, []);

  return {
    callback: debouncedCallback,
    cancel,
    flush
  };
};

/**
 * Throttle hook
 * Throttles a value or callback to execute at most once per interval
 */
export const useThrottle = (value, interval) => {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastExecuted = useRef(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeElapsed = now - lastExecuted.current;

    if (timeElapsed >= interval) {
      setThrottledValue(value);
      lastExecuted.current = now;
    } else {
      const timeoutId = setTimeout(() => {
        setThrottledValue(value);
        lastExecuted.current = Date.now();
      }, interval - timeElapsed);

      return () => clearTimeout(timeoutId);
    }
  }, [value, interval]);

  return throttledValue;
};

/**
 * Throttled callback hook
 * Returns a memoized throttled version of the callback
 */
export const useThrottledCallback = (callback, interval, deps = []) => {
  const callbackRef = useRef(callback);
  const lastExecuted = useRef(0);
  const timeoutRef = useRef();

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const throttledCallback = useCallback((...args) => {
    const now = Date.now();
    const timeElapsed = now - lastExecuted.current;

    if (timeElapsed >= interval) {
      lastExecuted.current = now;
      return callbackRef.current(...args);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        lastExecuted.current = Date.now();
        callbackRef.current(...args);
      }, interval - timeElapsed);
    }
  }, [interval, ...deps]);

  return throttledCallback;
};

/**
 * Smart debounce hook that adapts delay based on input frequency
 * Useful for search inputs or real-time validation
 */
export const useSmartDebounce = (value, options = {}) => {
  const {
    minDelay = 100,
    maxDelay = 1000,
    adaptationFactor = 0.1,
    resetThreshold = 5000
  } = options;

  const [debouncedValue, setDebouncedValue] = useState(value);
  const [currentDelay, setCurrentDelay] = useState(minDelay);
  
  const lastChangeTime = useRef(Date.now());
  const changeFrequency = useRef([]);
  const timeoutRef = useRef();

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastChange = now - lastChangeTime.current;
    
    // Reset if too much time has passed
    if (timeSinceLastChange > resetThreshold) {
      changeFrequency.current = [];
      setCurrentDelay(minDelay);
    } else {
      // Track change frequency
      changeFrequency.current.push(timeSinceLastChange);
      
      // Keep only recent changes (last 10)
      if (changeFrequency.current.length > 10) {
        changeFrequency.current = changeFrequency.current.slice(-10);
      }
      
      // Calculate average time between changes
      const avgTimeBetweenChanges = 
        changeFrequency.current.reduce((sum, time) => sum + time, 0) / 
        changeFrequency.current.length;
      
      // Adapt delay based on frequency
      const adaptedDelay = Math.min(
        maxDelay,
        Math.max(minDelay, avgTimeBetweenChanges * adaptationFactor)
      );
      
      setCurrentDelay(adaptedDelay);
    }
    
    lastChangeTime.current = now;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout with adapted delay
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, currentDelay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, currentDelay, minDelay, maxDelay, adaptationFactor, resetThreshold]);

  return {
    value: debouncedValue,
    currentDelay,
    changeFrequency: changeFrequency.current.length
  };
};

/**
 * Batch debounce hook
 * Collects multiple values and debounces them as a batch
 */
export const useBatchDebounce = (delay = 300, maxBatchSize = 10) => {
  const [batch, setBatch] = useState([]);
  const batchRef = useRef([]);
  const timeoutRef = useRef();

  const addToBatch = useCallback((item) => {
    batchRef.current.push(item);

    // Process immediately if batch is full
    if (batchRef.current.length >= maxBatchSize) {
      setBatch([...batchRef.current]);
      batchRef.current = [];
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      if (batchRef.current.length > 0) {
        setBatch([...batchRef.current]);
        batchRef.current = [];
      }
      timeoutRef.current = undefined;
    }, delay);
  }, [delay, maxBatchSize]);

  const clearBatch = useCallback(() => {
    batchRef.current = [];
    setBatch([]);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  const flushBatch = useCallback(() => {
    if (batchRef.current.length > 0) {
      setBatch([...batchRef.current]);
      batchRef.current = [];
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    batch,
    addToBatch,
    clearBatch,
    flushBatch,
    batchSize: batchRef.current.length,
    isPending: timeoutRef.current !== undefined
  };
};

/**
 * Debounced state hook
 * Manages both immediate and debounced versions of state
 */
export const useDebouncedState = (initialValue, delay) => {
  const [immediateValue, setImmediateValue] = useState(initialValue);
  const debouncedValue = useDebounce(immediateValue, delay);

  const setValue = useCallback((value) => {
    setImmediateValue(value);
  }, []);

  return {
    value: immediateValue,
    debouncedValue,
    setValue,
    isPending: immediateValue !== debouncedValue
  };
};

/**
 * Performance-optimized debounce hook
 * Uses requestAnimationFrame for better performance
 */
export const useRAFDebounce = (callback, deps = []) => {
  const rafRef = useRef();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback((...args) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      callbackRef.current(...args);
    });
  }, deps);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

/**
 * Debounce hook with loading state
 * Provides loading state during debounce period
 */
export const useDebounceWithLoading = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef();

  useEffect(() => {
    // Start loading if value is different from debounced value
    if (value !== debouncedValue) {
      setIsLoading(true);
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
      setIsLoading(false);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, debouncedValue]);

  return {
    value: debouncedValue,
    isLoading
  };
};

/**
 * Multiple debounce hook
 * Manages multiple debounced values with different delays
 */
export const useMultipleDebounce = (values, delays) => {
  const [debouncedValues, setDebouncedValues] = useState(values);
  const timeoutRefs = useRef({});

  useEffect(() => {
    Object.keys(values).forEach(key => {
      const value = values[key];
      const delay = delays[key] || 300;

      // Clear existing timeout for this key
      if (timeoutRefs.current[key]) {
        clearTimeout(timeoutRefs.current[key]);
      }

      // Set new timeout for this key
      timeoutRefs.current[key] = setTimeout(() => {
        setDebouncedValues(prev => ({
          ...prev,
          [key]: value
        }));
      }, delay);
    });

    return () => {
      Object.values(timeoutRefs.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, [values, delays]);

  return debouncedValues;
};

/**
 * Conditional debounce hook
 * Only applies debouncing when a condition is met
 */
export const useConditionalDebounce = (value, delay, condition = true) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timeoutRef = useRef();

  useEffect(() => {
    if (!condition) {
      // If condition is false, update immediately
      setDebouncedValue(value);
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, condition]);

  return debouncedValue;
};

/**
 * Debounce hook with history
 * Keeps track of value history during debouncing
 */
export const useDebounceWithHistory = (value, delay, maxHistory = 10) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [history, setHistory] = useState([value]);
  const timeoutRef = useRef();

  useEffect(() => {
    // Add to history
    setHistory(prev => {
      const newHistory = [...prev, value];
      return newHistory.length > maxHistory 
        ? newHistory.slice(-maxHistory)
        : newHistory;
    });

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, maxHistory]);

  const clearHistory = useCallback(() => {
    setHistory([debouncedValue]);
  }, [debouncedValue]);

  return {
    value: debouncedValue,
    history,
    clearHistory,
    historyLength: history.length
  };
};

/**
 * Debounce hook for async operations
 * Handles cancellation of async operations when value changes
 */
export const useAsyncDebounce = (asyncFunction, delay) => {
  const [value, setValue] = useState();
  const [result, setResult] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const abortControllerRef = useRef();
  const timeoutRef = useRef();

  const debouncedExecute = useCallback((inputValue) => {
    // Cancel previous operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Create new abort controller
        abortControllerRef.current = new AbortController();
        
        const asyncResult = await asyncFunction(inputValue, abortControllerRef.current.signal);
        
        if (!abortControllerRef.current.signal.aborted) {
          setResult(asyncResult);
        }
      } catch (err) {
        if (!abortControllerRef.current?.signal.aborted) {
          setError(err);
        }
      } finally {
        if (!abortControllerRef.current?.signal.aborted) {
          setLoading(false);
        }
      }
    }, delay);
  }, [asyncFunction, delay]);

  const execute = useCallback((inputValue) => {
    setValue(inputValue);
    debouncedExecute(inputValue);
  }, [debouncedExecute]);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    execute,
    cancel,
    value,
    result,
    loading,
    error
  };
};

/**
 * Utility hook for measuring debounce performance
 * Helps optimize debounce delays based on actual usage
 */
export const useDebounceMetrics = () => {
  const [metrics, setMetrics] = useState({
    totalCalls: 0,
    actualExecutions: 0,
    averageDelay: 0,
    efficiency: 0
  });

  const callTimes = useRef([]);
  const executionTimes = useRef([]);

  const recordCall = useCallback(() => {
    const now = Date.now();
    callTimes.current.push(now);
    
    setMetrics(prev => ({
      ...prev,
      totalCalls: prev.totalCalls + 1
    }));
  }, []);

  const recordExecution = useCallback((delay) => {
    const now = Date.now();
    executionTimes.current.push(now);
    
    setMetrics(prev => {
      const actualExecutions = prev.actualExecutions + 1;
      const efficiency = (actualExecutions / prev.totalCalls) * 100;
      
      // Calculate average delay
      const delays = executionTimes.current.map((time, index) => {
        const callTime = callTimes.current[callTimes.current.length - executionTimes.current.length + index];
        return time - callTime;
      });
      
      const averageDelay = delays.reduce((sum, d) => sum + d, 0) / delays.length;

      return {
        ...prev,
        actualExecutions,
        efficiency: Math.round(efficiency * 100) / 100,
        averageDelay: Math.round(averageDelay)
      };
    });
  }, []);

  const resetMetrics = useCallback(() => {
    callTimes.current = [];
    executionTimes.current = [];
    setMetrics({
      totalCalls: 0,
      actualExecutions: 0,
      averageDelay: 0,
      efficiency: 0
    });
  }, []);

  return {
    metrics,
    recordCall,
    recordExecution,
    resetMetrics
  };
};

export default {
  useDebounce,
  useAdvancedDebounce,
  useDebouncedCallback,
  useThrottle,
  useThrottledCallback,
  useSmartDebounce,
  useBatchDebounce,
  useDebouncedState,
  useRAFDebounce,
  useDebounceWithLoading,
  useMultipleDebounce,
  useConditionalDebounce,
  useDebounceWithHistory,
  useAsyncDebounce,
  useDebounceMetrics
};