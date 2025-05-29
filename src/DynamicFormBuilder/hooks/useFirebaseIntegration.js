// hooks/useFirebaseIntegration.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNotification } from '../context/NotificationContext';
import { firebaseService } from '../services';

/**
 * Hook for Firebase integration and real-time updates
 * @param {Object} config - Firebase configuration
 * @returns {Object} - Firebase state and functions
 */
export const useFirebaseIntegration = (config = null) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [error, setError] = useState(null);

  const { showError, showSuccess } = useNotification();
  const unsubscribeAuth = useRef(null);

  // Initialize Firebase
  const initialize = useCallback(async (firebaseConfig = config) => {
    if (!firebaseConfig) {
      showError('Firebase configuration is required');
      return false;
    }

    setIsInitializing(true);
    setError(null);

    try {
      await firebaseService.initialize(firebaseConfig);
      
      // Set up auth state listener
      unsubscribeAuth.current = firebaseService.onAuthStateChange((user) => {
        setCurrentUser(user);
        setConnectionStatus(user ? 'authenticated' : 'anonymous');
      });

      setIsConnected(true);
      setConnectionStatus('connected');
      showSuccess('Connected to Firebase');
      
      return true;
    } catch (error) {
      console.error('Firebase initialization error:', error);
      setError(error.message);
      setConnectionStatus('error');
      showError('Failed to connect to Firebase');
      return false;
    } finally {
      setIsInitializing(false);
    }
  }, [config, showError, showSuccess]);

  // Sign in anonymously
  const signInAnonymously = useCallback(async () => {
    try {
      const user = await firebaseService.signInAnonymously();
      setCurrentUser(user);
      setConnectionStatus('authenticated');
      return user;
    } catch (error) {
      console.error('Anonymous sign-in error:', error);
      setError(error.message);
      showError('Failed to sign in');
      return null;
    }
  }, [showError]);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await firebaseService.signOut();
      setCurrentUser(null);
      setConnectionStatus('anonymous');
    } catch (error) {
      console.error('Sign out error:', error);
      setError(error.message);
      showError('Failed to sign out');
    }
  }, [showError]);

  // Get service status
  const getServiceStatus = useCallback(() => {
    return firebaseService.getServiceStatus();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeAuth.current) {
        unsubscribeAuth.current();
      }
    };
  }, []);

  return {
    isConnected,
    isInitializing,
    currentUser,
    connectionStatus,
    error,
    initialize,
    signInAnonymously,
    signOut,
    getServiceStatus
  };
};

/**
 * Hook for real-time collection updates
 * @param {string} collectionName - Firestore collection name
 * @param {Object} queryOptions - Query options
 * @returns {Object} - Real-time data state and functions
 */
export const useFirestoreCollection = (collectionName, queryOptions = {}) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);

  const { showError } = useNotification();
  const unsubscribeRef = useRef(null);

  // Start listening to collection
  const startListening = useCallback(() => {
    if (!collectionName || isListening) return;

    setIsLoading(true);
    setError(null);

    try {
      const unsubscribe = firebaseService.listenToCollection(
        collectionName,
        (documents, listenerError) => {
          if (listenerError) {
            console.error('Firestore listener error:', listenerError);
            setError(listenerError.message);
            showError('Real-time updates failed');
            return;
          }

          setData(documents || []);
          setIsLoading(false);
        },
        queryOptions
      );

      unsubscribeRef.current = unsubscribe;
      setIsListening(true);
    } catch (error) {
      console.error('Error setting up listener:', error);
      setError(error.message);
      setIsLoading(false);
      showError('Failed to set up real-time updates');
    }
  }, [collectionName, queryOptions, isListening, showError]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
      setIsListening(false);
    }
  }, []);

  // Fetch data once (without real-time updates)
  const fetchOnce = useCallback(async () => {
    if (!collectionName) return;

    setIsLoading(true);
    setError(null);

    try {
      const documents = await firebaseService.queryDocuments(collectionName, queryOptions);
      setData(documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError(error.message);
      showError('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, [collectionName, queryOptions, showError]);

  // Auto-start listening on mount
  useEffect(() => {
    if (collectionName) {
      startListening();
    }

    return () => {
      stopListening();
    };
  }, [collectionName, startListening, stopListening]);

  return {
    data,
    isLoading,
    error,
    isListening,
    startListening,
    stopListening,
    fetchOnce,
    refresh: fetchOnce
  };
};

/**
 * Hook for Firestore document operations
 * @param {string} collectionName - Collection name
 * @returns {Object} - Document operation functions
 */
export const useFirestoreDocument = (collectionName) => {
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useNotification();

  // Create document
  const createDocument = useCallback(async (data) => {
    setIsLoading(true);
    try {
      const docId = await firebaseService.createDocument(collectionName, data);
      showSuccess('Document created successfully');
      return docId;
    } catch (error) {
      console.error('Error creating document:', error);
      showError('Failed to create document');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [collectionName, showSuccess, showError]);

  // Update document
  const updateDocument = useCallback(async (docId, data) => {
    setIsLoading(true);
    try {
      await firebaseService.updateDocument(collectionName, docId, data);
      showSuccess('Document updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating document:', error);
      showError('Failed to update document');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [collectionName, showSuccess, showError]);

  // Delete document
  const deleteDocument = useCallback(async (docId) => {
    setIsLoading(true);
    try {
      await firebaseService.deleteDocument(collectionName, docId);
      showSuccess('Document deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      showError('Failed to delete document');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [collectionName, showSuccess, showError]);

  // Get document
  const getDocument = useCallback(async (docId) => {
    setIsLoading(true);
    try {
      const doc = await firebaseService.getDocument(collectionName, docId);
      return doc;
    } catch (error) {
      console.error('Error getting document:', error);
      showError('Failed to get document');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [collectionName, showError]);

  return {
    isLoading,
    createDocument,
    updateDocument,
    deleteDocument,
    getDocument
  };
};

/**
 * Hook for Firebase Storage operations
 * @returns {Object} - Storage operation functions
 */
export const useFirebaseStorage = () => {
  const [uploads, setUploads] = useState(new Map());
  const { showSuccess, showError } = useNotification();

  // Upload file with progress tracking
  const uploadFile = useCallback(async (file, path, options = {}) => {
    const uploadId = `${path}-${Date.now()}`;
    
    setUploads(prev => new Map(prev).set(uploadId, {
      file,
      path,
      progress: 0,
      status: 'uploading',
      error: null,
      url: null
    }));

    try {
      const url = await firebaseService.uploadFile(file, path, (progress) => {
        setUploads(prev => {
          const updated = new Map(prev);
          const upload = updated.get(uploadId);
          if (upload) {
            updated.set(uploadId, { ...upload, progress });
          }
          return updated;
        });
        
        options.onProgress?.(progress);
      });

      setUploads(prev => {
        const updated = new Map(prev);
        updated.set(uploadId, {
          ...updated.get(uploadId),
          status: 'completed',
          url,
          progress: 100
        });
        return updated;
      });

      showSuccess('File uploaded successfully');
      return { uploadId, url };
    } catch (error) {
      console.error('Upload error:', error);
      
      setUploads(prev => {
        const updated = new Map(prev);
        updated.set(uploadId, {
          ...updated.get(uploadId),
          status: 'failed',
          error: error.message
        });
        return updated;
      });

      showError('Failed to upload file');
      throw error;
    }
  }, [showSuccess, showError]);

  // Delete file
  const deleteFile = useCallback(async (path) => {
    try {
      await firebaseService.deleteFile(path);
      showSuccess('File deleted successfully');
      return true;
    } catch (error) {
      console.error('Delete error:', error);
      showError('Failed to delete file');
      throw error;
    }
  }, [showSuccess, showError]);

  // Get download URL
  const getDownloadURL = useCallback(async (path) => {
    try {
      const url = await firebaseService.getFileDownloadURL(path);
      return url;
    } catch (error) {
      console.error('Error getting download URL:', error);
      showError('Failed to get file URL');
      throw error;
    }
  }, [showError]);

  // Remove upload from tracking
  const removeUpload = useCallback((uploadId) => {
    setUploads(prev => {
      const updated = new Map(prev);
      updated.delete(uploadId);
      return updated;
    });
  }, []);

  // Get upload status
  const getUpload = useCallback((uploadId) => {
    return uploads.get(uploadId);
  }, [uploads]);

  // Get all uploads
  const getAllUploads = useCallback(() => {
    return Array.from(uploads.values());
  }, [uploads]);

  return {
    uploads: getAllUploads(),
    uploadFile,
    deleteFile,
    getDownloadURL,
    removeUpload,
    getUpload
  };
};

/**
 * Hook for Firebase batch operations
 * @returns {Object} - Batch operation functions
 */
export const useFirebaseBatch = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { showSuccess, showError } = useNotification();

  // Execute batch operations
  const executeBatch = useCallback(async (operations) => {
    if (!operations || operations.length === 0) return;

    setIsProcessing(true);
    try {
      await firebaseService.batchOperations(operations);
      showSuccess(`${operations.length} operations completed successfully`);
      return true;
    } catch (error) {
      console.error('Batch operation error:', error);
      showError('Batch operation failed');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [showSuccess, showError]);

  // Execute transaction
  const executeTransaction = useCallback(async (transactionFunction) => {
    setIsProcessing(true);
    try {
      const result = await firebaseService.runTransaction(transactionFunction);
      showSuccess('Transaction completed successfully');
      return result;
    } catch (error) {
      console.error('Transaction error:', error);
      showError('Transaction failed');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [showSuccess, showError]);

  return {
    isProcessing,
    executeBatch,
    executeTransaction
  };
};

/**
 * Hook for monitoring Firebase connection status
 * @returns {Object} - Connection monitoring state
 */
export const useFirebaseConnection = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionQuality, setConnectionQuality] = useState('good');
  const [lastSync, setLastSync] = useState(null);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setConnectionQuality('good');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionQuality('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update last sync time
  const updateLastSync = useCallback(() => {
    setLastSync(new Date());
  }, []);

  // Test connection
  const testConnection = useCallback(async () => {
    try {
      const startTime = Date.now();
      
      // Simple test operation
      await firebaseService.getServiceStatus();
      
      const latency = Date.now() - startTime;
      
      if (latency < 100) {
        setConnectionQuality('excellent');
      } else if (latency < 300) {
        setConnectionQuality('good');
      } else if (latency < 1000) {
        setConnectionQuality('fair');
      } else {
        setConnectionQuality('poor');
      }
      
      updateLastSync();
      return true;
    } catch (error) {
      setConnectionQuality('offline');
      return false;
    }
  }, [updateLastSync]);

  return {
    isOnline,
    connectionQuality,
    lastSync,
    testConnection,
    updateLastSync
  };
};

export default useFirebaseIntegration;