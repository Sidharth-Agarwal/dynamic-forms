// hooks/useLocalStorage.js
import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for localStorage with JSON serialization
 * @param {string} key - Storage key
 * @param {any} initialValue - Initial value if key doesn't exist
 * @returns {[any, Function, Function]} - [value, setValue, removeValue]
 */
export const useLocalStorage = (key, initialValue) => {
  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue;
      }

      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback(
    (value) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        setStoredValue(valueToStore);
        
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          
          // Dispatch a custom event to notify other components
          window.dispatchEvent(
            new CustomEvent('localStorage', {
              detail: { key, newValue: valueToStore }
            })
          );
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        
        // Dispatch a custom event to notify other components
        window.dispatchEvent(
          new CustomEvent('localStorage', {
            detail: { key, newValue: undefined }
          })
        );
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes to this localStorage key from other components
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.detail?.key === key) {
        setStoredValue(e.detail.newValue ?? initialValue);
      }
    };

    // Listen for our custom localStorage event
    window.addEventListener('localStorage', handleStorageChange);
    
    // Listen for native storage events (from other tabs/windows)
    const handleNativeStorageChange = (e) => {
      if (e.key === key) {
        try {
          setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue);
        } catch (error) {
          console.warn(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };
    
    window.addEventListener('storage', handleNativeStorageChange);

    return () => {
      window.removeEventListener('localStorage', handleStorageChange);
      window.removeEventListener('storage', handleNativeStorageChange);
    };
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

/**
 * Custom hook for localStorage with session-based expiration
 * @param {string} key - Storage key
 * @param {any} initialValue - Initial value
 * @param {number} ttl - Time to live in milliseconds
 * @returns {[any, Function, Function, boolean]} - [value, setValue, removeValue, isExpired]
 */
export const useLocalStorageWithExpiry = (key, initialValue, ttl = 24 * 60 * 60 * 1000) => {
  const [isExpired, setIsExpired] = useState(false);

  const [storedValue, setStoredValue] = useState(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue;
      }

      const item = window.localStorage.getItem(key);
      if (!item) {
        return initialValue;
      }

      const parsedItem = JSON.parse(item);
      
      // Check if item has expiry structure
      if (parsedItem && typeof parsedItem === 'object' && parsedItem.expiry) {
        if (Date.now() > parsedItem.expiry) {
          // Item has expired
          window.localStorage.removeItem(key);
          setIsExpired(true);
          return initialValue;
        }
        return parsedItem.value;
      }
      
      // Fallback for items without expiry structure
      return parsedItem;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        const itemWithExpiry = {
          value: valueToStore,
          expiry: Date.now() + ttl
        };
        
        setStoredValue(valueToStore);
        setIsExpired(false);
        
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(itemWithExpiry));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue, ttl]
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      setIsExpired(false);
      
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue, isExpired];
};

/**
 * Hook for managing form drafts in localStorage
 * @param {string} formId - Unique form identifier
 * @param {number} autosaveInterval - Auto-save interval in milliseconds
 * @returns {Object} - Draft management functions
 */
export const useFormDraft = (formId, autosaveInterval = 30000) => {
  const draftKey = `form-draft-${formId}`;
  const [draft, setDraft, removeDraft] = useLocalStorageWithExpiry(
    draftKey, 
    null, 
    24 * 60 * 60 * 1000 // 24 hours
  );

  const saveDraft = useCallback(
    (formData) => {
      const draftData = {
        formId,
        data: formData,
        savedAt: new Date().toISOString(),
        version: '1.0'
      };
      setDraft(draftData);
    },
    [formId, setDraft]
  );

  const loadDraft = useCallback(() => {
    return draft;
  }, [draft]);

  const clearDraft = useCallback(() => {
    removeDraft();
  }, [removeDraft]);

  const hasDraft = useCallback(() => {
    return !!draft;
  }, [draft]);

  // Auto-save functionality
  useEffect(() => {
    if (!autosaveInterval || autosaveInterval <= 0) return;

    const interval = setInterval(() => {
      // This would be triggered by the parent component
      // when form data changes
    }, autosaveInterval);

    return () => clearInterval(interval);
  }, [autosaveInterval]);

  return {
    draft,
    saveDraft,
    loadDraft,
    clearDraft,
    hasDraft
  };
};

/**
 * Hook for managing user preferences
 * @param {string} userId - User ID (optional)
 * @returns {Object} - Preferences management
 */
export const useUserPreferences = (userId = 'anonymous') => {
  const prefsKey = `user-preferences-${userId}`;
  const [preferences, setPreferences] = useLocalStorage(prefsKey, {
    theme: 'light',
    language: 'en',
    autoSave: true,
    notifications: true,
    formBuilder: {
      showGrid: true,
      snapToGrid: false,
      showFieldTypes: true,
      compactMode: false
    }
  });

  const updatePreference = useCallback(
    (key, value) => {
      setPreferences(prev => ({
        ...prev,
        [key]: value
      }));
    },
    [setPreferences]
  );

  const updateFormBuilderPreference = useCallback(
    (key, value) => {
      setPreferences(prev => ({
        ...prev,
        formBuilder: {
          ...prev.formBuilder,
          [key]: value
        }
      }));
    },
    [setPreferences]
  );

  const resetPreferences = useCallback(() => {
    setPreferences({
      theme: 'light',
      language: 'en',
      autoSave: true,
      notifications: true,
      formBuilder: {
        showGrid: true,
        snapToGrid: false,
        showFieldTypes: true,
        compactMode: false
      }
    });
  }, [setPreferences]);

  return {
    preferences,
    updatePreference,
    updateFormBuilderPreference,
    resetPreferences
  };
};

/**
 * Hook for managing recent items (forms, templates, etc.)
 * @param {string} type - Type of items (forms, templates)
 * @param {number} maxItems - Maximum number of recent items to store
 * @returns {Object} - Recent items management
 */
export const useRecentItems = (type = 'forms', maxItems = 10) => {
  const recentKey = `recent-${type}`;
  const [recentItems, setRecentItems] = useLocalStorage(recentKey, []);

  const addRecentItem = useCallback(
    (item) => {
      setRecentItems(prev => {
        // Remove item if it already exists
        const filtered = prev.filter(existing => existing.id !== item.id);
        
        // Add to beginning and limit to maxItems
        return [item, ...filtered].slice(0, maxItems);
      });
    },
    [setRecentItems, maxItems]
  );

  const removeRecentItem = useCallback(
    (itemId) => {
      setRecentItems(prev => prev.filter(item => item.id !== itemId));
    },
    [setRecentItems]
  );

  const clearRecentItems = useCallback(() => {
    setRecentItems([]);
  }, [setRecentItems]);

  return {
    recentItems,
    addRecentItem,
    removeRecentItem,
    clearRecentItems
  };
};

export default useLocalStorage;