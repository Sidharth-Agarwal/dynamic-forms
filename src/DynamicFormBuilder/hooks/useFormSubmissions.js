// hooks/useFormSubmissions.js
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNotification } from '../context/NotificationContext';
import { submissionService, exportService, analyticsService } from '../services';
import { useDebounce } from './useDebounce';
import { sortBy, groupBy } from '../utils';

/**
 * Hook for managing form submissions
 * @param {string} formId - Form ID to manage submissions for
 * @param {Object} options - Configuration options
 * @returns {Object} - Submissions state and functions
 */
export const useFormSubmissions = (formId, options = {}) => {
  const {
    pageSize = 20,
    autoRefresh = false,
    refreshInterval = 30000,
    enableRealtime = false
  } = options;

  // Context and services
  const { showSuccess, showError, showWarning } = useNotification();

  // State
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ field: 'submittedAt', direction: 'desc' });
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    searchTerm: ''
  });
  const [selectedSubmissions, setSelectedSubmissions] = useState(new Set());

  // Debounced search term
  const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);

  // Load submissions
  const loadSubmissions = useCallback(async (page = currentPage, append = false) => {
    if (!formId) return;

    setIsLoading(true);
    try {
      const queryOptions = {
        page,
        limit: pageSize,
        sortBy: sortConfig.field,
        sortDirection: sortConfig.direction,
        ...filters,
        searchTerm: debouncedSearchTerm
      };

      // Apply date range filter
      if (filters.dateRange !== 'all') {
        const now = new Date();
        switch (filters.dateRange) {
          case 'today':
            queryOptions.startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            queryOptions.startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            queryOptions.startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          case 'year':
            queryOptions.startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
        }
      }

      const result = await submissionService.getFormSubmissions(formId, queryOptions);
      
      setSubmissions(prev => append ? [...prev, ...result] : result);
      setTotalCount(result.length); // In real implementation, this would come from API
    } catch (error) {
      console.error('Error loading submissions:', error);
      showError('Failed to load submissions');
    } finally {
      setIsLoading(false);
    }
  }, [formId, currentPage, pageSize, sortConfig, filters, debouncedSearchTerm, showError]);

  // Load submissions when dependencies change
  useEffect(() => {
    if (formId) {
      loadSubmissions(1, false);
    }
  }, [formId, sortConfig, filters, debouncedSearchTerm]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || !formId) return;

    const interval = setInterval(() => {
      loadSubmissions(1, false);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, formId, loadSubmissions]);

  // Delete submission
  const deleteSubmission = useCallback(async (submissionId) => {
    try {
      await submissionService.deleteSubmission(submissionId);
      setSubmissions(prev => prev.filter(sub => sub.id !== submissionId));
      setSelectedSubmissions(prev => {
        const updated = new Set(prev);
        updated.delete(submissionId);
        return updated;
      });
      showSuccess('Submission deleted successfully');
    } catch (error) {
      console.error('Error deleting submission:', error);
      showError('Failed to delete submission');
    }
  }, [showSuccess, showError]);

  // Bulk delete submissions
  const bulkDeleteSubmissions = useCallback(async (submissionIds = Array.from(selectedSubmissions)) => {
    if (submissionIds.length === 0) return;

    try {
      // Show confirmation for bulk delete
      const confirmed = window.confirm(
        `Are you sure you want to delete ${submissionIds.length} submission(s)? This action cannot be undone.`
      );
      
      if (!confirmed) return;

      const results = await submissionService.bulkDeleteSubmissions(submissionIds);
      
      // Remove successfully deleted submissions
      setSubmissions(prev => 
        prev.filter(sub => !results.success.includes(sub.id))
      );
      
      // Clear selections
      setSelectedSubmissions(new Set());
      
      // Show results
      if (results.success.length > 0) {
        showSuccess(`${results.success.length} submission(s) deleted successfully`);
      }
      
      if (results.failed.length > 0) {
        showWarning(`${results.failed.length} submission(s) could not be deleted`);
      }
    } catch (error) {
      console.error('Error bulk deleting submissions:', error);
      showError('Failed to delete submissions');
    }
  }, [selectedSubmissions, showSuccess, showError, showWarning]);

  // Export submissions
  const exportSubmissions = useCallback(async (format = 'csv', selectedOnly = false) => {
    if (!formId) return;

    setIsExporting(true);
    try {
      const submissionIds = selectedOnly 
        ? Array.from(selectedSubmissions)
        : null;

      const exportOptions = {
        format,
        submissionIds,
        ...filters,
        searchTerm: debouncedSearchTerm
      };

      if (format === 'csv') {
        await exportService.exportSubmissionsAsCSV(formId, exportOptions);
      } else if (format === 'json') {
        await exportService.exportSubmissionsAsJSON(formId, exportOptions);
      }

      showSuccess(`Submissions exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting submissions:', error);
      showError('Failed to export submissions');
    } finally {
      setIsExporting(false);
    }
  }, [formId, selectedSubmissions, filters, debouncedSearchTerm, showSuccess, showError]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  }, []);

  // Update sort configuration
  const updateSort = useCallback((field, direction = null) => {
    setSortConfig(prev => ({
      field,
      direction: direction || (prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc')
    }));
    setCurrentPage(1);
  }, []);

  // Toggle submission selection
  const toggleSubmissionSelection = useCallback((submissionId) => {
    setSelectedSubmissions(prev => {
      const updated = new Set(prev);
      if (updated.has(submissionId)) {
        updated.delete(submissionId);
      } else {
        updated.add(submissionId);
      }
      return updated;
    });
  }, []);

  // Select all submissions
  const selectAllSubmissions = useCallback(() => {
    setSelectedSubmissions(new Set(submissions.map(sub => sub.id)));
  }, [submissions]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedSubmissions(new Set());
  }, []);

  // Load more submissions (pagination)
  const loadMore = useCallback(() => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    loadSubmissions(nextPage, true);
  }, [currentPage, loadSubmissions]);

  // Get submission statistics
  const getSubmissionStats = useMemo(() => {
    if (submissions.length === 0) {
      return {
        total: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        byStatus: {},
        byDay: {},
        averagePerDay: 0
      };
    }

    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const weekStart = new Date(now.setDate(now.getDate() - 7));
    const monthStart = new Date(now.setMonth(now.getMonth() - 1));

    const stats = {
      total: submissions.length,
      today: submissions.filter(sub => new Date(sub.submittedAt) >= todayStart).length,
      thisWeek: submissions.filter(sub => new Date(sub.submittedAt) >= weekStart).length,
      thisMonth: submissions.filter(sub => new Date(sub.submittedAt) >= monthStart).length,
      byStatus: groupBy(submissions, 'status'),
      byDay: groupBy(submissions, sub => new Date(sub.submittedAt).toDateString()),
      averagePerDay: 0
    };

    // Calculate average per day
    if (submissions.length > 0) {
      const dates = submissions.map(sub => new Date(sub.submittedAt));
      const oldestDate = new Date(Math.min(...dates));
      const daysDiff = Math.ceil((now - oldestDate) / (1000 * 60 * 60 * 24));
      stats.averagePerDay = daysDiff > 0 ? (submissions.length / daysDiff).toFixed(1) : 0;
    }

    return stats;
  }, [submissions]);

  // Get filtered and sorted submissions
  const processedSubmissions = useMemo(() => {
    let filtered = [...submissions];

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(sub => sub.status === filters.status);
    }

    // Apply search filter
    if (debouncedSearchTerm) {
      const searchTerm = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(sub => 
        Object.values(sub.data).some(value => 
          String(value).toLowerCase().includes(searchTerm)
        ) || sub.id.toLowerCase().includes(searchTerm)
      );
    }

    // Apply sorting
    return sortBy(filtered, sortConfig.field, sortConfig.direction);
  }, [submissions, filters, debouncedSearchTerm, sortConfig]);

  // Check if has more pages
  const hasMore = currentPage * pageSize < totalCount;

  return {
    // Data
    submissions: processedSubmissions,
    totalCount,
    stats: getSubmissionStats,
    
    // State
    isLoading,
    isExporting,
    currentPage,
    hasMore,
    
    // Selection
    selectedSubmissions: Array.from(selectedSubmissions),
    allSelected: selectedSubmissions.size === submissions.length && submissions.length > 0,
    
    // Configuration
    sortConfig,
    filters,
    
    // Actions
    loadSubmissions,
    loadMore,
    deleteSubmission,
    bulkDeleteSubmissions,
    exportSubmissions,
    
    // Selection management
    toggleSubmissionSelection,
    selectAllSubmissions,
    clearSelection,
    
    // Configuration updates
    updateFilters,
    updateSort,
    
    // Utilities
    refresh: () => loadSubmissions(1, false)
  };
};

/**
 * Hook for individual submission details
 * @param {string} submissionId - Submission ID
 * @returns {Object} - Submission details state and functions
 */
export const useSubmissionDetails = (submissionId) => {
  const [submission, setSubmission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showError } = useNotification();

  // Load submission details
  const loadSubmission = useCallback(async () => {
    if (!submissionId) return;

    setIsLoading(true);
    try {
      const data = await submissionService.getSubmission(submissionId);
      setSubmission(data);
    } catch (error) {
      console.error('Error loading submission:', error);
      showError('Failed to load submission details');
    } finally {
      setIsLoading(false);
    }
  }, [submissionId, showError]);

  useEffect(() => {
    loadSubmission();
  }, [loadSubmission]);

  return {
    submission,
    isLoading,
    refresh: loadSubmission
  };
};

export default useFormSubmissions;