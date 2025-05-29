// services/FirebaseService.js
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL
} from 'firebase/storage';
import { getAuth, signInAnonymously } from 'firebase/auth';

class FirebaseService {
  constructor() {
    this.app = null;
    this.db = null;
    this.storage = null;
    this.auth = null;
    this.isInitialized = false;
  }

  /**
   * Initialize Firebase
   */
  async initialize(config) {
    try {
      this.app = initializeApp(config);
      this.db = getFirestore(this.app);
      this.storage = getStorage(this.app);
      this.auth = getAuth(this.app);
      this.isInitialized = true;
      
      // Auto sign-in anonymously for public forms
      await signInAnonymously(this.auth);
    } catch (error) {
      console.error('Firebase initialization error:', error);
      throw error;
    }
  }

  /**
   * Create document
   */
  async createDocument(collectionName, data) {
    const docRef = await addDoc(collection(this.db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }

  /**
   * Get document by ID
   */
  async getDocument(collectionName, docId) {
    const docRef = doc(this.db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  }

  /**
   * Update document
   */
  async updateDocument(collectionName, docId, data) {
    const docRef = doc(this.db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  }

  /**
   * Delete document
   */
  async deleteDocument(collectionName, docId) {
    const docRef = doc(this.db, collectionName, docId);
    await deleteDoc(docRef);
  }

  /**
   * Query documents
   */
  async queryDocuments(collectionName, options = {}) {
    let q = collection(this.db, collectionName);
    
    if (options.where) {
      options.where.forEach(condition => {
        q = query(q, where(condition.field, condition.operator, condition.value));
      });
    }
    
    if (options.orderBy) {
      q = query(q, orderBy(options.orderBy.field, options.orderBy.direction || 'desc'));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  /**
   * Upload file
   */
  async uploadFile(file, path) {
    const storageRef = ref(this.storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.auth?.currentUser || null;
  }
}

const firebaseService = new FirebaseService();
export default firebaseService;