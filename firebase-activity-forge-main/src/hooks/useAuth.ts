import { useState, useEffect, useCallback } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  User
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role?: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

// Safe accessors for Vite env vars
const getEnv = (key: string): string | undefined => {
  const value = (import.meta as unknown as { env?: Record<string, string> }).env?.[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
};

const ADMIN_CODE = getEnv('VITE_ADMIN_CODE');
const ADMIN_EMAILS = (getEnv('VITE_ADMIN_EMAILS') || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// Debug logging
console.log('Environment variables loaded:', {
  hasAdminCode: !!ADMIN_CODE,
  adminCodeLength: ADMIN_CODE?.length,
  adminEmails: ADMIN_EMAILS,
  envKeys: Object.keys((import.meta as unknown as { env?: Record<string, string> }).env || {})
});

const isAllowedAdminEmail = (email?: string | null) => !!email && ADMIN_EMAILS.includes(email.toLowerCase());

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const createUserProfile = async (createdUser: User, displayName?: string) => {
    try {
      const profile: UserProfile = {
        uid: createdUser.uid,
        email: createdUser.email || '',
        displayName: displayName || createdUser.displayName || '',
        photoURL: createdUser.photoURL || '',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'users', createdUser.uid), profile, { merge: true });
      return profile;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  };

  const ensureAdminIfAllowed = useCallback(async (currentUser: User): Promise<UserProfile | null> => {
    const profile = await getUserProfile(currentUser.uid);

    if (profile?.role === 'admin') return profile;

    if (isAllowedAdminEmail(currentUser.email)) {
      await setDoc(
        doc(db, 'users', currentUser.uid),
        { role: 'admin', updatedAt: new Date(), email: currentUser.email ?? '' },
        { merge: true }
      );
      const updated = await getUserProfile(currentUser.uid);
      return updated;
    }

    return profile;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const profile = await ensureAdminIfAllowed(currentUser);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [ensureAdminIfAllowed]);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await ensureAdminIfAllowed(result.user);
      return { success: true, user: result.user } as const;
    } catch (error) {
      return { success: false, error } as const;
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }

      await createUserProfile(result.user, displayName);
      await ensureAdminIfAllowed(result.user);
      
      return { success: true, user: result.user } as const;
    } catch (error) {
      return { success: false, error } as const;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      const existingProfile = await getUserProfile(result.user.uid);
      if (!existingProfile) {
        await createUserProfile(result.user);
      }
      await ensureAdminIfAllowed(result.user);
      
      return { success: true, user: result.user } as const;
    } catch (error) {
      return { success: false, error } as const;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true } as const;
    } catch (error) {
      return { success: false, error } as const;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true } as const;
    } catch (error) {
      return { success: false, error } as const;
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { success: false, error: 'No user logged in' } as const;

    try {
      const updatedProfile = {
        ...userProfile,
        ...updates,
        updatedAt: new Date()
      } as UserProfile;

      await setDoc(doc(db, 'users', user.uid), updatedProfile, { merge: true });
      setUserProfile(updatedProfile);
      
      return { success: true, profile: updatedProfile } as const;
    } catch (error) {
      return { success: false, error } as const;
    }
  };

  const elevateToAdmin = async (code: string) => {
    console.log('elevateToAdmin called with:', { code, hasUser: !!user, adminCode: ADMIN_CODE });
    
    if (!user) {
      console.error('No user logged in for admin elevation');
      return { success: false, error: 'Not signed in' } as const;
    }
    
    if (!ADMIN_CODE) {
      console.error('Admin code not configured in environment');
      return { success: false, error: 'Admin code not configured' } as const;
    }
    
    if (code !== ADMIN_CODE) {
      console.error('Invalid admin code provided:', { provided: code, expected: ADMIN_CODE });
      return { success: false, error: 'Invalid admin code' } as const;
    }

    try {
      console.log('Attempting to update user profile with admin role');
      await setDoc(doc(db, 'users', user.uid), { 
        role: 'admin', 
        updatedAt: new Date(), 
        email: user.email ?? '' 
      }, { merge: true });
      
      console.log('User profile updated successfully, fetching updated profile');
      const updated = await getUserProfile(user.uid);
      console.log('Updated profile:', updated);
      
      setUserProfile(updated);
      return { success: true, profile: updated ?? null } as const;
    } catch (error) {
      console.error('Error during admin elevation:', error);
      return { success: false, error } as const;
    }
  };

  return {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    forgotPassword,
    logout,
    updateUserProfile,
    elevateToAdmin
  };
};
