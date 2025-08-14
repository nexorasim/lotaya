import React, { useState, useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { useToast } from '../../contexts/ToastContext';
import { X, Mail, Lock } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { login } = useContext(UserContext);
  const { showToast } = useToast();


  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'signup' && password !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }
    // In a real app, you'd have different logic for signin/signup
    login(email);
    onClose();
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setActiveTab('signin');
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div className="bg-gray-900 border border-gray-700/80 rounded-2xl shadow-2xl w-full max-w-md relative p-8 text-white" onClick={(e) => e.stopPropagation()}>
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <X size={24} />
        </button>
        
        <div className="flex border-b border-gray-700 mb-6">
          <button onClick={() => setActiveTab('signin')} className={`py-3 px-6 text-lg font-semibold transition-colors ${activeTab === 'signin' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-500'}`}>
            Sign In
          </button>
          <button onClick={() => setActiveTab('signup')} className={`py-3 px-6 text-lg font-semibold transition-colors ${activeTab === 'signup' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-500'}`}>
            Sign Up
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
             <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20}/>
             <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-gray-800 border border-gray-600 rounded-md pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"/>
          </div>
          <div className="relative">
             <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20}/>
             <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-gray-800 border border-gray-600 rounded-md pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"/>
          </div>
           {activeTab === 'signup' && (
            <div className="relative">
               <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20}/>
               <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full bg-gray-800 border border-gray-600 rounded-md pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"/>
            </div>
           )}
          
          <div className="flex justify-end text-sm">
            {activeTab === 'signin' && (
                <button type="button" className="text-blue-400 hover:underline">Forgot Password?</button>
            )}
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors !mt-6">
            {activeTab === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="flex items-center my-6">
          <hr className="w-full border-gray-600"/>
          <span className="px-4 text-gray-500">OR</span>
          <hr className="w-full border-gray-600"/>
        </div>

        <div className="space-y-3">
            <button className="w-full flex items-center justify-center gap-3 border border-gray-600 hover:bg-gray-800 py-3 rounded-lg transition-colors">
                <img src="https://www.vectorlogo.zone/logos/google/google-icon.svg" alt="Google" className="w-6 h-6" />
                Continue with Google
            </button>
             <button className="w-full flex items-center justify-center gap-3 border border-gray-600 hover:bg-gray-800 py-3 rounded-lg transition-colors">
                <img src="https://www.vectorlogo.zone/logos/facebook/facebook-icon.svg" alt="Facebook" className="w-6 h-6" />
                Continue with Facebook
            </button>
        </div>
        
        <p className="text-center text-sm text-gray-400 mt-6">
            {activeTab === 'signin' ? "Don't have an account?" : "Already have an account?"}{' '}
            <button onClick={() => setActiveTab(activeTab === 'signin' ? 'signup' : 'signin')} className="font-semibold text-blue-400 hover:underline">
                {activeTab === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;