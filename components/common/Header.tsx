import React, { useContext, useState, useRef, useEffect } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { BrainCircuit, CreditCard, LogOut, ChevronDown } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout, setIsAuthModalOpen, setIsCreditsModalOpen } = useContext(UserContext);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  return (
    <header className="py-4 px-4 md:px-8 sticky top-0 z-50 bg-gray-950/70 backdrop-blur-lg border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <a href="#" className="flex items-center gap-3">
          <BrainCircuit className="h-8 w-8 text-blue-400" />
          <h1 className="text-2xl font-bold tracking-tight text-gray-100">Lotaya AI</h1>
        </a>
        <nav className="flex items-center gap-4">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/60 hover:bg-gray-700/80 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.credits} Credits</p>
                </div>
                <ChevronDown size={20} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 z-50">
                  <button onClick={() => { setIsCreditsModalOpen(true); setDropdownOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                    <CreditCard size={16} /> Manage Credits
                  </button>
                  <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-gray-700">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="text-sm text-gray-300 px-4 py-2 rounded-md hover:bg-gray-800/80 transition-colors">
                Login
              </button>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md transition-colors">
                Sign Up
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;