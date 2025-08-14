import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import LogoGenerator from './components/LogoGenerator';
import SocialMediaAssistant from './components/SocialMediaAssistant';
import BusinessTemplates from './components/TemplateIdeas';
import VideoGenerator from './components/VideoGenerator';
import BrandKitGenerator from './components/BrandKitGenerator';
import { Cpu, Zap, Gem, Sparkles, ArrowRight } from 'lucide-react';
import ThreeDBackground from './components/common/ThreeDBackground';
import Footer from './components/common/Footer';
import Header from './components/common/Header';
import AuthModal from './components/common/AuthModal';
import CreditsModal from './components/common/CreditsModal';
import { useUser } from './contexts/UserContext';
import ToastContainer from './components/common/ToastContainer';

const App: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, isCreditsModalOpen, setIsCreditsModalOpen } = useUser();

  return (
    <div className="min-h-screen w-full text-white bg-gray-950 relative overflow-x-hidden">
      {/* 3D Background */}
      <ThreeDBackground intensity="medium" theme="gradient" />
      
      <ToastContainer />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <CreditsModal isOpen={isCreditsModalOpen} onClose={() => setIsCreditsModalOpen(false)} />
      
      <div className="relative z-10">
        <Header />

        <main className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Hero Section */}
          <motion.section 
            className="text-center py-16 md:py-24"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-7xl font-extrabold tracking-tighter mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient">
                  Turn Every Thought
                </span>
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 animate-gradient">
                  Into Design
                </span>
              </h1>
              
              <motion.p 
                className="max-w-3xl mx-auto text-gray-300 md:text-xl mb-8 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                Transform your ideas into professional logos, social media content, and business templates using cutting-edge AI technology. 
                Experience immersive 3D backgrounds while creating stunning designs in seconds.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <motion.button 
                  onClick={() => setIsAuthModalOpen(true)} 
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="flex items-center gap-2">
                    Start Creating for Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.button>
                
                <motion.button 
                  className="group bg-gray-800/60 hover:bg-gray-700/80 backdrop-blur-sm text-gray-300 hover:text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 border border-gray-600 hover:border-gray-500"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Watch Demo
                  </span>
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Feature Cards */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              {[
                { icon: Cpu, title: "AI-Powered", desc: "Advanced AI creates unique designs with 3D live previews" },
                { icon: Zap, title: "Lightning Fast", desc: "Generate professional designs in seconds" },
                { icon: Gem, title: "Professional", desc: "Production-ready quality with immersive UX" }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="group p-6 bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl hover:bg-gray-800/50 transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.1, duration: 0.6 }}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform">
                      <feature.icon size={24} className="text-white" />
                    </div>
                    <h3 className="font-bold text-xl text-white">{feature.title}</h3>
                  </div>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors">{feature.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          {/* Brand Kit Generator Section */}
          <motion.section 
            id="brand-kit-generator" 
            className="py-16 md:py-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-12">
              <motion.h2 
                className="text-3xl md:text-5xl font-bold tracking-tight mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400">
                  AI Brand Kit Generator
                </span>
              </motion.h2>
              <motion.p 
                className="mt-4 max-w-2xl mx-auto text-gray-400 text-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Instantly generate a complete brand identity with immersive 3D previews. From logo and colors to fonts and mission statement, all from a single idea.
              </motion.p>
            </div>
            <BrandKitGenerator />
          </motion.section>

          {/* Logo Generator Section */}
          <motion.section 
            id="logo-generator" 
            className="py-16 md:py-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-12">
              <motion.h2 
                className="text-3xl md:text-5xl font-bold tracking-tight mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                  AI Logo Generator
                </span>
              </motion.h2>
              <motion.p 
                className="mt-4 max-w-2xl mx-auto text-gray-400 text-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Turn your business ideas into unique, professional logos in seconds using our advanced AI technology with 3D live backgrounds.
              </motion.p>
            </div>
            <LogoGenerator />
          </motion.section>

          {/* Social Media Section */}
          <motion.section 
            id="social-media" 
            className="py-16 md:py-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-12">
              <motion.h2 
                className="text-3xl md:text-5xl font-bold tracking-tight mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                  Social Media Design Tools
                </span>
              </motion.h2>
              <motion.p 
                className="mt-4 max-w-2xl mx-auto text-gray-400 text-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Create professional social media content for all platforms with perfect dimensions and stunning 3D immersive design previews.
              </motion.p>
            </div>
            <SocialMediaAssistant />
          </motion.section>

          {/* Business Templates Section */}
          <motion.section 
            id="business-templates" 
            className="py-16 md:py-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-12">
              <motion.h2 
                className="text-3xl md:text-5xl font-bold tracking-tight mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-400">
                  Business & Marketing Templates
                </span>
              </motion.h2>
              <motion.p 
                className="mt-4 max-w-2xl mx-auto text-gray-400 text-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Transform business concepts into professional templates with 3D live previews. From business cards to presentations—stunning designs in minutes.
              </motion.p>
            </div>
            <BusinessTemplates />
          </motion.section>

          {/* Video Generator Section */}
          <motion.section 
            id="video-generator" 
            className="py-16 md:py-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-12">
              <motion.h2 
                className="text-3xl md:text-5xl font-bold tracking-tight mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">
                  AI Video Generator
                </span>
              </motion.h2>
              <motion.p 
                className="mt-4 max-w-2xl mx-auto text-gray-400 text-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Bring your stories to life with immersive 3D backgrounds. Turn a simple prompt—or an image—into high-quality, short video clips.
              </motion.p>
            </div>
            <VideoGenerator />
          </motion.section>
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default App;