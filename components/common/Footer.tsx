
import React from 'react';
import { BrainCircuit, Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer id="footer" className="bg-gray-900/70 border-t border-gray-800/50 mt-20 text-gray-400">
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 px-8 py-16">
                {/* Column 1: Brand & Info */}
                <div className="col-span-2 md:col-span-2 pr-8">
                    <a href="https://lotaya.io" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 mb-4">
                        <BrainCircuit className="h-8 w-8 text-blue-400" />
                        <h2 className="text-2xl font-bold text-white">Lotaya AI</h2>
                    </a>
                    <p className="text-sm mb-4">
                        Turn every thought into design. AI-powered design studio creating professional logos, social media content, and business templates with cutting-edge technology.
                    </p>
                    <div className="text-sm space-y-2">
                        <p><a href="mailto:info@lotaya.io" className="hover:text-white transition-colors">info@lotaya.io</a></p>
                        <p><a href="tel:09970000616" className="hover:text-white transition-colors">09970000616</a></p>
                        <p>Yangon, Myanmar</p>
                    </div>
                </div>

                {/* Column 2: Quick Links */}
                <div>
                    <h3 className="font-bold text-white mb-4">Quick Links</h3>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#logo-generator" className="hover:text-white transition-colors">Logo Generator</a></li>
                        <li><a href="#social-media" className="hover:text-white transition-colors">Social Media Tools</a></li>
                        <li><a href="#business-templates" className="hover:text-white transition-colors">Business Templates</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                    </ul>
                </div>

                {/* Column 3: Features */}
                <div>
                    <h3 className="font-bold text-white mb-4">Features</h3>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#video-generator" className="hover:text-white transition-colors">AI Video Generation</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Social Media Design</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Business Templates</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Data Protection</a></li>
                    </ul>
                </div>

                {/* Column 4: Stay Connected */}
                <div className="col-span-2 md:col-span-1">
                    <h3 className="font-bold text-white mb-4">Stay Connected</h3>
                    <p className="text-sm mb-4">Get updates on new features and design tips.</p>
                    <form className="flex">
                        <input type="email" placeholder="Enter your email" className="w-full bg-gray-800 border border-gray-700 rounded-l-md px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                        <button type="submit" className="bg-blue-600 text-white px-4 rounded-r-md text-sm font-semibold hover:bg-blue-700 transition-colors">Subscribe</button>
                    </form>
                </div>
            </div>
            
            <div className="border-t border-gray-800/50">
                <div className="max-w-7xl mx-auto px-8 py-6 flex flex-col sm:flex-row justify-between items-center text-sm">
                    <p>&copy; {new Date().getFullYear()} Lotaya AI Clone. All rights reserved.</p>
                    <div className="flex items-center gap-6 mt-4 sm:mt-0">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        <div className="flex gap-4">
                            <a href="#" aria-label="Visit our Twitter page" className="hover:text-white transition-colors"><Twitter size={18} /></a>
                            <a href="#" aria-label="Visit our Facebook page" className="hover:text-white transition-colors"><Facebook size={18} /></a>
                            <a href="#" aria-label="Visit our Instagram page" className="hover:text-white transition-colors"><Instagram size={18} /></a>
                            <a href="#" aria-label="Visit our LinkedIn page" className="hover:text-white transition-colors"><Linkedin size={18} /></a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
