// services/EmailService.js
class EmailService {
  constructor() {
    this.TEMPLATES = {
      FORM_SUBMISSION: 'form_submission',
      FORM_CONFIRMATION: 'form_confirmation',
      FORM_PUBLISHED: 'form_published',
      WEEKLY_DIGEST: 'weekly_digest'
    };
  }

  /**
   * Send form submission notification
   */
  async sendSubmissionNotification(form, submission, recipientEmail) {
    try {
      const emailData = {
        to: recipientEmail,
        template: this.TEMPLATES.FORM_SUBMISSION,
        data: {
          formTitle: form.title,
          submissionId: submission.id,
          submittedAt: submission.submittedAt,
          submissionData: this.formatSubmissionForEmail(submission.data, form.fields)
        }
      };

      return await this.sendEmail(emailData);
    } catch (error) {
      console.error('Error sending submission notification:', error);
      throw error;
    }
  }

  /**
   * Send confirmation email to form submitter
   */
  async sendConfirmationEmail(form, submission, submitterEmail) {
    try {
      if (!form.settings?.sendConfirmationEmail || !submitterEmail) {
        return null;
      }

      const emailData = {
        to: submitterEmail,
        template: this.TEMPLATES.FORM_CONFIRMATION,
        data: {
          formTitle: form.title,
          submissionId: submission.id,
          submittedAt: submission.submittedAt,
          confirmationMessage: form.settings.confirmationMessage || 'Thank you for your submission!'
        }
      };

      return await this.sendEmail(emailData);
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      throw error;
    }
  }

  /**
   * Send form published notification
   */
  async sendFormPublishedNotification(form, userEmail) {
    try {
      const emailData = {
        to: userEmail,
        template: this.TEMPLATES.FORM_PUBLISHED,
        data: {
          formTitle: form.title,
          formId: form.id,
          publishedAt: form.publishedAt,
          formUrl: `${window.location.origin}/forms/${form.id}`
        }
      };

      return await this.sendEmail(emailData);
    } catch (error) {
      console.error('Error sending form published notification:', error);
      throw error;
    }
  }

  /**
   * Send weekly digest
   */
  async sendWeeklyDigest(userEmail, digestData) {
    try {
      const emailData = {
        to: userEmail,
        template: this.TEMPLATES.WEEKLY_DIGEST,
        data: {
          totalForms: digestData.totalForms,
          newSubmissions: digestData.newSubmissions,
          popularForms: digestData.popularForms,
          weekStart: digestData.weekStart,
          weekEnd: digestData.weekEnd
        }
      };

      return await this.sendEmail(emailData);
    } catch (error) {
      console.error('Error sending weekly digest:', error);
      throw error;
    }
  }

  /**
   * Generic send email method
   */
  async sendEmail(emailData) {
    try {
      // In a real implementation, this would integrate with:
      // - SendGrid, Mailgun, AWS SES, etc.
      // - Firebase Functions for serverless email sending
      
      console.log('Sending email:', emailData);
      
      // Mock successful response
      return {
        id: `email_${Date.now()}`,
        status: 'sent',
        sentAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Format submission data for email display
   */
  formatSubmissionForEmail(submissionData, formFields) {
    const formatted = [];
    
    formFields.forEach(field => {
      const value = submissionData[field.name];
      if (value !== undefined && value !== null && value !== '') {
        formatted.push({
          label: field.label,
          value: this.formatFieldValue(value, field.type),
          type: field.type
        });
      }
    });

    return formatted;
  }

  /**
   * Format field value based on type
   */
  formatFieldValue(value, fieldType) {
    switch (fieldType) {
      case 'checkbox':
        return Array.isArray(value) ? value.join(', ') : value;
      case 'file':
        return Array.isArray(value) 
          ? value.map(f => f.name || f).join(', ')
          : value;
      case 'date':
        return new Date(value).toLocaleDateString();
      default:
        return value;
    }
  }

  /**
   * Validate email address
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get email delivery status
   */
  async getEmailStatus(emailId) {
    try {
      // In real implementation, check with email service provider
      return {
        id: emailId,
        status: 'delivered',
        deliveredAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting email status:', error);
      throw error;
    }
  }
}

const emailService = new EmailService();
export default emailService;