// services/ExportService.js
import submissionService from './SubmissionService';
import formService from './FormService';
import { exportUtils, formatSubmissionForExport } from '../utils';

class ExportService {
  constructor() {
    this.EXPORT_FORMATS = {
      CSV: 'csv',
      JSON: 'json',
      EXCEL: 'excel',
      PDF: 'pdf'
    };
  }

  /**
   * Export form submissions as CSV
   */
  async exportSubmissionsAsCSV(formId, options = {}) {
    try {
      const form = await formService.getForm(formId);
      if (!form) {
        throw new Error('Form not found');
      }

      const submissions = await submissionService.getFormSubmissions(formId);
      
      if (submissions.length === 0) {
        throw new Error('No submissions found to export');
      }

      // Format submissions for export
      const formattedData = submissions.map(submission => 
        formatSubmissionForExport(submission, form)
      );

      // Generate filename
      const filename = `${form.title.replace(/[^a-zA-Z0-9]/g, '_')}_submissions_${new Date().toISOString().split('T')[0]}.csv`;

      // Download CSV
      exportUtils.downloadCSV(formattedData, filename);

      return {
        format: 'csv',
        filename,
        recordCount: submissions.length,
        exportedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error exporting submissions as CSV:', error);
      throw error;
    }
  }

  /**
   * Export form submissions as JSON
   */
  async exportSubmissionsAsJSON(formId, options = {}) {
    try {
      const form = await formService.getForm(formId);
      if (!form) {
        throw new Error('Form not found');
      }

      const submissions = await submissionService.getFormSubmissions(formId);

      const exportData = {
        form: {
          id: form.id,
          title: form.title,
          description: form.description,
          fields: form.fields
        },
        submissions: submissions,
        exportedAt: new Date().toISOString(),
        totalRecords: submissions.length
      };

      const filename = `${form.title.replace(/[^a-zA-Z0-9]/g, '_')}_export_${new Date().toISOString().split('T')[0]}.json`;

      exportUtils.downloadJSON(exportData, filename);

      return {
        format: 'json',
        filename,
        recordCount: submissions.length,
        exportedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error exporting submissions as JSON:', error);
      throw error;
    }
  }

  /**
   * Export form configuration
   */
  async exportFormConfig(formId) {
    try {
      const form = await formService.getForm(formId);
      if (!form) {
        throw new Error('Form not found');
      }

      const configData = {
        title: form.title,
        description: form.description,
        fields: form.fields,
        settings: form.settings,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };

      const filename = `${form.title.replace(/[^a-zA-Z0-9]/g, '_')}_config.json`;

      exportUtils.downloadJSON(configData, filename);

      return {
        format: 'json',
        filename,
        exportedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error exporting form config:', error);
      throw error;
    }
  }

  /**
   * Export form analytics data
   */
  async exportFormAnalytics(formId) {
    try {
      const form = await formService.getForm(formId);
      if (!form) {
        throw new Error('Form not found');
      }

      // Get basic analytics data
      const submissions = await submissionService.getFormSubmissions(formId);
      
      const analyticsData = {
        form: {
          id: form.id,
          title: form.title,
          createdAt: form.createdAt,
          status: form.status
        },
        analytics: {
          totalSubmissions: submissions.length,
          submissionsByDay: this.groupSubmissionsByDay(submissions),
          fieldCompletionRates: this.calculateFieldCompletionRates(submissions, form.fields),
          lastSubmission: submissions.length > 0 ? submissions[0].submittedAt : null
        },
        exportedAt: new Date().toISOString()
      };

      const filename = `${form.title.replace(/[^a-zA-Z0-9]/g, '_')}_analytics_${new Date().toISOString().split('T')[0]}.json`;

      exportUtils.downloadJSON(analyticsData, filename);

      return {
        format: 'json',
        filename,
        exportedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error exporting form analytics:', error);
      throw error;
    }
  }

  /**
   * Export all user forms
   */
  async exportAllUserForms(userId) {
    try {
      const forms = await formService.getUserForms(userId);
      
      if (forms.length === 0) {
        throw new Error('No forms found to export');
      }

      const exportData = {
        user: userId,
        forms: forms.map(form => ({
          id: form.id,
          title: form.title,
          description: form.description,
          fields: form.fields,
          settings: form.settings,
          status: form.status,
          createdAt: form.createdAt,
          submissionCount: form.submissionCount
        })),
        exportedAt: new Date().toISOString(),
        totalForms: forms.length
      };

      const filename = `all_forms_${userId}_${new Date().toISOString().split('T')[0]}.json`;

      exportUtils.downloadJSON(exportData, filename);

      return {
        format: 'json',
        filename,
        formCount: forms.length,
        exportedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error exporting all user forms:', error);
      throw error;
    }
  }

  /**
   * Get export history for user
   */
  async getExportHistory(userId) {
    try {
      // In a real implementation, this would fetch from database
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error getting export history:', error);
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Group submissions by day
   */
  groupSubmissionsByDay(submissions) {
    const grouped = {};
    
    submissions.forEach(submission => {
      const date = new Date(submission.submittedAt).toISOString().split('T')[0];
      grouped[date] = (grouped[date] || 0) + 1;
    });

    return grouped;
  }

  /**
   * Calculate field completion rates
   */
  calculateFieldCompletionRates(submissions, fields) {
    if (submissions.length === 0) return {};

    const completionRates = {};
    
    fields.forEach(field => {
      const completedCount = submissions.filter(submission => {
        const value = submission.data[field.name];
        return value !== undefined && value !== null && value !== '';
      }).length;
      
      completionRates[field.name] = {
        label: field.label,
        completionRate: ((completedCount / submissions.length) * 100).toFixed(2),
        completedCount,
        totalSubmissions: submissions.length
      };
    });

    return completionRates;
  }

  /**
   * Validate export request
   */
  validateExportRequest(formId, format) {
    if (!formId) {
      throw new Error('Form ID is required');
    }

    if (!Object.values(this.EXPORT_FORMATS).includes(format)) {
      throw new Error(`Unsupported export format: ${format}`);
    }

    return true;
  }
}

const exportService = new ExportService();
export default exportService;