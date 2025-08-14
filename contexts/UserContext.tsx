import React, { createContext, useState, ReactNode, useCallback, useContext } from 'react';
import { User, Transaction } from '../types';
import { useToast } from './ToastContext';

interface UserContextType {
  user: User | null;
  transactions: Transaction[];
  login: (email: string) => void;
  logout: () => void;
  deductCredits: (amount: number) => void;
  topUpCredits: (amount: number) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isCreditsModalOpen: boolean;
  setIsCreditsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

// Mock initial data
const MOCK_USER: User = {
  name: 'Demo User',
  email: 'demo@lotaya.ai',
  credits: 100,
};

const MOCK_TRANSACTIONS: Transaction[] = [
    { id: 't1', date: '2024-07-21', description: 'Initial Credit Grant', amount: 50},
    { id: 't2', date: '2024-07-22', description: 'Logo Generation', amount: -4},
    { id: 't3', date: '2024-07-23', description: 'Social Media Post', amount: -2},
];

export const UserContext = createContext<UserContextType>({} as UserContextType);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCreditsModalOpen, setIsCreditsModalOpen] = useState(false);
  const { showToast } = useToast();

  const login = (email: string) => {
    // In a real app, this would be an API call
    const newUser = { ...MOCK_USER, email };
    setUser(newUser);
    setTransactions(MOCK_TRANSACTIONS);
    showToast(`Welcome back, ${newUser.name}!`, 'success');
  };

  const logout = () => {
    setUser(null);
    setTransactions([]);
    showToast('You have been logged out.', 'info');
  };

  const deductCredits = (amount: number) => {
    if (!user) return;
    const newCredits = user.credits - amount;
    setUser({ ...user, credits: newCredits });
    
    const newTransaction: Transaction = {
        id: `t${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        description: 'AI Service Usage',
        amount: -amount
    };
    setTransactions(prev => [newTransaction, ...prev]);
    showToast(`${amount} credits used.`, 'info');
  };
  
  const topUpCredits = (amount: number) => {
      if(!user) return;
      setUser(prev => prev ? {...prev, credits: prev.credits + amount} : null);

      const newTransaction: Transaction = {
        id: `t${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        description: `Credit Top-Up`,
        amount: amount
    };
    setTransactions(prev => [newTransaction, ...prev]);
    showToast(`${amount} credits added successfully!`, 'success');
  };

  const value = {
    user,
    transactions,
    login,
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