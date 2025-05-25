import { useState, useEffect, useCallback, useRef } from 'react';
import { firebaseService } from '../services/firebaseService.js';
import { analyticsService } from '../services/analyticsService.js';
import { formUtils } from '../utils/index.js';
import { useAuth } from './useAuth.js'; // Assuming you have an auth hook

/**
 * Hook for Firebase form operations
 * Handles CRUD operations, real-time subscriptions, and caching
 */
export const useFirebaseForm = (formId = null) => {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const unsubscribeRef = useRef(null);

  // Load form from Firebase
  const loadForm = useCallback(async (id = formId) => {
    if (!id) return null;

    try {
      setLoading(true);
      setError(null);
      
      const formData = await firebaseService.getForm(id);
      setForm(formData);
      setLastSaved(formData.updatedAt);
      
      return formData;
    } catch (err) {
      setError(err.message);
      console.error('Error loading form:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [formId]);

  // Save form to Firebase
  const saveForm = useCallback(async (formData) => {
    try {
      setSaving(true);
      setError(null);

      // Validate form before saving
      const validation = formUtils.validateFormConfig(formData);
      if (!validation.isValid) {
        throw new Error(`Form validation failed: ${validation.errors.join(', ')}`);
      }

      let savedForm;
      if (formData.id) {
        // Update existing form
        await firebaseService.updateForm(formData.id, formData);
        savedForm = { 
          ...formData, 
          updatedAt: new Date().toISOString() 
        };
      } else {
        // Create new form
        const newFormId = await firebaseService.createForm(formData);
        savedForm = { 
          ...formData, 
          id: newFormId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }

      setForm(savedForm);
      setLastSaved(savedForm.updatedAt);
      
      return savedForm;
    } catch (err) {
      setError(err.message);
      console.error('Error saving form:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  // Delete form
  const deleteForm = useCallback(async (id = formId) => {
    if (!id) throw new Error('Form ID is required');

    try {
      setLoading(true);
      setError(null);
      
      await firebaseService.deleteForm(id);
      setForm(null);
      setLastSaved(null);
      
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error deleting form:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [formId]);

  // Auto-load form when formId changes
  useEffect(() => {
    if (formId) {
      loadForm(formId);
    } else {
      setForm(null);
      setLastSaved(null);
    }
  }, [formId, loadForm]);

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  return {
    form,
    loading,
    saving,
    error,
    lastSaved,
    loadForm,
    saveForm,
    deleteForm,
    clearError: () => setError(null),
    isNew: !form?.id,
    hasUnsavedChanges: form?.updatedAt !== lastSaved
  };
};

/**
 * Hook for managing multiple forms
 * Handles form lists, filtering, and bulk operations
 */
export const useFirebaseForms = (userId = null) => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    sortBy: 'updatedAt',
    sortOrder: 'desc'
  });
  const unsubscribeRef = useRef(null);

  // Load forms from Firebase
  const loadForms = useCallback(async (options = {}) => {
    if (!userId) return [];

    try {
      setLoading(true);
      setError(null);
      
      const formsData = await firebaseService.getForms(userId, {
        status: filters.status,
        orderByField: filters.sortBy,
        orderDirection: filters.sortOrder,
        ...options
      });
      
      setForms(formsData);
      return formsData;
    } catch (err) {
      setError(err.message);
      console.error('Error loading forms:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [userId, filters]);

  // Subscribe to real-time form updates
  const subscribeToForms = useCallback(() => {
    if (!userId) return;

    try {
      // Unsubscribe from previous subscription
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      // Subscribe to forms changes
      unsubscribeRef.current = firebaseService.subscribeToForms(userId, (updatedForms) => {
        setForms(updatedForms);
      });

    } catch (err) {
      setError(err.message);
      console.error('Error subscribing to forms:', err);
    }
  }, [userId]);

  // Create new form
  const createForm = useCallback(async (formData) => {
    try {
      const newFormId = await firebaseService.createForm({
        ...formData,
        createdBy: userId
      });
      
      const newForm = {
        ...formData,
        id: newFormId,
        createdBy: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setForms(prev => [newForm, ...prev]);
      return newForm;
    } catch (err) {
      setError(err.message);
      console.error('Error creating form:', err);
      throw err;
    }
  }, [userId]);

  // Update form in list
  const updateFormInList = useCallback((formId, updates) => {
    setForms(prev => prev.map(form => 
      form.id === formId 
        ? { ...form, ...updates, updatedAt: new Date().toISOString() }
        : form
    ));
  }, []);

  // Delete form from list
  const deleteFormFromList = useCallback(async (formId) => {
    try {
      await firebaseService.deleteForm(formId);
      setForms(prev => prev.filter(form => form.id !== formId));
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error deleting form:', err);
      throw err;
    }
  }, []);

  // Bulk operations
  const bulkDeleteForms = useCallback(async (formIds) => {
    try {
      await firebaseService.bulkDeleteForms(formIds);
      setForms(prev => prev.filter(form => !formIds.includes(form.id)));
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error bulk deleting forms:', err);
      throw err;
    }
  }, []);

  const bulkUpdateForms = useCallback(async (formIds, updates) => {
    try {
      await firebaseService.bulkUpdateForms(formIds, updates);
      setForms(prev => prev.map(form => 
        formIds.includes(form.id)
          ? { ...form, ...updates, updatedAt: new Date().toISOString() }
          : form
      ));
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error bulk updating forms:', err);
      throw err;
    }
  }, []);

  // Filter and search forms
  const filteredForms = useCallback(() => {
    let filtered = [...forms];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(form => 
        form.title.toLowerCase().includes(searchLower) ||
        form.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(form => {
        switch (filters.status) {
          case 'active':
            return form.settings?.isActive;
          case 'inactive':
            return !form.settings?.isActive;
          case 'draft':
            return !form.settings?.isActive && form.fields?.length === 0;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [forms, filters]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Load forms on mount and when filters change
  useEffect(() => {
    if (userId) {
      loadForms();
    }
  }, [userId, loadForms]);

  // Cleanup subscription
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  return {
    forms: filteredForms(),
    allForms: forms,
    loading,
    error,
    filters,
    loadForms,
    subscribeToForms,
    createForm,
    updateFormInList,
    deleteFormFromList,
    bulkDeleteForms,
    bulkUpdateForms,
    updateFilters,
    clearError: () => setError(null)
  };
};

/**
 * Hook for form submissions
 * Handles submission CRUD operations and real-time updates
 */
export const useFormSubmissions = (formId) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 25,
    total: 0
  });
  const unsubscribeRef = useRef(null);

  // Load submissions
  const loadSubmissions = useCallback(async (options = {}) => {
    if (!formId) return [];

    try {
      setLoading(true);
      setError(null);
      
      const submissionsData = await firebaseService.getSubmissions(formId, {
        limitCount: pagination.pageSize,
        ...options
      });
      
      setSubmissions(submissionsData);
      setPagination(prev => ({
        ...prev,
        total: submissionsData.length
      }));
      
      return submissionsData;
    } catch (err) {
      setError(err.message);
      console.error('Error loading submissions:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [formId, pagination.pageSize]);

  // Subscribe to real-time submission updates
  const subscribeToSubmissions = useCallback(() => {
    if (!formId) return;

    try {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      unsubscribeRef.current = firebaseService.subscribeToSubmissions(formId, (updatedSubmissions) => {
        setSubmissions(updatedSubmissions);
        setPagination(prev => ({
          ...prev,
          total: updatedSubmissions.length
        }));
      });

    } catch (err) {
      setError(err.message);
      console.error('Error subscribing to submissions:', err);
    }
  }, [formId]);

  // Create submission
  const createSubmission = useCallback(async (submissionData) => {
    try {
      const submissionId = await firebaseService.createSubmission(formId, submissionData);
      
      const newSubmission = {
        id: submissionId,
        formId,
        data: submissionData.data,
        metadata: {
          ...submissionData.metadata,
          submittedAt: new Date().toISOString()
        }
      };

      setSubmissions(prev => [newSubmission, ...prev]);
      return newSubmission;
    } catch (err) {
      setError(err.message);
      console.error('Error creating submission:', err);
      throw err;
    }
  }, [formId]);

  // Delete submission
  const deleteSubmission = useCallback(async (submissionId) => {
    try {
      await firebaseService.deleteSubmission(submissionId);
      setSubmissions(prev => prev.filter(sub => sub.id !== submissionId));
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error deleting submission:', err);
      throw err;
    }
  }, []);

  // Get form analytics
  const getFormAnalytics = useCallback(async (timeRange = '30d') => {
    if (!formId) return null;

    try {
      const analytics = await firebaseService.getFormAnalytics(formId, {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date()
      });
      
      return analytics;
    } catch (err) {
      setError(err.message);
      console.error('Error getting analytics:', err);
      return null;
    }
  }, [formId]);

  // Load submissions on mount
  useEffect(() => {
    if (formId) {
      loadSubmissions();
    }
  }, [formId, loadSubmissions]);

  // Cleanup subscription
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  return {
    submissions,
    loading,
    error,
    pagination,
    loadSubmissions,
    subscribeToSubmissions,
    createSubmission,
    deleteSubmission,
    getFormAnalytics,
    clearError: () => setError(null)
  };
};

/**
 * Hook for form analytics with caching
 * Handles analytics data loading and real-time updates
 */
export const useFormAnalytics = (formId, options = {}) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const {
    timeRange = '30d',
    autoRefresh = false,
    refreshInterval = 5 * 60 * 1000, // 5 minutes
    includeRealTime = false
  } = options;

  // Load analytics data
  const loadAnalytics = useCallback(async () => {
    if (!formId) return null;

    try {
      setLoading(true);
      setError(null);
      
      // Get form data and submissions
      const [form, submissions] = await Promise.all([
        firebaseService.getForm(formId),
        firebaseService.getSubmissions(formId)
      ]);

      // Calculate analytics
      const analyticsData = analyticsService.calculateFormAnalytics(
        form, 
        submissions, 
        {
          timeRange,
          includeFieldAnalysis: true,
          includeConversionFunnel: true,
          includeUserBehavior: true
        }
      );

      setAnalytics(analyticsData);
      setLastUpdated(new Date());
      
      return analyticsData;
    } catch (err) {
      setError(err.message);
      console.error('Error loading analytics:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [formId, timeRange]);

  // Get real-time analytics
  const getRealTimeAnalytics = useCallback(async () => {
    if (!formId || !includeRealTime) return null;

    try {
      const recentSubmissions = await firebaseService.getSubmissions(formId, {
        orderByField: 'metadata.submittedAt',
        orderDirection: 'desc',
        limitCount: 100
      });

      const realTimeData = analyticsService.getRealTimeAnalytics(formId, recentSubmissions);
      return realTimeData;
    } catch (err) {
      console.error('Error getting real-time analytics:', err);
      return null;
    }
  }, [formId, includeRealTime]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && formId) {
      const interval = setInterval(() => {
        loadAnalytics();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, formId, refreshInterval, loadAnalytics]);

  // Load analytics on mount
  useEffect(() => {
    if (formId) {
      loadAnalytics();
    }
  }, [formId, loadAnalytics]);

  return {
    analytics,
    loading,
    error,
    lastUpdated,
    loadAnalytics,
    getRealTimeAnalytics,
    clearError: () => setError(null),
    isStale: lastUpdated && (Date.now() - lastUpdated.getTime()) > refreshInterval
  };
};

/**
 * Hook for Firebase connection status
 * Monitors connectivity and provides offline/online status
 */
export const useFirebaseConnection = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [lastConnected, setLastConnected] = useState(new Date());
  const [connectionError, setConnectionError] = useState(null);

  // Test Firebase connection
  const testConnection = useCallback(async () => {
    try {
      // Simple test - try to get user forms
      await firebaseService.getForms('test', { limitCount: 1 });
      setIsConnected(true);
      setLastConnected(new Date());
      setConnectionError(null);
      return true;
    } catch (err) {
      setIsConnected(false);
      setConnectionError(err.message);
      return false;
    }
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsConnected(true);
      testConnection();
    };

    const handleOffline = () => {
      setIsConnected(false);
      setConnectionError('Device is offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial connection test
    testConnection();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [testConnection]);

  return {
    isConnected,
    lastConnected,
    connectionError,
    testConnection
  };
};

export default useFirebaseForm;