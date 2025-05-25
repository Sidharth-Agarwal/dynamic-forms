import { formatDate, formatFieldValue } from '../utils/formatting.js';
import { sanitizeForDisplay } from '../utils/formatting.js';

/**
 * Email Service
 * Handles email notifications and templates for form submissions
 * Note: This is a client-side service. In production, email sending 
 * should be handled by your backend/server functions.
 */
class EmailService {
  constructor() {
    this.templates = new Map();
    this.emailHistory = [];
    this.defaultConfig = {
      from: 'noreply@formbuilder.com',
      replyTo: null,
      subject: 'New Form Submission',
      includeSubmissionData: true,
      includeFormInfo: true
    };
    this._initializeDefaultTemplates();
  }

  // ============================================================================
  // TEMPLATE MANAGEMENT
  // ============================================================================

  /**
   * Register email template
   * @param {string} templateId - Template identifier
   * @param {object} template - Template configuration
   */
  registerTemplate(templateId, template) {
    const templateConfig = {
      id: templateId,
      name: template.name || templateId,
      subject: template.subject || 'Form Submission',
      htmlTemplate: template.htmlTemplate || '',
      textTemplate: template.textTemplate || '',
      variables: template.variables || [],
      createdAt: new Date().toISOString(),
      ...template
    };

    this.templates.set(templateId, templateConfig);
  }

  /**
   * Get email template
   * @param {string} templateId - Template identifier
   * @returns {object|null} Template configuration
   */
  getTemplate(templateId) {
    return this.templates.get(templateId) || null;
  }

  /**
   * Get all templates
   * @returns {array} Array of templates
   */
  getAllTemplates() {
    return Array.from(this.templates.values());
  }

  /**
   * Delete template
   * @param {string} templateId - Template identifier
   * @returns {boolean} True if deleted successfully
   */
  deleteTemplate(templateId) {
    return this.templates.delete(templateId);
  }

  // ============================================================================
  // EMAIL GENERATION
  // ============================================================================

  /**
   * Generate submission notification email
   * @param {object} submission - Form submission data
   * @param {object} form - Form configuration
   * @param {object} options - Email options
   * @returns {object} Email content
   */
  generateSubmissionEmail(submission, form, options = {}) {
    const {
      templateId = 'submission_notification',
      recipients = [],
      includeAttachments = false,
      customSubject = null,
      customMessage = null
    } = options;

    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Email template not found: ${templateId}`);
    }

    // Prepare template variables
    const variables = {
      formTitle: form.title,
      formDescription: form.description,
      submissionId: submission.id,
      submittedAt: formatDate(submission.submittedAt || submission.metadata?.submittedAt, 'MMM DD, YYYY at HH:mm'),
      submissionData: this._formatSubmissionForEmail(submission, form.fields),
      userEmail: submission.metadata?.userEmail || 'Anonymous',
      customMessage: customMessage || '',
      formUrl: this._generateFormUrl(form.id),
      adminUrl: this._generateAdminUrl(form.id)
    };

    // Generate email content
    const subject = customSubject || this._processTemplate(template.subject, variables);
    const htmlBody = this._processTemplate(template.htmlTemplate, variables);
    const textBody = this._processTemplate(template.textTemplate, variables);

    return {
      to: recipients,
      from: this.defaultConfig.from,
      replyTo: submission.metadata?.userEmail || this.defaultConfig.replyTo,
      subject,
      html: htmlBody,
      text: textBody,
      variables,
      templateId,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Generate confirmation email for user
   * @param {object} submission - Form submission data
   * @param {object} form - Form configuration
   * @param {object} options - Email options
   * @returns {object} Email content
   */
  generateConfirmationEmail(submission, form, options = {}) {
    const {
      templateId = 'user_confirmation',
      customMessage = null
    } = options;

    const userEmail = submission.metadata?.userEmail;
    if (!userEmail) {
      throw new Error('User email not found in submission');
    }

    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Email template not found: ${templateId}`);
    }

    const variables = {
      formTitle: form.title,
      submissionId: submission.id,
      submittedAt: formatDate(submission.submittedAt || submission.metadata?.submittedAt, 'MMM DD, YYYY at HH:mm'),
      userName: this._extractUserName(submission),
      customMessage: customMessage || form.settings?.confirmationMessage || 'Thank you for your submission!',
      supportEmail: this.defaultConfig.from
    };

    const subject = this._processTemplate(template.subject, variables);
    const htmlBody = this._processTemplate(template.htmlTemplate, variables);
    const textBody = this._processTemplate(template.textTemplate, variables);

    return {
      to: [userEmail],
      from: this.defaultConfig.from,
      subject,
      html: htmlBody,
      text: textBody,
      variables,
      templateId,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Generate custom email
   * @param {string} templateId - Template identifier
   * @param {object} variables - Template variables
   * @param {object} options - Email options
   * @returns {object} Email content
   */
  generateCustomEmail(templateId, variables = {}, options = {}) {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Email template not found: ${templateId}`);
    }

    const {
      recipients = [],
      from = this.defaultConfig.from,
      replyTo = this.defaultConfig.replyTo
    } = options;

    const subject = this._processTemplate(template.subject, variables);
    const htmlBody = this._processTemplate(template.htmlTemplate, variables);
    const textBody = this._processTemplate(template.textTemplate, variables);

    return {
      to: recipients,
      from,
      replyTo,
      subject,
      html: htmlBody,
      text: textBody,
      variables,
      templateId,
      generatedAt: new Date().toISOString()
    };
  }

  // ============================================================================
  // EMAIL SENDING (CLIENT-SIDE PREPARATION)
  // ============================================================================

  /**
   * Prepare email for sending
   * Note: This prepares the email data. Actual sending should be done server-side.
   * @param {object} emailData - Email data
   * @param {object} options - Send options
   * @returns {Promise<object>} Prepared email data
   */
  async prepareEmail(emailData, options = {}) {
    const {
      trackOpens = false,
      trackClicks = false,
      scheduleTime = null,
      priority = 'normal'
    } = options;

    const emailId = this._generateEmailId();
    
    const preparedEmail = {
      id: emailId,
      ...emailData,
      tracking: {
        opens: trackOpens,
        clicks: trackClicks
      },
      scheduling: scheduleTime ? {
        scheduleTime,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      } : null,
      priority,
      preparedAt: new Date().toISOString(),
      status: 'prepared'
    };

    // Add to email history
    this.emailHistory.push(preparedEmail);

    return preparedEmail;
  }

  /**
   * Validate email data
   * @param {object} emailData - Email data to validate
   * @returns {object} Validation result
   */
  validateEmail(emailData) {
    const errors = [];
    const warnings = [];

    // Check required fields
    if (!emailData.to || !Array.isArray(emailData.to) || emailData.to.length === 0) {
      errors.push('Recipients (to) are required');
    }

    if (!emailData.subject || emailData.subject.trim() === '') {
      errors.push('Subject is required');
    }

    if (!emailData.html && !emailData.text) {
      errors.push('Email content (html or text) is required');
    }

    // Validate email addresses
    if (emailData.to) {
      emailData.to.forEach((email, index) => {
        if (!this._isValidEmail(email)) {
          errors.push(`Invalid recipient email at index ${index}: ${email}`);
        }
      });
    }

    if (emailData.from && !this._isValidEmail(emailData.from)) {
      errors.push(`Invalid from email: ${emailData.from}`);
    }

    if (emailData.replyTo && !this._isValidEmail(emailData.replyTo)) {
      errors.push(`Invalid reply-to email: ${emailData.replyTo}`);
    }

    // Check content length
    if (emailData.subject && emailData.subject.length > 200) {
      warnings.push('Subject line is very long (over 200 characters)');
    }

    if (emailData.html && emailData.html.length > 1000000) {
      warnings.push('HTML content is very large (over 1MB)');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ============================================================================
  // ANALYTICS AND TRACKING
  // ============================================================================

  /**
   * Get email statistics
   * @param {object} filters - Filter options
   * @returns {object} Email statistics
   */
  getEmailStats(filters = {}) {
    let emails = [...this.emailHistory];

    // Apply filters
    if (filters.templateId) {
      emails = emails.filter(email => email.templateId === filters.templateId);
    }

    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      emails = emails.filter(email => {
        const emailDate = new Date(email.preparedAt);
        return emailDate >= start && emailDate <= end;
      });
    }

    const stats = {
      totalEmails: emails.length,
      templateBreakdown: {},
      statusBreakdown: {},
      recipientCount: 0,
      recentEmails: emails.slice(-10)
    };

    // Calculate breakdowns
    emails.forEach(email => {
      // Template breakdown
      if (email.templateId) {
        stats.templateBreakdown[email.templateId] = 
          (stats.templateBreakdown[email.templateId] || 0) + 1;
      }

      // Status breakdown
      stats.statusBreakdown[email.status] = 
        (stats.statusBreakdown[email.status] || 0) + 1;

      // Count recipients
      if (email.to && Array.isArray(email.to)) {
        stats.recipientCount += email.to.length;
      }
    });

    return stats;
  }

  /**
   * Get email history
   * @param {object} filters - Filter options
   * @returns {array} Email history
   */
  getEmailHistory(filters = {}) {
    let history = [...this.emailHistory];

    if (filters.templateId) {
      history = history.filter(email => email.templateId === filters.templateId);
    }

    if (filters.status) {
      history = history.filter(email => email.status === filters.status);
    }

    return history.sort((a, b) => new Date(b.preparedAt) - new Date(a.preparedAt));
  }

  /**
   * Clear email history
   * @param {object} options - Clear options
   */
  clearEmailHistory(options = {}) {
    const { olderThan = null } = options;

    if (olderThan) {
      const cutoffDate = new Date(olderThan);
      this.emailHistory = this.emailHistory.filter(email => 
        new Date(email.preparedAt) >= cutoffDate
      );
    } else {
      this.emailHistory = [];
    }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Initialize default email templates
   */
  _initializeDefaultTemplates() {
    // Submission notification template
    this.registerTemplate('submission_notification', {
      name: 'Submission Notification',
      subject: 'New submission for {{formTitle}}',
      htmlTemplate: `
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
              New Form Submission
            </h2>
            
            <p><strong>Form:</strong> {{formTitle}}</p>
            <p><strong>Submitted:</strong> {{submittedAt}}</p>
            <p><strong>Submission ID:</strong> {{submissionId}}</p>
            
            {{#if customMessage}}
            <div style="background: #f0f9ff; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0;">
              {{customMessage}}
            </div>
            {{/if}}
            
            <h3 style="color: #374151; margin-top: 30px;">Submission Data:</h3>
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
              {{submissionData}}
            </div>
            
            <p style="margin-top: 30px;">
              <a href="{{adminUrl}}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                View in Admin Dashboard
              </a>
            </p>
          </div>
        </body>
        </html>
      `,
      textTemplate: `
        New Form Submission
        
        Form: {{formTitle}}
        Submitted: {{submittedAt}}
        Submission ID: {{submissionId}}
        
        {{#if customMessage}}{{customMessage}}{{/if}}
        
        Submission Data:
        {{submissionData}}
        
        View in admin: {{adminUrl}}
      `,
      variables: ['formTitle', 'submittedAt', 'submissionId', 'submissionData', 'customMessage', 'adminUrl']
    });

    // User confirmation template
    this.registerTemplate('user_confirmation', {
      name: 'User Confirmation',
      subject: 'Thank you for your submission - {{formTitle}}',
      htmlTemplate: `
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #10b981; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
              Thank You!
            </h2>
            
            <p>Hello {{userName}},</p>
            
            <p>We have received your submission for <strong>{{formTitle}}</strong>.</p>
            
            <div style="background: #f0fdf4; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0;">
              {{customMessage}}
            </div>
            
            <p><strong>Submission details:</strong></p>
            <ul style="background: #f9fafb; padding: 20px; border-radius: 8px;">
              <li>Submission ID: {{submissionId}}</li>
              <li>Submitted on: {{submittedAt}}</li>
            </ul>
            
            <p>If you have any questions, please contact us at {{supportEmail}}.</p>
            
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </body>
        </html>
      `,
      textTemplate: `
        Thank You!
        
        Hello {{userName}},
        
        We have received your submission for {{formTitle}}.
        
        {{customMessage}}
        
        Submission details:
        - Submission ID: {{submissionId}}
        - Submitted on: {{submittedAt}}
        
        If you have any questions, please contact us at {{supportEmail}}.
        
        This is an automated message. Please do not reply to this email.
      `,
      variables: ['userName', 'formTitle', 'submissionId', 'submittedAt', 'customMessage', 'supportEmail']
    });
  }

  /**
   * Process template with variables
   * @param {string} template - Template string
   * @param {object} variables - Variables object
   * @returns {string} Processed template
   */
  _processTemplate(template, variables) {
    if (!template) return '';

    let processed = template;

    // Replace simple variables {{variable}}
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, value || '');
    });

    // Handle conditional blocks {{#if variable}}...{{/if}}
    processed = processed.replace(/{{#if\s+(\w+)}}(.*?){{\/if}}/gs, (match, variable, content) => {
      const value = variables[variable];
      return value ? content : '';
    });

    return processed;
  }

  /**
   * Format submission data for email
   * @param {object} submission - Submission data
   * @param {array} fields - Form fields
   * @returns {string} Formatted submission data
   */
  _formatSubmissionForEmail(submission, fields) {
    const formattedRows = fields.map(field => {
      const value = submission.data?.[field.id];
      const formattedValue = formatFieldValue(value, field, {
        emptyText: '(not provided)',
        dateFormat: 'MMM DD, YYYY at HH:mm'
      });

      return `<strong>${field.label}:</strong> ${sanitizeForDisplay(formattedValue)}`;
    });

    return formattedRows.join('<br>');
  }

  /**
   * Extract user name from submission
   * @param {object} submission - Submission data
   * @returns {string} User name
   */
  _extractUserName(submission) {
    // Try to find name fields
    const nameFields = ['name', 'firstName', 'first_name', 'fullName', 'full_name'];
    
    for (const fieldName of nameFields) {
      const value = submission.data?.[fieldName];
      if (value && typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }

    // Fallback to email username
    const email = submission.metadata?.userEmail;
    if (email) {
      return email.split('@')[0];
    }

    return 'User';
  }

  /**
   * Generate form URL
   * @param {string} formId - Form ID
   * @returns {string} Form URL
   */
  _generateFormUrl(formId) {
    return `${window.location.origin}/form/${formId}`;
  }

  /**
   * Generate admin URL
   * @param {string} formId - Form ID
   * @returns {string} Admin URL
   */
  _generateAdminUrl(formId) {
    return `${window.location.origin}/admin/forms/${formId}`;
  }

  /**
   * Generate unique email ID
   * @returns {string} Email ID
   */
  _generateEmailId() {
    return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate email address
   * @param {string} email - Email address
   * @returns {boolean} True if valid
   */
  _isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;