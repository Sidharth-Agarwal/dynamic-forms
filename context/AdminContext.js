import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { helpers, dataUtils } from '../utils/index.js';

// Action types
const ACTIONS = {
  // Forms management
  SET_FORMS: 'SET_FORMS',
  ADD_FORM: 'ADD_FORM',
  UPDATE_FORM: 'UPDATE_FORM',
  DELETE_FORM: 'DELETE_FORM',
  
  // Submissions management
  SET_SUBMISSIONS: 'SET_SUBMISSIONS',
  ADD_SUBMISSION: 'ADD_SUBMISSION',
  DELETE_SUBMISSION: 'DELETE_SUBMISSION',
  
  // Loading states
  SET_FORMS_LOADING: 'SET_FORMS_LOADING',
  SET_SUBMISSIONS_LOADING: 'SET_SUBMISSIONS_LOADING',
  SET_ANALYTICS_LOADING: 'SET_ANALYTICS_LOADING',
  
  // Error states
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // UI state
  SET_SELECTED_FORM: 'SET_SELECTED_FORM',
  SET_VIEW_MODE: 'SET_VIEW_MODE',
  SET_FILTERS: 'SET_FILTERS',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_PAGINATION: 'SET_PAGINATION',
  SET_SORT: 'SET_SORT',
  
  // Bulk operations
  SET_SELECTED_ITEMS: 'SET_SELECTED_ITEMS',
  TOGGLE_ITEM_SELECTION: 'TOGGLE_ITEM_SELECTION',
  SELECT_ALL_ITEMS: 'SELECT_ALL_ITEMS',
  CLEAR_SELECTION: 'CLEAR_SELECTION',
  
  // Analytics
  SET_ANALYTICS_DATA: 'SET_ANALYTICS_DATA',
  SET_ANALYTICS_PERIOD: 'SET_ANALYTICS_PERIOD',
  
  // Export
  SET_EXPORT_STATUS: 'SET_EXPORT_STATUS'
};

// Initial state
const initialState = {
  // Forms data
  forms: [],
  formsLoading: false,
  
  // Submissions data
  submissions: [],
  submissionsLoading: false,
  
  // Analytics data
  analytics: {
    data: null,
    loading: false,
    period: '30d' // '7d', '30d', '90d', '1y', 'all'
  },
  
  // UI state
  selectedFormId: null,
  viewMode: 'grid', // 'grid', 'list', 'table'
  searchQuery: '',
  filters: {
    status: 'all', // 'all', 'active', 'inactive', 'draft'
    dateRange: null,
    createdBy: 'all'
  },
  
  // Pagination
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0
  },
  
  // Sorting
  sort: {
    field: 'updatedAt',
    direction: 'desc' // 'asc', 'desc'
  },
  
  // Bulk operations
  selectedItems: [],
  bulkOperationInProgress: false,
  
  // Export
  exportStatus: 'idle', // 'idle', 'preparing', 'downloading', 'completed', 'error'
  
  // Error handling
  error: null,
  
  // Statistics
  stats: {
    totalForms: 0,
    activeForms: 0,
    totalSubmissions: 0,
    submissionsToday: 0,
    averageCompletionRate: 0
  }
};

// Reducer function
const adminReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_FORMS:
      const forms = action.payload;
      return {
        ...state,
        forms,
        formsLoading: false,
        stats: {
          ...state.stats,
          totalForms: forms.length,
          activeForms: forms.filter(f => f.settings?.isActive).length
        }
      };
      
    case ACTIONS.ADD_FORM:
      const newForms = [action.payload, ...state.forms];
      return {
        ...state,
        forms: newForms,
        stats: {
          ...state.stats,
          totalForms: newForms.length,
          activeForms: newForms.filter(f => f.settings?.isActive).length
        }
      };
      
    case ACTIONS.UPDATE_FORM:
      const updatedForms = state.forms.map(form =>
        form.id === action.payload.id ? { ...form, ...action.payload } : form
      );
      
      return {
        ...state,
        forms: updatedForms,
        stats: {
          ...state.stats,
          activeForms: updatedForms.filter(f => f.settings?.isActive).length
        }
      };
      
    case ACTIONS.DELETE_FORM:
      const filteredForms = state.forms.filter(form => form.id !== action.payload);
      return {
        ...state,
        forms: filteredForms,
        selectedFormId: state.selectedFormId === action.payload ? null : state.selectedFormId,
        stats: {
          ...state.stats,
          totalForms: filteredForms.length,
          activeForms: filteredForms.filter(f => f.settings?.isActive).length
        }
      };
      
    case ACTIONS.SET_SUBMISSIONS:
      const submissions = action.payload;
      const today = new Date().toDateString();
      const submissionsToday = submissions.filter(sub => 
        new Date(sub.submittedAt).toDateString() === today
      ).length;
      
      return {
        ...state,
        submissions,
        submissionsLoading: false,
        stats: {
          ...state.stats,
          totalSubmissions: submissions.length,
          submissionsToday
        }
      };
      
    case ACTIONS.ADD_SUBMISSION:
      return {
        ...state,
        submissions: [action.payload, ...state.submissions],
        stats: {
          ...state.stats,
          totalSubmissions: state.stats.totalSubmissions + 1
        }
      };
      
    case ACTIONS.DELETE_SUBMISSION:
      return {
        ...state,
        submissions: state.submissions.filter(sub => sub.id !== action.payload),
        stats: {
          ...state.stats,
          totalSubmissions: state.stats.totalSubmissions - 1
        }
      };
      
    case ACTIONS.SET_FORMS_LOADING:
      return {
        ...state,
        formsLoading: action.payload
      };
      
    case ACTIONS.SET_SUBMISSIONS_LOADING:
      return {
        ...state,
        submissionsLoading: action.payload
      };
      
    case ACTIONS.SET_ANALYTICS_LOADING:
      return {
        ...state,
        analytics: {
          ...state.analytics,
          loading: action.payload
        }
      };
      
    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        formsLoading: false,
        submissionsLoading: false,
        analytics: {
          ...state.analytics,
          loading: false
        }
      };
      
    case ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
      
    case ACTIONS.SET_SELECTED_FORM:
      return {
        ...state,
        selectedFormId: action.payload
      };
      
    case ACTIONS.SET_VIEW_MODE:
      return {
        ...state,
        viewMode: action.payload
      };
      
    case ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        pagination: { ...state.pagination, page: 1 } // Reset to first page
      };
      
    case ACTIONS.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload,
        pagination: { ...state.pagination, page: 1 } // Reset to first page
      };
      
    case ACTIONS.SET_PAGINATION:
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload }
      };
      
    case ACTIONS.SET_SORT:
      return {
        ...state,
        sort: action.payload,
        pagination: { ...state.pagination, page: 1 } // Reset to first page
      };
      
    case ACTIONS.SET_SELECTED_ITEMS:
      return {
        ...state,
        selectedItems: action.payload
      };
      
    case ACTIONS.TOGGLE_ITEM_SELECTION:
      const itemId = action.payload;
      const isSelected = state.selectedItems.includes(itemId);
      
      return {
        ...state,
        selectedItems: isSelected
          ? state.selectedItems.filter(id => id !== itemId)
          : [...state.selectedItems, itemId]
      };
      
    case ACTIONS.SELECT_ALL_ITEMS:
      return {
        ...state,
        selectedItems: action.payload
      };
      
    case ACTIONS.CLEAR_SELECTION:
      return {
        ...state,
        selectedItems: []
      };
      
    case ACTIONS.SET_ANALYTICS_DATA:
      return {
        ...state,
        analytics: {
          ...state.analytics,
          data: action.payload,
          loading: false
        }
      };
      
    case ACTIONS.SET_ANALYTICS_PERIOD:
      return {
        ...state,
        analytics: {
          ...state.analytics,
          period: action.payload
        }
      };
      
    case ACTIONS.SET_EXPORT_STATUS:
      return {
        ...state,
        exportStatus: action.payload
      };
      
    default:
      return state;
  }
};

// Create context
const AdminContext = createContext();

// Provider component
export const AdminProvider = ({ children, config = {} }) => {
  const [state, dispatch] = useReducer(adminReducer, initialState);
  
  // Configuration options
  const {
    enableRealTimeUpdates = false,
    refreshInterval = 30000,
    onFormUpdate = null,
    onSubmissionReceived = null,
    onError = null
  } = config;
  
  // Real-time updates effect
  useEffect(() => {
    if (!enableRealTimeUpdates) return;
    
    const interval = setInterval(() => {
      // Refresh data periodically
      // This would typically connect to a real-time service
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [enableRealTimeUpdates, refreshInterval]);
  
  // Action creators
  const actions = {
    // Forms management
    setForms: useCallback((forms) => {
      dispatch({ type: ACTIONS.SET_FORMS, payload: forms });
    }, []),
    
    addForm: useCallback((form) => {
      dispatch({ type: ACTIONS.ADD_FORM, payload: form });
      onFormUpdate?.('created', form);
    }, [onFormUpdate]),
    
    updateForm: useCallback((formId, updates) => {
      const updatedForm = { id: formId, ...updates, updatedAt: new Date().toISOString() };
      dispatch({ type: ACTIONS.UPDATE_FORM, payload: updatedForm });
      onFormUpdate?.('updated', updatedForm);
    }, [onFormUpdate]),
    
    deleteForm: useCallback((formId) => {
      dispatch({ type: ACTIONS.DELETE_FORM, payload: formId });
      onFormUpdate?.('deleted', { id: formId });
    }, [onFormUpdate]),
    
    // Submissions management
    setSubmissions: useCallback((submissions) => {
      dispatch({ type: ACTIONS.SET_SUBMISSIONS, payload: submissions });
    }, []),
    
    addSubmission: useCallback((submission) => {
      dispatch({ type: ACTIONS.ADD_SUBMISSION, payload: submission });
      onSubmissionReceived?.(submission);
    }, [onSubmissionReceived]),
    
    deleteSubmission: useCallback((submissionId) => {
      dispatch({ type: ACTIONS.DELETE_SUBMISSION, payload: submissionId });
    }, []),
    
    // Loading states
    setFormsLoading: useCallback((loading) => {
      dispatch({ type: ACTIONS.SET_FORMS_LOADING, payload: loading });
    }, []),
    
    setSubmissionsLoading: useCallback((loading) => {
      dispatch({ type: ACTIONS.SET_SUBMISSIONS_LOADING, payload: loading });
    }, []),
    
    setAnalyticsLoading: useCallback((loading) => {
      dispatch({ type: ACTIONS.SET_ANALYTICS_LOADING, payload: loading });
    }, []),
    
    // Error handling
    setError: useCallback((error) => {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error });
      onError?.(error);
    }, [onError]),
    
    clearError: useCallback(() => {
      dispatch({ type: ACTIONS.CLEAR_ERROR });
    }, []),
    
    // UI state
    selectForm: useCallback((formId) => {
      dispatch({ type: ACTIONS.SET_SELECTED_FORM, payload: formId });
    }, []),
    
    setViewMode: useCallback((mode) => {
      dispatch({ type: ACTIONS.SET_VIEW_MODE, payload: mode });
      helpers.storage.set('adminViewMode', mode);
    }, []),
    
    setFilters: useCallback((filters) => {
      dispatch({ type: ACTIONS.SET_FILTERS, payload: filters });
    }, []),
    
    setSearchQuery: useCallback((query) => {
      dispatch({ type: ACTIONS.SET_SEARCH_QUERY, payload: query });
    }, []),
    
    setPagination: useCallback((pagination) => {
      dispatch({ type: ACTIONS.SET_PAGINATION, payload: pagination });
    }, []),
    
    setSort: useCallback((field, direction) => {
      dispatch({ type: ACTIONS.SET_SORT, payload: { field, direction } });
    }, []),
    
    // Bulk operations
    toggleItemSelection: useCallback((itemId) => {
      dispatch({ type: ACTIONS.TOGGLE_ITEM_SELECTION, payload: itemId });
    }, []),
    
    selectAllItems: useCallback((itemIds) => {
      dispatch({ type: ACTIONS.SELECT_ALL_ITEMS, payload: itemIds });
    }, []),
    
    clearSelection: useCallback(() => {
      dispatch({ type: ACTIONS.CLEAR_SELECTION });
    }, []),
    
    bulkDeleteForms: useCallback(async (formIds) => {
      try {
        // This would call your API to delete multiple forms
        for (const formId of formIds) {
          actions.deleteForm(formId);
        }
        actions.clearSelection();
      } catch (error) {
        actions.setError(error);
      }
    }, []),
    
    bulkToggleFormsStatus: useCallback(async (formIds, isActive) => {
      try {
        // This would call your API to toggle status of multiple forms
        for (const formId of formIds) {
          actions.updateForm(formId, { 'settings.isActive': isActive });
        }
        actions.clearSelection();
      } catch (error) {
        actions.setError(error);
      }
    }, []),
    
    // Analytics
    setAnalyticsData: useCallback((data) => {
      dispatch({ type: ACTIONS.SET_ANALYTICS_DATA, payload: data });
    }, []),
    
    setAnalyticsPeriod: useCallback((period) => {
      dispatch({ type: ACTIONS.SET_ANALYTICS_PERIOD, payload: period });
    }, []),
    
    calculateAnalytics: useCallback(() => {
      if (!state.forms.length || !state.submissions.length) return null;
      
      const analytics = dataUtils.calculateFormStats(state.submissions, state.forms);
      actions.setAnalyticsData(analytics);
      
      return analytics;
    }, [state.forms, state.submissions]),
    
    // Export functionality
    exportData: useCallback(async (format, options = {}) => {
      try {
        dispatch({ type: ACTIONS.SET_EXPORT_STATUS, payload: 'preparing' });
        
        const { formIds = [], includeSubmissions = true } = options;
        const formsToExport = formIds.length 
          ? state.forms.filter(f => formIds.includes(f.id))
          : state.forms;
        
        let exportData = [];
        
        if (includeSubmissions) {
          const submissionsToExport = state.submissions.filter(s => 
            formIds.length === 0 || formIds.includes(s.formId)
          );
          
          exportData = dataUtils.prepareForExport(
            submissionsToExport, 
            formsToExport.flatMap(f => f.fields),
            format
          );
        } else {
          exportData = formsToExport;
        }
        
        dispatch({ type: ACTIONS.SET_EXPORT_STATUS, payload: 'downloading' });
        
        // Create and download file
        const filename = `form-builder-export-${new Date().toISOString().split('T')[0]}`;
        
        if (format === 'csv') {
          const csv = helpers.convertToCSV(exportData);
          helpers.downloadFile(csv, `${filename}.csv`, 'text/csv');
        } else if (format === 'json') {
          const json = JSON.stringify(exportData, null, 2);
          helpers.downloadFile(json, `${filename}.json`, 'application/json');
        }
        
        dispatch({ type: ACTIONS.SET_EXPORT_STATUS, payload: 'completed' });
        
        // Reset status after a delay
        setTimeout(() => {
          dispatch({ type: ACTIONS.SET_EXPORT_STATUS, payload: 'idle' });
        }, 3000);
        
      } catch (error) {
        dispatch({ type: ACTIONS.SET_EXPORT_STATUS, payload: 'error' });
        actions.setError(error);
      }
    }, [state.forms, state.submissions])
  };
  
  // Computed values
  const computed = {
    // Filtered and sorted data
    filteredForms: (() => {
      let filtered = [...state.forms];
      
      // Apply search filter
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        filtered = filtered.filter(form => 
          form.title.toLowerCase().includes(query) ||
          form.description?.toLowerCase().includes(query)
        );
      }
      
      // Apply status filter
      if (state.filters.status !== 'all') {
        filtered = filtered.filter(form => {
          switch (state.filters.status) {
            case 'active':
              return form.settings?.isActive;
            case 'inactive':
              return !form.settings?.isActive;
            case 'draft':
              return !form.settings?.isActive && form.fields.length === 0;
            default:
              return true;
          }
        });
      }
      
      // Apply date range filter
      if (state.filters.dateRange) {
        const { start, end } = state.filters.dateRange;
        filtered = filtered.filter(form => {
          const formDate = new Date(form.createdAt);
          return formDate >= start && formDate <= end;
        });
      }
      
      // Apply sorting
      const sorted = helpers.sortBy(filtered, state.sort.field, state.sort.direction);
      
      return sorted;
    })(),
    
    paginatedForms: (() => {
      const { data, pagination } = helpers.paginate(
        computed.filteredForms, 
        state.pagination.page, 
        state.pagination.pageSize
      );
      
      // Update total count
      if (pagination.totalItems !== state.pagination.total) {
        setTimeout(() => {
          actions.setPagination({ total: pagination.totalItems });
        }, 0);
      }
      
      return { data, pagination };
    })(),
    
    // Form submissions by form
    submissionsByForm: helpers.groupBy(state.submissions, 'formId'),
    
    // Selected form data
    selectedForm: state.selectedFormId 
      ? state.forms.find(f => f.id === state.selectedFormId)
      : null,
    
    selectedFormSubmissions: state.selectedFormId 
      ? state.submissions.filter(s => s.formId === state.selectedFormId)
      : [],
    
    // Selection state
    hasSelection: state.selectedItems.length > 0,
    isAllSelected: state.selectedItems.length === computed.filteredForms.length,
    selectionCount: state.selectedItems.length,
    
    // Analytics computed values
    analyticsData: state.analytics.data || {
      totalSubmissions: state.stats.totalSubmissions,
      submissionsToday: state.stats.submissionsToday,
      averageCompletionRate: state.stats.averageCompletionRate,
      topForms: state.forms
        .map(form => ({
          id: form.id,
          title: form.title,
          submissions: computed.submissionsByForm[form.id]?.length || 0
        }))
        .sort((a, b) => b.submissions - a.submissions)
        .slice(0, 5)
    },
    
    // Status indicators
    isDataLoading: state.formsLoading || state.submissionsLoading,
    hasError: !!state.error,
    isEmpty: state.forms.length === 0,
    
    // Export status
    isExporting: ['preparing', 'downloading'].includes(state.exportStatus),
    exportStatusText: {
      idle: '',
      preparing: 'Preparing export...',
      downloading: 'Downloading...',
      completed: 'Export completed!',
      error: 'Export failed'
    }[state.exportStatus]
  };
  
  // Load saved preferences
  useEffect(() => {
    const savedViewMode = helpers.storage.get('adminViewMode');
    if (savedViewMode && savedViewMode !== state.viewMode) {
      actions.setViewMode(savedViewMode);
    }
  }, []);
  
  const value = {
    // State
    ...state,
    
    // Actions
    ...actions,
    
    // Computed values
    ...computed,
    
    // Configuration
    config: {
      enableRealTimeUpdates,
      refreshInterval
    }
  };
  
  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

// Custom hook to use the context
export const useAdmin = () => {
  const context = useContext(AdminContext);
  
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  
  return context;
};

// Utility hooks for specific admin functions
export const useFormManagement = () => {
  const { 
    forms, 
    filteredForms, 
    paginatedForms, 
    selectedForm,
    formsLoading,
    addForm, 
    updateForm, 
    deleteForm, 
    selectForm 
  } = useAdmin();
  
  return {
    forms,
    filteredForms,
    paginatedForms,
    selectedForm,
    isLoading: formsLoading,
    addForm,
    updateForm,
    deleteForm,
    selectForm
  };
};

export const useSubmissionManagement = () => {
  const { 
    submissions, 
    selectedFormSubmissions, 
    submissionsLoading,
    addSubmission, 
    deleteSubmission 
  } = useAdmin();
  
  return {
    submissions,
    selectedFormSubmissions,
    isLoading: submissionsLoading,
    addSubmission,
    deleteSubmission
  };
};

export const useAnalytics = () => {
  const { 
    analytics, 
    analyticsData, 
    stats,
    setAnalyticsPeriod, 
    calculateAnalytics 
  } = useAdmin();
  
  return {
    data: analyticsData,
    period: analytics.period,
    isLoading: analytics.loading,
    stats,
    setPeriod: setAnalyticsPeriod,
    calculate: calculateAnalytics
  };
};

export const useBulkOperations = () => {
  const { 
    selectedItems, 
    hasSelection, 
    selectionCount,
    toggleItemSelection, 
    selectAllItems, 
    clearSelection,
    bulkDeleteForms, 
    bulkToggleFormsStatus 
  } = useAdmin();
  
  return {
    selectedItems,
    hasSelection,
    selectionCount,
    toggleSelection: toggleItemSelection,
    selectAll: selectAllItems,
    clearSelection,
    bulkDelete: bulkDeleteForms,
    bulkToggleStatus: bulkToggleFormsStatus
  };
};

// Export action types for testing
export { ACTIONS };

export default AdminContext;