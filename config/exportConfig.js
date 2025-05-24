/**
 * Export Configuration for Form Builder Module
 * Defines export formats, settings, and templates
 */

// Export Format Definitions
export const EXPORT_FORMATS = {
  csv: {
    id: 'csv',
    name: 'CSV',
    description: 'Comma Separated Values',
    extension: '.csv',
    mimeType: 'text/csv',
    icon: '📊',
    supportsFormatting: false,
    supportsImages: false,
    maxFileSize: '50MB',
    features: ['headers', 'customDelimiter', 'encoding']
  },

  excel: {
    id: 'excel',
    name: 'Excel',
    description: 'Microsoft Excel Spreadsheet',
    extension: '.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    icon: '📈',
    supportsFormatting: true,
    supportsImages: false,
    maxFileSize: '100MB',
    features: ['multipleSheets', 'formatting', 'formulas', 'charts']
  },

  json: {
    id: 'json',
    name: 'JSON',
    description: 'JavaScript Object Notation',
    extension: '.json',
    mimeType: 'application/json',
    icon: '📋',
    supportsFormatting: false,
    supportsImages: false,
    maxFileSize: '25MB',
    features: ['structured', 'nested', 'arrays']
  },

  pdf: {
    id: 'pdf',
    name: 'PDF',
    description: 'Portable Document Format',
    extension: '.pdf',
    mimeType: 'application/pdf',
    icon: '📄',
    supportsFormatting: true,
    supportsImages: true,
    maxFileSize: '200MB',
    features: ['formatting', 'images', 'tables', 'headers']
  },

  xml: {
    id: 'xml',
    name: 'XML',
    description: 'Extensible Markup Language',
    extension: '.xml',
    mimeType: 'application/xml',
    icon: '📰',
    supportsFormatting: false,
    supportsImages: false,
    maxFileSize: '50MB',
    features: ['structured', 'validation', 'schema']
  }
};

// CSV Export Configuration
export const CSV_CONFIG = {
  delimiters: {
    comma: { value: ',', name: 'Comma (,)', default: true },
    semicolon: { value: ';', name: 'Semicolon (;)' },
    tab: { value: '\t', name: 'Tab' },
    pipe: { value: '|', name: 'Pipe (|)' },
    space: { value: ' ', name: 'Space' }
  },

  quoteChars: {
    double: { value: '"', name: 'Double Quote (")', default: true },
    single: { value: "'", name: "Single Quote (')" },
    none: { value: '', name: 'No Quotes' }
  },

  escapeChars: {
    double: { value: '"', name: 'Double Quote (")', default: true },
    backslash: { value: '\\', name: 'Backslash (\\)' }
  },

  lineEndings: {
    crlf: { value: '\r\n', name: 'Windows (CRLF)', default: true },
    lf: { value: '\n', name: 'Unix (LF)' },
    cr: { value: '\r', name: 'Mac (CR)' }
  },

  encodings: {
    utf8: { value: 'utf-8', name: 'UTF-8', default: true },
    utf16: { value: 'utf-16', name: 'UTF-16' },
    ascii: { value: 'ascii', name: 'ASCII' },
    latin1: { value: 'latin1', name: 'Latin-1' }
  },

  defaultSettings: {
    delimiter: ',',
    quoteChar: '"',
    escapeChar: '"',
    lineEnding: '\r\n',
    encoding: 'utf-8',
    includeHeaders: true,
    includeMetadata: false,
    includeEmptyColumns: false,
    flattenArrays: true,
    dateFormat: 'YYYY-MM-DD HH:mm:ss'
  }
};

// Excel Export Configuration
export const EXCEL_CONFIG = {
  sheetSettings: {
    maxRowsPerSheet: 1048576,
    maxColumnsPerSheet: 16384,
    defaultSheetName: 'Form Submissions',
    autoFitColumns: true,
    freezeHeader: true
  },

  formatting: {
    headerStyle: {
      font: { bold: true, size: 12 },
      fill: { fgColor: { rgb: 'E3F2FD' } },
      border: { bottom: { style: 'thin' } },
      alignment: { horizontal: 'center' }
    },
    
    dataStyle: {
      font: { size: 11 },
      alignment: { horizontal: 'left', vertical: 'top', wrapText: true }
    },

    dateStyle: {
      numberFormat: 'yyyy-mm-dd hh:mm:ss'
    },

    numberStyle: {
      numberFormat: '#,##0.00'
    }
  },

  charts: {
    enabled: true,
    types: ['column', 'bar', 'pie', 'line'],
    position: { x: 10, y: 10, width: 400, height: 300 }
  }
};

// PDF Export Configuration
export const PDF_CONFIG = {
  pageSettings: {
    format: 'A4',
    orientation: 'portrait',
    margins: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20
    },
    units: 'mm'
  },

  styling: {
    fonts: {
      title: { size: 18, style: 'bold' },
      header: { size: 14, style: 'bold' },
      body: { size: 11, style: 'normal' },
      footer: { size: 9, style: 'normal' }
    },

    colors: {
      primary: '#2563eb',
      secondary: '#6b7280',
      text: '#111827',
      border: '#e5e7eb',
      background: '#ffffff'
    },

    spacing: {
      sectionGap: 15,
      rowGap: 8,
      columnGap: 10
    }
  },

  layout: {
    includeHeader: true,
    includeFooter: true,
    includePageNumbers: true,
    includeTimestamp: true,
    includeFormInfo: true,
    maxRowsPerPage: 25
  },

  templates: {
    standard: {
      name: 'Standard Report',
      description: 'Basic tabular layout',
      headerTemplate: 'default',
      bodyTemplate: 'table',
      footerTemplate: 'default'
    },
    
    detailed: {
      name: 'Detailed Report',
      description: 'Individual submission pages',
      headerTemplate: 'detailed',
      bodyTemplate: 'cards',
      footerTemplate: 'detailed'
    },

    summary: {
      name: 'Summary Report',
      description: 'Statistical overview',
      headerTemplate: 'summary',
      bodyTemplate: 'stats',
      footerTemplate: 'summary'
    }
  }
};

// Export Field Mappings
export const FIELD_EXPORT_CONFIG = {
  text: {
    csvFormat: 'string',
    excelFormat: 'text',
    pdfFormat: 'text',
    jsonFormat: 'string'
  },

  email: {
    csvFormat: 'string',
    excelFormat: 'text',
    pdfFormat: 'text',
    jsonFormat: 'string',
    validation: 'email'
  },

  number: {
    csvFormat: 'number',
    excelFormat: 'number',
    pdfFormat: 'number',
    jsonFormat: 'number'
  },

  date: {
    csvFormat: 'date',
    excelFormat: 'date',
    pdfFormat: 'date',
    jsonFormat: 'string',
    formatOptions: {
      csv: 'YYYY-MM-DD',
      excel: 'date',
      pdf: 'MMM DD, YYYY',
      json: 'ISO'
    }
  },

  checkbox: {
    csvFormat: 'array',
    excelFormat: 'text',
    pdfFormat: 'list',
    jsonFormat: 'array',
    separator: ', '
  },

  radio: {
    csvFormat: 'string',
    excelFormat: 'text',
    pdfFormat: 'text',
    jsonFormat: 'string'
  },

  select: {
    csvFormat: 'string',
    excelFormat: 'text',
    pdfFormat: 'text',
    jsonFormat: 'string'
  },

  textarea: {
    csvFormat: 'string',
    excelFormat: 'text',
    pdfFormat: 'text',
    jsonFormat: 'string',
    wrapText: true
  },

  file: {
    csvFormat: 'string',
    excelFormat: 'hyperlink',
    pdfFormat: 'link',
    jsonFormat: 'object',
    includeMetadata: true
  }
};

// Date and Time Formatting
export const DATE_FORMATS = {
  full: {
    name: 'Full Date & Time',
    format: 'YYYY-MM-DD HH:mm:ss',
    example: '2024-03-15 14:30:45'
  },
  
  dateOnly: {
    name: 'Date Only',
    format: 'YYYY-MM-DD',
    example: '2024-03-15'
  },

  timeOnly: {
    name: 'Time Only',
    format: 'HH:mm:ss',
    example: '14:30:45'
  },

  iso: {
    name: 'ISO Format',
    format: 'ISO',
    example: '2024-03-15T14:30:45.123Z'
  },

  readable: {
    name: 'Readable Format',
    format: 'MMM DD, YYYY at HH:mm',
    example: 'Mar 15, 2024 at 14:30'
  },

  short: {
    name: 'Short Format',
    format: 'MM/DD/YYYY',
    example: '03/15/2024'
  }
};

// Export Templates
export const EXPORT_TEMPLATES = {
  minimal: {
    name: 'Minimal Export',
    description: 'Essential data only',
    includeMetadata: false,
    includeEmptyFields: false,
    includeTimestamps: false,
    includeUserInfo: false,
    fields: ['responses']
  },

  standard: {
    name: 'Standard Export',
    description: 'Complete form data',
    includeMetadata: true,
    includeEmptyFields: true,
    includeTimestamps: true,
    includeUserInfo: true,
    fields: ['responses', 'metadata', 'timestamps', 'user']
  },

  analytics: {
    name: 'Analytics Export',
    description: 'Data optimized for analysis',
    includeMetadata: true,
    includeEmptyFields: false,
    includeTimestamps: true,
    includeUserInfo: false,
    includeCalculatedFields: true,
    fields: ['responses', 'metadata', 'timestamps', 'calculated']
  },

  archive: {
    name: 'Archive Export',
    description: 'Complete historical record',
    includeMetadata: true,
    includeEmptyFields: true,
    includeTimestamps: true,
    includeUserInfo: true,
    includeSystemData: true,
    includeFiles: true,
    fields: ['all']
  }
};

// Export Scheduling Configuration
export const SCHEDULE_CONFIG = {
  frequencies: {
    manual: { name: 'Manual', value: 'manual', cron: null },
    daily: { name: 'Daily', value: 'daily', cron: '0 9 * * *' },
    weekly: { name: 'Weekly', value: 'weekly', cron: '0 9 * * 1' },
    monthly: { name: 'Monthly', value: 'monthly', cron: '0 9 1 * *' },
    quarterly: { name: 'Quarterly', value: 'quarterly', cron: '0 9 1 */3 *' }
  },

  deliveryMethods: {
    download: { name: 'Download', description: 'Direct browser download' },
    email: { name: 'Email', description: 'Send via email attachment' },
    webhook: { name: 'Webhook', description: 'POST to webhook URL' },
    cloud: { name: 'Cloud Storage', description: 'Upload to cloud storage' }
  },

  retentionPolicies: {
    keep7Days: { name: '7 Days', days: 7 },
    keep30Days: { name: '30 Days', days: 30 },
    keep90Days: { name: '90 Days', days: 90 },
    keep1Year: { name: '1 Year', days: 365 },
    keepForever: { name: 'Forever', days: null }
  }
};

// File Size and Performance Limits
export const EXPORT_LIMITS = {
  maxRecords: {
    csv: 1000000,
    excel: 500000,
    json: 100000,
    pdf: 10000,
    xml: 500000
  },

  maxFileSize: {
    csv: 100 * 1024 * 1024,    // 100MB
    excel: 200 * 1024 * 1024,  // 200MB
    json: 50 * 1024 * 1024,    // 50MB
    pdf: 500 * 1024 * 1024,    // 500MB
    xml: 100 * 1024 * 1024     // 100MB
  },

  performance: {
    batchSize: 1000,
    timeout: 300000, // 5 minutes
    retryAttempts: 3,
    retryDelay: 1000 // 1 second
  },

  warnings: {
    largeDatasetThreshold: 10000,
    performanceWarningThreshold: 50000,
    memoryWarningThreshold: 100000
  }
};

// Column Mapping and Transformation Rules
export const COLUMN_MAPPING = {
  defaultColumns: [
    { key: 'submissionId', label: 'Submission ID', type: 'string', required: true },
    { key: 'submittedAt', label: 'Submitted At', type: 'date', required: true },
    { key: 'userEmail', label: 'User Email', type: 'email', required: false },
    { key: 'ipAddress', label: 'IP Address', type: 'string', required: false }
  ],

  transformations: {
    lowercase: { name: 'Lowercase', function: (value) => String(value).toLowerCase() },
    uppercase: { name: 'Uppercase', function: (value) => String(value).toUpperCase() },
    trim: { name: 'Trim Whitespace', function: (value) => String(value).trim() },
    removeHtml: { name: 'Remove HTML', function: (value) => String(value).replace(/<[^>]*>/g, '') },
    formatPhone: { name: 'Format Phone', function: (value) => value.replace(/\D/g, '') },
    formatCurrency: { name: 'Format Currency', function: (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value) }
  },

  customHeaders: {
    enabled: true,
    mapping: {},
    caseSensitive: false,
    removeSpecialChars: true,
    maxLength: 50
  }
};

// Export Quality and Validation
export const EXPORT_VALIDATION = {
  dataQuality: {
    checkEmptyValues: true,
    checkDataTypes: true,
    checkDuplicates: false,
    validateEmails: true,
    validatePhones: false,
    validateDates: true
  },

  reports: {
    includeQualityReport: false,
    includeSummaryStats: true,
    includeFieldAnalysis: false,
    includeErrorLog: true
  },

  cleanup: {
    removeEmptyRows: false,
    removeEmptyColumns: false,
    trimWhitespace: true,
    normalizeText: false,
    deduplicateRecords: false
  }
};

// Utility Functions
export const getExportFormat = (formatId) => {
  return EXPORT_FORMATS[formatId] || null;
};

export const getSupportedFormats = () => {
  return Object.values(EXPORT_FORMATS);
};

export const getFormatByMimeType = (mimeType) => {
  return Object.values(EXPORT_FORMATS).find(format => format.mimeType === mimeType);
};

export const generateFileName = (formTitle, format, timestamp = new Date()) => {
  const cleanTitle = formTitle.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const dateStr = timestamp.toISOString().split('T')[0];
  const timeStr = timestamp.toTimeString().split(' ')[0].replace(/:/g, '-');
  return `${cleanTitle}_${dateStr}_${timeStr}${EXPORT_FORMATS[format].extension}`;
};

export const validateExportOptions = (options) => {
  const errors = [];
  
  if (!options.format || !EXPORT_FORMATS[options.format]) {
    errors.push('Invalid export format');
  }

  if (options.recordCount && options.recordCount > EXPORT_LIMITS.maxRecords[options.format]) {
    errors.push(`Record count exceeds limit for ${options.format} format`);
  }

  if (options.template && !EXPORT_TEMPLATES[options.template]) {
    errors.push('Invalid export template');
  }

  if (options.dateRange) {
    if (options.dateRange.start && options.dateRange.end) {
      if (new Date(options.dateRange.start) > new Date(options.dateRange.end)) {
        errors.push('Start date must be before end date');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getRecommendedFormat = (recordCount, hasFiles = false, needsFormatting = false) => {
  if (hasFiles && needsFormatting) return 'pdf';
  if (recordCount > 100000) return 'csv';
  if (needsFormatting && recordCount < 50000) return 'excel';
  if (recordCount < 10000) return 'json';
  return 'csv';
};

export const estimateExportSize = (recordCount, fieldCount, format) => {
  const avgFieldSize = 50; // bytes
  const overhead = {
    csv: 1.2,
    excel: 2.5,
    json: 1.8,
    pdf: 3.0,
    xml: 2.2
  };
  
  const baseSize = recordCount * fieldCount * avgFieldSize;
  const estimatedSize = baseSize * (overhead[format] || 1.5);
  
  return {
    bytes: estimatedSize,
    readable: formatFileSize(estimatedSize),
    withinLimits: estimatedSize <= EXPORT_LIMITS.maxFileSize[format]
  };
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getExportProgress = (current, total) => {
  const percentage = Math.round((current / total) * 100);
  const remaining = total - current;
  
  return {
    percentage,
    current,
    total,
    remaining,
    isComplete: current >= total
  };
};

export default {
  EXPORT_FORMATS,
  CSV_CONFIG,
  EXCEL_CONFIG,
  PDF_CONFIG,
  FIELD_EXPORT_CONFIG,
  DATE_FORMATS,
  EXPORT_TEMPLATES,
  SCHEDULE_CONFIG,
  EXPORT_LIMITS,
  COLUMN_MAPPING,
  EXPORT_VALIDATION,
  getExportFormat,
  getSupportedFormats,
  getFormatByMimeType,
  generateFileName,
  validateExportOptions,
  getRecommendedFormat,
  estimateExportSize,
  formatFileSize,
  getExportProgress
};