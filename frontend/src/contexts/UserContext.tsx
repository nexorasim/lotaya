import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User as FirebaseUser, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { apiEndpoints } from '../services/api';
import { useToast } from './ToastContext';
import { User, Transaction } from '../types';

interface UserContextType {
  // Firebase user
  firebaseUser: FirebaseUser | null;
  // Application user data
  user: User | null;
  transactions: Transaction[];
  loading: boolean;
  
  // Auth methods
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  
  // Credit management
  deductCredits: (amount: number, service: string, description: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  
  // UI state
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isCreditsModalOpen: boolean;
  setIsCreditsModalOpen: (open: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCreditsModalOpen, setIsCreditsModalOpen] = useState(false);
  
  const { showToast } = useToast();

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Fetch user profile from backend
          await refreshUserData();
        } catch (error) {
          console.error('Error fetching user data:', error);
          showToast('Failed to load user data', 'error');
        }
      } else {
        setUser(null);
        setTransactions([]);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshUserData = async () => {
    if (!firebaseUser) return;
    
    try {
      const response = await apiEndpoints.getUserProfile();
      setUser(response.data);
      await refreshTransactions();
    } catch (error: any) {
      console.error('Error refreshing user data:', error);
      if (error.response?.status !== 404) {
        showToast('Failed to load user data', 'error');
      }
    }
  };

  const refreshTransactions = async () => {
    if (!firebaseUser) return;
    
    try {
      const response = await apiEndpoints.getUserTransactions(20, 0);
      setTransactions(response.data.transactions);
    } catch (error: any) {
      console.error('Error refreshing transactions:', error);
      if (error.response?.status !== 404) {
        showToast('Failed to load transactions', 'error');
      }
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      showToast('Welcome back!', 'success');
      setIsAuthModalOpen(false);
    } catch (error: any) {
      console.error('Login error:', error);
      showToast(error.message || 'Login failed', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user exists in backend, if not register them
      try {
        await apiEndpoints.getUserProfile();
      } catch (error: any) {
        if (error.response?.status === 404) {
          // User doesn't exist in backend, register them
          await apiEndpoints.register({
            name: result.user.displayName || 'User',
            email: result.user.email!,
            firebase_uid: result.user.uid
          });
        }
      }
      
      showToast('Welcome!', 'success');
      setIsAuthModalOpen(false);
    } catch (error: any) {
      console.error('Google login error:', error);
      showToast(error.message || 'Google login failed', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Register user in backend
      await apiEndpoints.register({
        name,
        email,
        firebase_uid: userCredential.user.uid
      });
      
      showToast('Account created successfully!', 'success');
      setIsAuthModalOpen(false);
    } catch (error: any) {
      console.error('Registration error:', error);
      showToast(error.message || 'Registration failed', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setTransactions([]);
      showToast('Logged out successfully', 'info');
    } catch (error: any) {
      console.error('Logout error:', error);
      showToast(error.message || 'Logout failed', 'error');
    }
  };

  const deductCredits = async (amount: number, service: string, description: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    if (user.credits < amount) {
      throw new Error('Insufficient credits');
    }

    try {
      await apiEndpoints.deductCredits({ amount, service, description });
      
      // Update local user state
      setUser(prev => prev ? { ...prev, credits: prev.credits - amount } : null);
      
      // Add transaction to local state
      const newTransaction: Transaction = {
        id: `t${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        description,
        amount: -amount
      };
      setTransactions(prev => [newTransaction, ...prev]);
      
      showToast(`${amount} credits used`, 'info');
    } catch (error: any) {
      console.error('Credit deduction error:', error);
      showToast(error.response?.data?.detail || 'Failed to deduct credits', 'error');
      throw error;
    }
  };

  const value: UserContextType = {
    firebaseUser,
    user,
    transactions,
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
    deductCredits,
    refreshUserData,
    refreshTransactions,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isCreditsModalOpen,
    setIsCreditsModalOpen,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};