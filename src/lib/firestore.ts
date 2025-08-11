import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// Types
export interface Activity {
  id?: string;
  title: string;
  description: string;
  category: string;
  duration: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  userId?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Collection reference
const activitiesCollection = collection(db, 'activities');

// CRUD Operations
export const firestoreService = {
  // Create a new activity
  async createActivity(activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const docRef = await addDoc(activitiesCollection, {
        ...activity,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error creating activity:', error);
      return { success: false, error };
    }
  },

  // Get all activities
  async getActivities() {
    try {
      const q = query(activitiesCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const activities = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Activity[];
      return { success: true, data: activities };
    } catch (error) {
      console.error('Error getting activities:', error);
      return { success: false, error };
    }
  },

  // Get activity by ID
  async getActivity(id: string) {
    try {
      const docRef = doc(db, 'activities', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { 
          success: true, 
          data: { id: docSnap.id, ...docSnap.data() } as Activity 
        };
      } else {
        return { success: false, error: 'Activity not found' };
      }
    } catch (error) {
      console.error('Error getting activity:', error);
      return { success: false, error };
    }
  },

  // Update activity
  async updateActivity(id: string, updates: Partial<Activity>) {
    try {
      const docRef = doc(db, 'activities', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating activity:', error);
      return { success: false, error };
    }
  },

  // Delete activity
  async deleteActivity(id: string) {
    try {
      const docRef = doc(db, 'activities', id);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting activity:', error);
      return { success: false, error };
    }
  },

  // Get activities by category
  async getActivitiesByCategory(category: string) {
    try {
      const q = query(
        activitiesCollection, 
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const activities = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Activity[];
      return { success: true, data: activities };
    } catch (error) {
      console.error('Error getting activities by category:', error);
      return { success: false, error };
    }
  },

  // Get activities by user
  async getActivitiesByUser(userId: string) {
    try {
      const q = query(
        activitiesCollection, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const activities = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Activity[];
      return { success: true, data: activities };
    } catch (error) {
      console.error('Error getting user activities:', error);
      return { success: false, error };
    }
  }
};
