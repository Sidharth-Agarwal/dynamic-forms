// services/SubmissionService.js
import firebaseService from './FirebaseService';
import formService from './FormService';
import { generateId, validateForm, formatFormData } from '../utils';
import { SUBMISSION_STATUS } from '../utils/constants';

class SubmissionService {
  constructor() {
    this.COLLECTION_NAME = 'submissions';
  }

  /**
   * Submit form response
   */
  async submitForm(formId, formData) {
    try {
      // Get form configuration
      const form = await formService.getForm(formId);
      if (!form) {
        throw new Error('Form not found');
      }

      // Validate form data
      const validationResult = validateForm(formData, form);
      if (!validationResult.isValid) {
        throw new Error('Form validation failed');
      }

      // Format submission data
      const formattedData = formatFormData(formData, form);
      const user = firebaseService.getCurrentUser();

      const submission = {
        id: generateId(),
        formId,
        data: formattedData,
        status: SUBMISSION_STATUS.COMPLETED,
        submittedBy: user?.uid || 'anonymous',
        submittedAt: new Date().toISOString()
      };

      // Save submission
      const docId = await firebaseService.createDocument(this.COLLECTION_NAME, submission);
      
      // Update form submission count
      await formService.updateForm(formId, {
        submissionCount: (form.submissionCount || 0) + 1
      });

      return { ...submission, id: docId };
    } catch (error) {
      console.error('Error submitting form:', error);
      throw error;
    }
  }

  /**
   * Get form submissions
   */
  async getFormSubmissions(formId) {
    try {
      return await firebaseService.queryDocuments(this.COLLECTION_NAME, {
        where: [{ field: 'formId', operator: '==', value: formId }],
        orderBy: { field: 'submittedAt', direction: 'desc' }
      });
    } catch (error) {
      console.error('Error getting form submissions:', error);
      throw error;
    }
  }

  /**
   * Get submission by ID
   */
  async getSubmission(submissionId) {
    try {
      return await firebaseService.getDocument(this.COLLECTION_NAME, submissionId);
    } catch (error) {
      console.error('Error getting submission:', error);
      throw error;
    }
  }

  /**
   * Delete submission
   */
  async deleteSubmission(submissionId) {
    try {
      await firebaseService.deleteDocument(this.COLLECTION_NAME, submissionId);
      return true;
    } catch (error) {
      console.error('Error deleting submission:', error);
      throw error;
    }
  }
}

const submissionService = new SubmissionService();
export default submissionService;