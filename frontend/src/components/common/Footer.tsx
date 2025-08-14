import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Phone, MapPin, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="relative mt-20 bg-gray-900/80 backdrop-blur-sm border-t border-gray-800">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/10 to-purple-950/10" />
      
      <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <motion.div 
              className="flex items-center gap-2 mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Lotaya AI</h3>
                <p className="text-xs text-gray-400 -mt-1">Design Studio</p>
              </div>
            </motion.div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Turn every thought into design. AI-powered design studio creating professional logos, social media content, and business templates with cutting-edge technology.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#brand-kit-generator" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">Brand Kit Generator</a></li>
              <li><a href="#logo-generator" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">Logo Generator</a></li>
              <li><a href="#social-media" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">Social Media Tools</a></li>
              <li><a href="#business-templates" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">Business Templates</a></li>
              <li><a href="#video-generator" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">AI Video Generation</a></li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-white font-semibold mb-4">Features</h4>
            <ul className="space-y-2">
              <li><span className="text-gray-400 text-sm">AI Video Generation</span></li>
              <li><span className="text-gray-400 text-sm">Social Media Design</span></li>
              <li><span className="text-gray-400 text-sm">Business Templates</span></li>
              <li><span className="text-gray-400 text-sm">Brand Identity Kits</span></li>
              <li><span className="text-gray-400 text-sm">3D Live Backgrounds</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>info@lotaya.io</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <Phone className="w-4 h-4 text-blue-400" />
                <span>09970000616</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>Yangon, Myanmar</span>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="max-w-md mx-auto text-center">
            <h4 className="text-white font-semibold mb-2">Stay Connected</h4>
            <p className="text-gray-400 text-sm mb-4">Get updates on new features and design tips.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
              />
              <motion.button
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            © 2025 Lotaya AI. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-gray-400 text-sm">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <span>in Myanmar</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;