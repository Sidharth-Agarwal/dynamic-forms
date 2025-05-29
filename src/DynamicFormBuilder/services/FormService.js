// services/FormService.js
import firebaseService from './FirebaseService';
import { generateFormId, sanitizeFieldName } from '../utils';
import { FORM_STATUS } from '../utils/constants';

class FormService {
  constructor() {
    this.COLLECTION_NAME = 'forms';
  }

  /**
   * Create a new form
   */
  async createForm(formData, userId = null) {
    try {
      const user = firebaseService.getCurrentUser();
      const authorId = userId || user?.uid || 'anonymous';

      const newForm = {
        id: generateFormId(),
        title: formData.title || 'Untitled Form',
        description: formData.description || '',
        fields: formData.fields || [],
        settings: {
          allowAnonymous: true,
          requireLogin: false,
          allowMultipleSubmissions: true,
          isPublic: true,
          acceptResponses: true,
          ...formData.settings
        },
        status: FORM_STATUS.DRAFT,
        createdBy: authorId,
        submissionCount: 0
      };

      const docId = await firebaseService.createDocument(this.COLLECTION_NAME, newForm);
      return { ...newForm, id: docId };
    } catch (error) {
      console.error('Error creating form:', error);
      throw error;
    }
  }

  /**
   * Get form by ID
   */
  async getForm(formId) {
    try {
      return await firebaseService.getDocument(this.COLLECTION_NAME, formId);
    } catch (error) {
      console.error('Error getting form:', error);
      throw error;
    }
  }

  /**
   * Update form
   */
  async updateForm(formId, updates) {
    try {
      await firebaseService.updateDocument(this.COLLECTION_NAME, formId, updates);
      return await this.getForm(formId);
    } catch (error) {
      console.error('Error updating form:', error);
      throw error;
    }
  }

  /**
   * Delete form
   */
  async deleteForm(formId) {
    try {
      await firebaseService.deleteDocument(this.COLLECTION_NAME, formId);
      return true;
    } catch (error) {
      console.error('Error deleting form:', error);
      throw error;
    }
  }

  /**
   * Get user forms
   */
  async getUserForms(userId) {
    try {
      return await firebaseService.queryDocuments(this.COLLECTION_NAME, {
        where: [{ field: 'createdBy', operator: '==', value: userId }],
        orderBy: { field: 'updatedAt', direction: 'desc' }
      });
    } catch (error) {
      console.error('Error getting user forms:', error);
      throw error;
    }
  }

  /**
   * Publish form
   */
  async publishForm(formId) {
    try {
      return await this.updateForm(formId, {
        status: FORM_STATUS.PUBLISHED,
        publishedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error publishing form:', error);
      throw error;
    }
  }
}

const formService = new FormService();
export default formService;