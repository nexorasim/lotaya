import React from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../../contexts/UserContext';
import { Sparkles, User, CreditCard, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Header: React.FC = () => {
  const { 
    user, 
    firebaseUser, 
    logout, 
    setIsAuthModalOpen, 
    setIsCreditsModalOpen 
  } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <motion.header 
      className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800/50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Lotaya AI</h1>
              <p className="text-xs text-gray-400 -mt-1">Design Studio</p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#brand-kit-generator" className="text-gray-300 hover:text-white transition-colors">
              Brand Kit
            </a>
            <a href="#logo-generator" className="text-gray-300 hover:text-white transition-colors">
              Logos
            </a>
            <a href="#social-media" className="text-gray-300 hover:text-white transition-colors">
              Social Media
            </a>
            <a href="#business-templates" className="text-gray-300 hover:text-white transition-colors">
              Templates
            </a>
            <a href="#video-generator" className="text-gray-300 hover:text-white transition-colors">
              Video
            </a>
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-4">
            {firebaseUser && user ? (
              <>
                {/* Credits Display */}
                <motion.button
                  onClick={() => setIsCreditsModalOpen(true)}
                  className="hidden md:flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-400 px-3 py-2 rounded-lg hover:from-yellow-500/30 hover:to-orange-500/30 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="font-semibold">{user.credits}</span>
                  <span className="text-xs opacity-75">credits</span>
                </motion.button>

                {/* User Menu */}
                <div className="relative">
                  <motion.button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <User className="w-4 h-4 text-gray-300" />
                    <span className="hidden md:block text-gray-300 text-sm">
                      {user.name.split(' ')[0]}
                    </span>
                    <div className="md:hidden">
                      {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                    </div>
                  </motion.button>

                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <motion.div
                      className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="p-3 border-b border-gray-700">
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                      </div>
                      
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setIsCreditsModalOpen(true);
                            setIsMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Credits: {user.credits}</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            logout();
                            setIsMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </>
            ) : (
              <motion.button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign In
              </motion.button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.nav 
            className="md:hidden py-4 border-t border-gray-800"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex flex-col gap-2">
              <a 
                href="#brand-kit-generator" 
                className="text-gray-300 hover:text-white px-4 py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Brand Kit Generator
              </a>
              <a 
                href="#logo-generator" 
                className="text-gray-300 hover:text-white px-4 py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Logo Generator
              </a>
              <a 
                href="#social-media" 
                className="text-gray-300 hover:text-white px-4 py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Social Media
              </a>
              <a 
                href="#business-templates" 
                className="text-gray-300 hover:text-white px-4 py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Templates
              </a>
              <a 
                href="#video-generator" 
                className="text-gray-300 hover:text-white px-4 py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Video Generator
              </a>
            </div>
          </motion.nav>
        )}
      </div>
    </motion.header>
  );
};

export default Header;