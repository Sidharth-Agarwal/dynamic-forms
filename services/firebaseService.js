import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../firebase/config.js';
import { COLLECTIONS } from '../utils/constants.js';

/**
 * Firebase service for Form Builder operations
 */
class FirebaseService {
  constructor() {
    this.db = db;
    this.storage = storage;
    this.collections = COLLECTIONS;
  }

  // ============================================================================
  // FORM OPERATIONS
  // ============================================================================

  /**
   * Create a new form
   * @param {object} formData - Form configuration
   * @returns {Promise<string>} Form ID
   */
  async createForm(formData) {
    try {
      const form = {
        ...formData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        submissionCount: 0,
        isActive: formData.settings?.isActive ?? true
      };

      const docRef = await addDoc(collection(this.db, this.collections.FORMS), form);
      return docRef.id;
    } catch (error) {
      console.error('Error creating form:', error);
      throw new Error('Failed to create form: ' + error.message);
    }
  }

  /**
   * Get form by ID
   * @param {string} formId - Form ID
   * @returns {Promise<object>} Form data
   */
  async getForm(formId) {
    try {
      const docRef = doc(this.db, this.collections.FORMS, formId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Form not found');
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } catch (error) {
      console.error('Error getting form:', error);
      throw new Error('Failed to get form: ' + error.message);
    }
  }

  /**
   * Update form
   * @param {string} formId - Form ID
   * @param {object} updates - Updates to apply
   * @returns {Promise<void>}
   */
  async updateForm(formId, updates) {
    try {
      const docRef = doc(this.db, this.collections.FORMS, formId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating form:', error);
      throw new Error('Failed to update form: ' + error.message);
    }
  }

  /**
   * Delete form
   * @param {string} formId - Form ID
   * @returns {Promise<void>}
   */
  async deleteForm(formId) {
    try {
      const batch = writeBatch(this.db);
      
      // Delete form document
      const formRef = doc(this.db, this.collections.FORMS, formId);
      batch.delete(formRef);
      
      // Delete all submissions for this form
      const submissionsQuery = query(
        collection(this.db, this.collections.SUBMISSIONS),
        where('formId', '==', formId)
      );
      const submissionsSnapshot = await getDocs(submissionsQuery);
      
      submissionsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error deleting form:', error);
      throw new Error('Failed to delete form: ' + error.message);
    }
  }

  /**
   * Get all forms for a user
   * @param {string} userId - User ID
   * @param {object} options - Query options
   * @returns {Promise<array>} Forms array
   */
  async getForms(userId, options = {}) {
    try {
      const {
        status = 'all',
        orderByField = 'updatedAt',
        orderDirection = 'desc',
        limitCount = 50
      } = options;

      let q = query(
        collection(this.db, this.collections.FORMS),
        where('createdBy', '==', userId),
        orderBy(orderByField, orderDirection),
        limit(limitCount)
      );

      // Add status filter
      if (status !== 'all') {
        q = query(
          collection(this.db, this.collections.FORMS),
          where('createdBy', '==', userId),
          where('isActive', '==', status === 'active'),
          orderBy(orderByField, orderDirection),
          limit(limitCount)
        );
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting forms:', error);
      throw new Error('Failed to get forms: ' + error.message);
    }
  }

  /**
   * Subscribe to forms changes
   * @param {string} userId - User ID
   * @param {function} callback - Callback function
   * @returns {function} Unsubscribe function
   */
  subscribeToForms(userId, callback) {
    try {
      const q = query(
        collection(this.db, this.collections.FORMS),
        where('createdBy', '==', userId),
        orderBy('updatedAt', 'desc')
      );

      return onSnapshot(q, (snapshot) => {
        const forms = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(forms);
      });
    } catch (error) {
      console.error('Error subscribing to forms:', error);
      throw new Error('Failed to subscribe to forms: ' + error.message);
    }
  }

  // ============================================================================
  // SUBMISSION OPERATIONS
  // ============================================================================

  /**
   * Create form submission
   * @param {string} formId - Form ID
   * @param {object} submissionData - Submission data
   * @returns {Promise<string>} Submission ID
   */
  async createSubmission(formId, submissionData) {
    try {
      const submission = {
        formId,
        data: submissionData.data,
        metadata: {
          submittedAt: serverTimestamp(),
          userAgent: navigator.userAgent,
          ipAddress: submissionData.ipAddress || null,
          userEmail: submissionData.userEmail || null,
          ...submissionData.metadata
        }
      };

      const docRef = await addDoc(collection(this.db, this.collections.SUBMISSIONS), submission);
      
      // Update form submission count
      await this.incrementSubmissionCount(formId);
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating submission:', error);
      throw new Error('Failed to create submission: ' + error.message);
    }
  }

  /**
   * Get submissions for a form
   * @param {string} formId - Form ID
   * @param {object} options - Query options
   * @returns {Promise<array>} Submissions array
   */
  async getSubmissions(formId, options = {}) {
    try {
      const {
        orderByField = 'metadata.submittedAt',
        orderDirection = 'desc',
        limitCount = 100,
        startAfter = null
      } = options;

      let q = query(
        collection(this.db, this.collections.SUBMISSIONS),
        where('formId', '==', formId),
        orderBy(orderByField, orderDirection),
        limit(limitCount)
      );

      if (startAfter) {
        q = query(q, startAfter(startAfter));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting submissions:', error);
      throw new Error('Failed to get submissions: ' + error.message);
    }
  }

  /**
   * Delete submission
   * @param {string} submissionId - Submission ID
   * @returns {Promise<void>}
   */
  async deleteSubmission(submissionId) {
    try {
      const docRef = doc(this.db, this.collections.SUBMISSIONS, submissionId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting submission:', error);
      throw new Error('Failed to delete submission: ' + error.message);
    }
  }

  /**
   * Subscribe to submissions changes
   * @param {string} formId - Form ID
   * @param {function} callback - Callback function
   * @returns {function} Unsubscribe function
   */
  subscribeToSubmissions(formId, callback) {
    try {
      const q = query(
        collection(this.db, this.collections.SUBMISSIONS),
        where('formId', '==', formId),
        orderBy('metadata.submittedAt', 'desc')
      );

      return onSnapshot(q, (snapshot) => {
        const submissions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(submissions);
      });
    } catch (error) {
      console.error('Error subscribing to submissions:', error);
      throw new Error('Failed to subscribe to submissions: ' + error.message);
    }
  }

  // ============================================================================
  // FILE OPERATIONS
  // ============================================================================

  /**
   * Upload file
   * @param {File} file - File to upload
   * @param {string} path - Storage path
   * @param {function} onProgress - Progress callback
   * @returns {Promise<object>} Upload result
   */
  async uploadFile(file, path, onProgress = null) {
    try {
      const storageRef = ref(this.storage, path);
      
      // For progress tracking, you'd use uploadBytesResumable
      // For simplicity, using uploadBytes here
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        path: snapshot.ref.fullPath,
        url: downloadURL,
        size: file.size,
        type: file.type,
        name: file.name
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file: ' + error.message);
    }
  }

  /**
   * Delete file
   * @param {string} path - File path in storage
   * @returns {Promise<void>}
   */
  async deleteFile(path) {
    try {
      const storageRef = ref(this.storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file: ' + error.message);
    }
  }

  // ============================================================================
  // ANALYTICS OPERATIONS
  // ============================================================================

  /**
   * Get form analytics
   * @param {string} formId - Form ID
   * @param {object} dateRange - Date range for analytics
   * @returns {Promise<object>} Analytics data
   */
  async getFormAnalytics(formId, dateRange = {}) {
    try {
      const { startDate, endDate } = dateRange;
      
      let q = query(
        collection(this.db, this.collections.SUBMISSIONS),
        where('formId', '==', formId)
      );

      if (startDate && endDate) {
        q = query(q, 
          where('metadata.submittedAt', '>=', startDate),
          where('metadata.submittedAt', '<=', endDate)
        );
      }

      const snapshot = await getDocs(q);
      const submissions = snapshot.docs.map(doc => doc.data());

      // Calculate analytics
      const analytics = {
        totalSubmissions: submissions.length,
        submissionsByDate: this._groupSubmissionsByDate(submissions),
        completionRate: this._calculateCompletionRate(submissions),
        averageCompletionTime: this._calculateAverageTime(submissions),
        fieldAnalysis: this._analyzeFields(submissions)
      };

      return analytics;
    } catch (error) {
      console.error('Error getting analytics:', error);
      throw new Error('Failed to get analytics: ' + error.message);
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Increment form submission count
   * @param {string} formId - Form ID
   */
  async incrementSubmissionCount(formId) {
    try {
      const formRef = doc(this.db, this.collections.FORMS, formId);
      const formDoc = await getDoc(formRef);
      
      if (formDoc.exists()) {
        const currentCount = formDoc.data().submissionCount || 0;
        await updateDoc(formRef, {
          submissionCount: currentCount + 1,
          lastSubmissionAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error incrementing submission count:', error);
    }
  }

  /**
   * Group submissions by date
   * @param {array} submissions - Submissions array
   * @returns {object} Grouped data
   */
  _groupSubmissionsByDate(submissions) {
    const grouped = {};
    
    submissions.forEach(submission => {
      const date = submission.metadata.submittedAt?.toDate?.() || new Date();
      const dateKey = date.toISOString().split('T')[0];
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = 0;
      }
      grouped[dateKey]++;
    });
    
    return grouped;
  }

  /**
   * Calculate completion rate
   * @param {array} submissions - Submissions array
   * @returns {number} Completion rate percentage
   */
  _calculateCompletionRate(submissions) {
    if (submissions.length === 0) return 0;
    
    const completedSubmissions = submissions.filter(sub => 
      sub.metadata.completionPercentage >= 100
    );
    
    return (completedSubmissions.length / submissions.length) * 100;
  }

  /**
   * Calculate average completion time
   * @param {array} submissions - Submissions array
   * @returns {number} Average time in milliseconds
   */
  _calculateAverageTime(submissions) {
    const timings = submissions
      .filter(sub => sub.metadata.completionTime)
      .map(sub => sub.metadata.completionTime);
    
    if (timings.length === 0) return 0;
    
    return timings.reduce((sum, time) => sum + time, 0) / timings.length;
  }

  /**
   * Analyze field completion
   * @param {array} submissions - Submissions array
   * @returns {object} Field analysis
   */
  _analyzeFields(submissions) {
    const fieldStats = {};
    
    submissions.forEach(submission => {
      Object.entries(submission.data || {}).forEach(([fieldId, value]) => {
        if (!fieldStats[fieldId]) {
          fieldStats[fieldId] = {
            totalResponses: 0,
            completedResponses: 0
          };
        }
        
        fieldStats[fieldId].totalResponses++;
        
        if (value !== null && value !== undefined && value !== '') {
          fieldStats[fieldId].completedResponses++;
        }
      });
    });
    
    // Calculate completion percentages
    Object.keys(fieldStats).forEach(fieldId => {
      const stats = fieldStats[fieldId];
      stats.completionRate = (stats.completedResponses / stats.totalResponses) * 100;
    });
    
    return fieldStats;
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  /**
   * Bulk delete forms
   * @param {array} formIds - Array of form IDs
   * @returns {Promise<void>}
   */
  async bulkDeleteForms(formIds) {
    try {
      const batch = writeBatch(this.db);
      
      for (const formId of formIds) {
        const formRef = doc(this.db, this.collections.FORMS, formId);
        batch.delete(formRef);
      }
      
      await batch.commit();
    } catch (error) {
      console.error('Error bulk deleting forms:', error);
      throw new Error('Failed to bulk delete forms: ' + error.message);
    }
  }

  /**
   * Bulk update forms
   * @param {array} formIds - Array of form IDs
   * @param {object} updates - Updates to apply
   * @returns {Promise<void>}
   */
  async bulkUpdateForms(formIds, updates) {
    try {
      const batch = writeBatch(this.db);
      
      for (const formId of formIds) {
        const formRef = doc(this.db, this.collections.FORMS, formId);
        batch.update(formRef, {
          ...updates,
          updatedAt: serverTimestamp()
        });
      }
      
      await batch.commit();
    } catch (error) {
      console.error('Error bulk updating forms:', error);
      throw new Error('Failed to bulk update forms: ' + error.message);
    }
  }
}

// Export singleton instance
export const firebaseService = new FirebaseService();
export default firebaseService;