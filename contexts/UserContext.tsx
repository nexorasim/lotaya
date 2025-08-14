import React, { createContext, useState, ReactNode, useCallback, useContext, useEffect } from 'react';
import { User, Transaction, UserContextType } from '../types';
import { useToast } from './ToastContext';

export const UserContext = createContext<UserContextType>({} as UserContextType);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Manages initial session loading state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCreditsModalOpen, setIsCreditsModalOpen] = useState(false);
  const { showToast } = useToast();

  const apiCall = async <T,>(endpoint: string, method: string, body?: any): Promise<T> => {
    try {
        const response = await fetch(endpoint, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : undefined
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `Request failed with status ${response.status}` }));
            throw new Error(errorData.message);
        }
        return response.status === 204 ? ({} as T) : await response.json();
    } catch(err) {
        const message = err instanceof Error ? err.message : 'Failed to connect to the server.';
        showToast(message, 'error');
        throw err;
    }
  };

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    try {
        const data = await apiCall<Transaction[]>('/api/transactions', 'GET');
        setTransactions(data);
    } catch (error) {
        console.error('Error fetching transactions:', error);
    }
  }, [user]);

  const handleAuthSuccess = useCallback((userData: User) => {
    setUser(userData);
    fetchTransactions();
    showToast(`Welcome back, ${userData.name}!`, 'success');
  }, [fetchTransactions, showToast]);

  const checkSession = useCallback(async () => {
    try {
      const userData = await apiCall<User>('/api/auth/session', 'GET');
      handleAuthSuccess(userData);
    } catch (error) {
      console.log("No active session or server not available.");
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthSuccess]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const signup = async (email: string, password: string) => {
    const userData = await apiCall<User>('/api/auth/signup', 'POST', { email, password });
    handleAuthSuccess(userData);
    setIsAuthModalOpen(false);
  };
  
  const login = async (email: string, password: string) => {
    const userData = await apiCall<User>('/api/auth/login', 'POST', { email, password });
    handleAuthSuccess(userData);
    setIsAuthModalOpen(false);
  };

  const logout = async () => {
    await apiCall('/api/auth/logout', 'POST');
    setUser(null);
    setTransactions([]);
    showToast('You have been logged out.', 'info');
  };

  const deductCredits = async (amount: number, description: string) => {
    if (!user) throw new Error("User not authenticated.");
    const { newCredits, transaction } = await apiCall<{ newCredits: number; transaction: Transaction }>('/api/credits/deduct', 'POST', { amount, description });
    setUser({ ...user, credits: newCredits });
    setTransactions(prev => [transaction, ...prev]);
    showToast(`${amount} credits used for ${description}.`, 'info');
  };
  
  const topUpCredits = async (amount: number) => {
      if(!user) throw new Error("User not authenticated.");
      const { newCredits, transaction } = await apiCall<{ newCredits: number; transaction: Transaction }>('/api/credits/top-up', 'POST', { amount });
      setUser(prev => prev ? {...prev, credits: newCredits} : null);
      setTransactions(prev => [transaction, ...prev]);
      showToast(`${amount} credits added successfully!`, 'success');
  };

  const value = {
    user,
    isLoading,
    transactions,
    login,
    signup,
    logout,
    deductCredits,
    topUpCredits,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isCreditsModalOpen,
    setIsCreditsModalOpen
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
