import { 
  EXPORT_FORMATS, 
  CSV_CONFIG, 
  EXCEL_CONFIG, 
  PDF_CONFIG,
  EXPORT_TEMPLATES,
  generateFileName,
  validateExportOptions,
  getRecommendedFormat,
  estimateExportSize 
} from '../config/exportConfig.js';
import { formatForExport, formatDate, formatFileSize } from '../utils/formatting.js';
import { downloadFile } from '../utils/helpers.js';

/**
 * Export Service
 * Handles data export in multiple formats with customization options
 */
class ExportService {
  constructor() {
    this.activeExports = new Map();
    this.exportHistory = [];
  }

  // ============================================================================
  // MAIN EXPORT METHODS
  // ============================================================================

  /**
   * Export form submissions
   * @param {array} submissions - Form submissions data
   * @param {array} fields - Form fields configuration
   * @param {object} options - Export options
   * @returns {Promise<object>} Export result
   */
  async exportSubmissions(submissions, fields, options = {}) {
    const {
      format = 'csv',
      template = 'standard',
      filename = null,
      includeMetadata = true,
      dateRange = null,
      fieldFilter = null,
      customMapping = null,
      onProgress = null
    } = options;

    // Validate export options
    const validation = validateExportOptions({ format, template, ...options });
    if (!validation.isValid) {
      throw new Error(`Invalid export options: ${validation.errors.join(', ')}`);
    }

    const exportId = this._generateExportId();
    
    try {
      // Start tracking export
      this._trackExportStart(exportId, format, submissions.length);
      
      // Filter submissions by date range
      let filteredSubmissions = dateRange 
        ? this._filterByDateRange(submissions, dateRange)
        : submissions;

      // Filter fields if specified
      let exportFields = fieldFilter 
        ? fields.filter(field => fieldFilter.includes(field.id))
        : fields;

      // Apply template settings
      const templateConfig = EXPORT_TEMPLATES[template] || EXPORT_TEMPLATES.standard;
      const exportOptions = {
        includeMetadata: templateConfig.includeMetadata && includeMetadata,
        includeEmptyFields: templateConfig.includeEmptyFields,
        includeTimestamps: templateConfig.includeTimestamps,
        customMapping
      };

      // Progress callback
      onProgress?.({ stage: 'processing', progress: 10 });

      // Prepare data based on format
      let exportData;
      let mimeType;
      let fileExtension;

      switch (format) {
        case 'csv':
          exportData = await this._exportToCSV(filteredSubmissions, exportFields, exportOptions, onProgress);
          mimeType = EXPORT_FORMATS.csv.mimeType;
          fileExtension = EXPORT_FORMATS.csv.extension;
          break;

        case 'excel':
          exportData = await this._exportToExcel(filteredSubmissions, exportFields, exportOptions, onProgress);
          mimeType = EXPORT_FORMATS.excel.mimeType;
          fileExtension = EXPORT_FORMATS.excel.extension;
          break;

        case 'json':
          exportData = await this._exportToJSON(filteredSubmissions, exportFields, exportOptions, onProgress);
          mimeType = EXPORT_FORMATS.json.mimeType;
          fileExtension = EXPORT_FORMATS.json.extension;
          break;

        case 'pdf':
          exportData = await this._exportToPDF(filteredSubmissions, exportFields, exportOptions, onProgress);
          mimeType = EXPORT_FORMATS.pdf.mimeType;
          fileExtension = EXPORT_FORMATS.pdf.extension;
          break;

        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

      onProgress?.({ stage: 'finalizing', progress: 90 });

      // Generate filename
      const finalFilename = filename || generateFileName(
        'form-submissions', 
        format, 
        new Date()
      );

      // Create and download file
      await this._downloadExportFile(exportData, finalFilename, mimeType);

      onProgress?.({ stage: 'complete', progress: 100 });

      // Track export completion
      const result = this._trackExportComplete(exportId, {
        format,
        recordCount: filteredSubmissions.length,
        fieldCount: exportFields.length,
        fileSize: this._calculateFileSize(exportData),
        filename: finalFilename
      });

      return result;

    } catch (error) {
      this._trackExportError(exportId, error);
      throw error;
    }
  }

  /**
   * Export form configuration
   * @param {object} form - Form configuration
   * @param {object} options - Export options
   * @returns {Promise<object>} Export result
   */
  async exportFormConfig(form, options = {}) {
    const {
      format = 'json',
      includeSubmissions = false,
      includeAnalytics = false
    } = options;

    const exportData = {
      form: {
        id: form.id,
        title: form.title,
        description: form.description,
        fields: form.fields,
        settings: form.settings,
        createdAt: form.createdAt,
        updatedAt: form.updatedAt
      },
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    if (includeSubmissions && form.submissions) {
      exportData.submissions = form.submissions;
    }

    if (includeAnalytics && form.analytics) {
      exportData.analytics = form.analytics;
    }

    const filename = generateFileName(`form-config-${form.title}`, format);
    const content = JSON.stringify(exportData, null, 2);
    
    await this._downloadExportFile(content, filename, EXPORT_FORMATS.json.mimeType);

    return {
      success: true,
      filename,
      recordCount: 1,
      exportedAt: new Date().toISOString()
    };
  }

  // ============================================================================
  // FORMAT-SPECIFIC EXPORT METHODS
  // ============================================================================

  /**
   * Export to CSV format
   * @param {array} submissions - Submissions data
   * @param {array} fields - Fields configuration
   * @param {object} options - Export options
   * @param {function} onProgress - Progress callback
   * @returns {Promise<string>} CSV content
   */
  async _exportToCSV(submissions, fields, options, onProgress) {
    const { includeMetadata, customMapping } = options;
    const csvConfig = CSV_CONFIG.defaultSettings;

    // Prepare data for CSV
    const formattedData = formatForExport(submissions, fields, {
      includeMetadata,
      flattenArrays: true,
      dateFormat: csvConfig.dateFormat,
      emptyValue: '',
      customMapping
    });

    onProgress?.({ stage: 'formatting', progress: 50 });

    // Convert to CSV
    const headers = Object.keys(formattedData[0] || {});
    const csvRows = [headers];

    formattedData.forEach((row, index) => {
      const csvRow = headers.map(header => {
        let value = row[header] || '';
        
        // Escape quotes and wrap in quotes if necessary
        if (typeof value === 'string') {
          if (value.includes(csvConfig.delimiter) || 
              value.includes(csvConfig.quoteChar) || 
              value.includes('\n')) {
            value = csvConfig.quoteChar + 
                   value.replace(new RegExp(csvConfig.quoteChar, 'g'), csvConfig.escapeChar + csvConfig.quoteChar) + 
                   csvConfig.quoteChar;
          }
        }
        
        return value;
      });
      
      csvRows.push(csvRow);
      
      // Progress update
      if (index % 100 === 0) {
        const progress = 50 + (index / formattedData.length) * 30;
        onProgress?.({ stage: 'converting', progress });
      }
    });

    return csvRows.map(row => row.join(csvConfig.delimiter)).join(csvConfig.lineEnding);
  }

  /**
   * Export to Excel format
   * @param {array} submissions - Submissions data
   * @param {array} fields - Fields configuration
   * @param {object} options - Export options
   * @param {function} onProgress - Progress callback
   * @returns {Promise<Blob>} Excel blob
   */
  async _exportToExcel(submissions, fields, options, onProgress) {
    // Note: In a real implementation, you'd use a library like SheetJS (xlsx)
    // For now, we'll create a simple Excel-compatible format
    
    const { includeMetadata, customMapping } = options;
    
    const formattedData = formatForExport(submissions, fields, {
      includeMetadata,
      flattenArrays: false,
      dateFormat: 'YYYY-MM-DD HH:mm:ss',
      customMapping
    });

    onProgress?.({ stage: 'formatting', progress: 50 });

    // Simple Excel format (actually CSV with .xlsx extension)
    // In production, use proper Excel library
    const headers = Object.keys(formattedData[0] || {});
    const excelData = [headers];

    formattedData.forEach((row, index) => {
      const excelRow = headers.map(header => row[header] || '');
      excelData.push(excelRow);
      
      if (index % 100 === 0) {
        const progress = 50 + (index / formattedData.length) * 30;
        onProgress?.({ stage: 'converting', progress });
      }
    });

    // Convert to Excel format (simplified)
    const csvContent = excelData.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    return new Blob([csvContent], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
  }

  /**
   * Export to JSON format
   * @param {array} submissions - Submissions data
   * @param {array} fields - Fields configuration
   * @param {object} options - Export options
   * @param {function} onProgress - Progress callback
   * @returns {Promise<string>} JSON content
   */
  async _exportToJSON(submissions, fields, options, onProgress) {
    const { includeMetadata, customMapping } = options;

    onProgress?.({ stage: 'structuring', progress: 30 });

    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        totalRecords: submissions.length,
        fields: fields.map(field => ({
          id: field.id,
          label: field.label,
          type: field.type
        }))
      },
      submissions: submissions.map((submission, index) => {
        if (index % 100 === 0) {
          const progress = 30 + (index / submissions.length) * 50;
          onProgress?.({ stage: 'processing', progress });
        }

        const processedSubmission = {
          id: submission.id,
          submittedAt: submission.submittedAt || submission.metadata?.submittedAt,
          data: {}
        };

        // Process form data
        fields.forEach(field => {
          const value = submission.data?.[field.id];
          if (customMapping && customMapping[field.id]) {
            processedSubmission.data[customMapping[field.id]] = value;
          } else {
            processedSubmission.data[field.id] = value;
          }
        });

        // Include metadata if requested
        if (includeMetadata && submission.metadata) {
          processedSubmission.metadata = submission.metadata;
        }

        return processedSubmission;
      })
    };

    onProgress?.({ stage: 'serializing', progress: 80 });

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Export to PDF format
   * @param {array} submissions - Submissions data
   * @param {array} fields - Fields configuration
   * @param {object} options - Export options
   * @param {function} onProgress - Progress callback
   * @returns {Promise<Blob>} PDF blob
   */
  async _exportToPDF(submissions, fields, options, onProgress) {
    // Note: In a real implementation, you'd use a library like jsPDF or PDFKit
    // For now, we'll create a simple HTML-to-PDF approach
    
    const { includeMetadata } = options;

    onProgress?.({ stage: 'generating', progress: 30 });

    // Create HTML content for PDF
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Form Submissions Export</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; border-bottom: 2px solid #ddd; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .metadata { font-size: 12px; color: #666; margin-bottom: 20px; }
          .page-break { page-break-before: always; }
        </style>
      </head>
      <body>
        <h1>Form Submissions Export</h1>
        <div class="metadata">
          <p>Exported on: ${formatDate(new Date(), 'MMM DD, YYYY at HH:mm')}</p>
          <p>Total submissions: ${submissions.length}</p>
          <p>Fields: ${fields.length}</p>
        </div>
        <table>
          <thead>
            <tr>
    `;

    // Add headers
    if (includeMetadata) {
      htmlContent += '<th>Submission ID</th><th>Submitted At</th>';
    }
    
    fields.forEach(field => {
      htmlContent += `<th>${field.label}</th>`;
    });
    
    htmlContent += '</tr></thead><tbody>';

    // Add data rows
    submissions.forEach((submission, index) => {
      htmlContent += '<tr>';
      
      if (includeMetadata) {
        htmlContent += `<td>${submission.id || ''}</td>`;
        htmlContent += `<td>${formatDate(submission.submittedAt || submission.metadata?.submittedAt, 'MM/DD/YYYY HH:mm')}</td>`;
      }
      
      fields.forEach(field => {
        const value = submission.data?.[field.id] || '';
        htmlContent += `<td>${this._escapeHtml(String(value))}</td>`;
      });
      
      htmlContent += '</tr>';
      
      // Add page break every 25 rows
      if ((index + 1) % 25 === 0 && index < submissions.length - 1) {
        htmlContent += '</tbody></table><div class="page-break"></div><table><tbody>';
      }
      
      if (index % 50 === 0) {
        const progress = 30 + (index / submissions.length) * 50;
        onProgress?.({ stage: 'generating', progress });
      }
    });

    htmlContent += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    onProgress?.({ stage: 'converting', progress: 80 });

    // Convert HTML to PDF (simplified approach)
    // In production, use proper PDF library
    return new Blob([htmlContent], { type: 'application/pdf' });
  }

  // ============================================================================
  // EXPORT TRACKING AND ANALYTICS
  // ============================================================================

  /**
   * Get export history
   * @param {object} filters - Filter options
   * @returns {array} Export history
   */
  getExportHistory(filters = {}) {
    let history = [...this.exportHistory];

    if (filters.format) {
      history = history.filter(export_ => export_.format === filters.format);
    }

    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      history = history.filter(export_ => {
        const exportDate = new Date(export_.exportedAt);
        return exportDate >= start && exportDate <= end;
      });
    }

    return history.sort((a, b) => new Date(b.exportedAt) - new Date(a.exportedAt));
  }

  /**
   * Get export statistics
   * @returns {object} Export statistics
   */
  getExportStats() {
    const stats = {
      totalExports: this.exportHistory.length,
      formatBreakdown: {},
      averageFileSize: 0,
      averageRecordCount: 0,
      recentExports: this.exportHistory.slice(-10)
    };

    // Calculate format breakdown
    this.exportHistory.forEach(export_ => {
      stats.formatBreakdown[export_.format] = (stats.formatBreakdown[export_.format] || 0) + 1;
    });

    // Calculate averages
    if (this.exportHistory.length > 0) {
      const totalFileSize = this.exportHistory.reduce((sum, export_) => sum + (export_.fileSize || 0), 0);
      const totalRecords = this.exportHistory.reduce((sum, export_) => sum + export_.recordCount, 0);
      
      stats.averageFileSize = totalFileSize / this.exportHistory.length;
      stats.averageRecordCount = totalRecords / this.exportHistory.length;
    }

    return stats;
  }

  /**
   * Clear export history
   * @param {object} options - Clear options
   */
  clearExportHistory(options = {}) {
    const { olderThan = null } = options;

    if (olderThan) {
      const cutoffDate = new Date(olderThan);
      this.exportHistory = this.exportHistory.filter(export_ => 
        new Date(export_.exportedAt) >= cutoffDate
      );
    } else {
      this.exportHistory = [];
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get recommended export format
   * @param {number} recordCount - Number of records
   * @param {object} options - Additional options
   * @returns {string} Recommended format
   */
  getRecommendedFormat(recordCount, options = {}) {
    const { hasFiles = false, needsFormatting = false } = options;
    return getRecommendedFormat(recordCount, hasFiles, needsFormatting);
  }

  /**
   * Estimate export file size
   * @param {number} recordCount - Number of records
   * @param {number} fieldCount - Number of fields
   * @param {string} format - Export format
   * @returns {object} Size estimation
   */
  estimateFileSize(recordCount, fieldCount, format) {
    return estimateExportSize(recordCount, fieldCount, format);
  }

  /**
   * Validate export request
   * @param {object} options - Export options
   * @returns {object} Validation result
   */
  validateExportRequest(options) {
    return validateExportOptions(options);
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Generate unique export ID
   * @returns {string} Export ID
   */
  _generateExportId() {
    return `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track export start
   * @param {string} exportId - Export ID
   * @param {string} format - Export format
   * @param {number} recordCount - Number of records
   */
  _trackExportStart(exportId, format, recordCount) {
    this.activeExports.set(exportId, {
      id: exportId,
      format,
      recordCount,
      startedAt: new Date().toISOString(),
      status: 'in_progress'
    });
  }

  /**
   * Track export completion
   * @param {string} exportId - Export ID
   * @param {object} result - Export result
   * @returns {object} Export summary
   */
  _trackExportComplete(exportId, result) {
    const exportInfo = this.activeExports.get(exportId);
    
    if (exportInfo) {
      const completedExport = {
        ...exportInfo,
        ...result,
        completedAt: new Date().toISOString(),
        status: 'completed',
        duration: Date.now() - new Date(exportInfo.startedAt).getTime()
      };

      this.exportHistory.push(completedExport);
      this.activeExports.delete(exportId);

      // Keep only last 100 exports in history
      if (this.exportHistory.length > 100) {
        this.exportHistory = this.exportHistory.slice(-100);
      }

      return {
        success: true,
        exportId,
        ...result,
        exportedAt: completedExport.completedAt,
        duration: completedExport.duration
      };
    }

    return { success: false, error: 'Export tracking not found' };
  }

  /**
   * Track export error
   * @param {string} exportId - Export ID
   * @param {Error} error - Error object
   */
  _trackExportError(exportId, error) {
    const exportInfo = this.activeExports.get(exportId);
    
    if (exportInfo) {
      const failedExport = {
        ...exportInfo,
        error: error.message,
        failedAt: new Date().toISOString(),
        status: 'failed'
      };

      this.exportHistory.push(failedExport);
      this.activeExports.delete(exportId);
    }
  }

  /**
   * Filter submissions by date range
   * @param {array} submissions - Submissions array
   * @param {object} dateRange - Date range
   * @returns {array} Filtered submissions
   */
  _filterByDateRange(submissions, dateRange) {
    const { start, end } = dateRange;
    
    return submissions.filter(submission => {
      const submissionDate = new Date(submission.submittedAt || submission.metadata?.submittedAt);
      return submissionDate >= start && submissionDate <= end;
    });
  }

  /**
   * Download export file
   * @param {string|Blob} content - File content
   * @param {string} filename - File name
   * @param {string} mimeType - MIME type
   */
  async _downloadExportFile(content, filename, mimeType) {
    if (content instanceof Blob) {
      downloadFile(content, filename, mimeType);
    } else {
      downloadFile(content, filename, mimeType);
    }
  }

  /**
   * Calculate file size
   * @param {string|Blob} content - File content
   * @returns {number} File size in bytes
   */
  _calculateFileSize(content) {
    if (content instanceof Blob) {
      return content.size;
    }
    
    if (typeof content === 'string') {
      return new Blob([content]).size;
    }
    
    return 0;
  }

  /**
   * Escape HTML characters
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Export singleton instance
export const exportService = new ExportService();
export default exportService;