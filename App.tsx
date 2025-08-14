import React, { useContext } from 'react';
import LogoGenerator from './components/LogoGenerator';
import SocialMediaAssistant from './components/SocialMediaAssistant';
import BusinessTemplates from './components/TemplateIdeas';
import VideoGenerator from './components/VideoGenerator';
import { Cpu, Zap, Gem } from 'lucide-react';
import ParticleBackground from './components/common/ParticleBackground';
import Footer from './components/common/Footer';
import Header from './components/common/Header';
import AuthModal from './components/common/AuthModal';
import CreditsModal from './components/common/CreditsModal';
import { UserContext } from './contexts/UserContext';
import ToastContainer from './components/common/ToastContainer';
import BrandKitGenerator from './components/BrandKitGenerator';
import Spinner from './components/common/Spinner';

const App: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, isCreditsModalOpen, setIsCreditsModalOpen, isLoading } = useContext(UserContext);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-gray-950 flex items-center justify-center">
        <Spinner size="h-16 w-16" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full text-white bg-gray-950">
      <ParticleBackground />
      <ToastContainer />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <CreditsModal isOpen={isCreditsModalOpen} onClose={() => setIsCreditsModalOpen(false)} />
      
      <div className="relative z-10">
        <Header />

        <main className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Hero Section */}
          <section className="text-center py-16 md:py-24">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
              Turn Every Thought Into Design
            </h1>
            <p className="max-w-3xl mx-auto text-gray-400 md:text-lg mb-8">
              Transform your ideas into professional logos, social media content, and business templates using cutting-edge AI technology. From concept to creation in seconds.
            </p>
            <div className="flex justify-center gap-4">
              <button onClick={() => setIsAuthModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                Start Creating for Free
              </button>
              <button className="bg-gray-800/60 hover:bg-gray-700/80 text-gray-300 font-bold py-3 px-6 rounded-lg transition-colors">
                Watch Demo
              </button>
            </div>
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="flex items-center gap-4">
                <Cpu size={24} className="text-blue-400" />
                <div>
                  <h3 className="font-bold">AI-Powered</h3>
                  <p className="text-sm text-gray-400">Advanced AI creates unique designs</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Zap size={24} className="text-blue-400" />
                <div>
                  <h3 className="font-bold">Lightning Fast</h3>
                  <p className="text-sm text-gray-400">Generate designs in seconds</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Gem size={24} className="text-blue-400" />
                <div>
                  <h3 className="font-bold">Professional</h3>
                  <p className="text-sm text-gray-400">Production-ready quality</p>
                </div>
              </div>
            </div>
          </section>

          {/* Brand Kit Generator Section */}
          <section id="brand-kit-generator" className="py-16 md:py-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">AI Brand Kit Generator</h2>
              <p className="mt-4 max-w-2xl mx-auto text-gray-400">
                Instantly generate a complete brand identity. From logo and colors to fonts and a mission statement, all from a single idea.
              </p>
            </div>
            <BrandKitGenerator />
          </section>

          {/* Logo Generator Section */}
          <section id="logo-generator" className="py-16 md:py-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">AI Logo Generator</h2>
              <p className="mt-4 max-w-2xl mx-auto text-gray-400">
                Turn your business ideas into unique, professional logos in seconds using our advanced AI technology.
              </p>
            </div>
            <LogoGenerator />
          </section>

          {/* Social Media Section */}
          <section id="social-media" className="py-16 md:py-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Social Media Design Tools</h2>
              <p className="mt-4 max-w-2xl mx-auto text-gray-400">
                Turn your ideas into professional social media content for all platforms with perfect dimensions and stunning designs.
              </p>
            </div>
            <SocialMediaAssistant />
          </section>

          {/* Business Templates Section */}
          <section id="business-templates" className="py-16 md:py-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Business & Marketing Templates</h2>
              <p className="mt-4 max-w-2xl mx-auto text-gray-400">
                Turn your business concepts into professional templates. From business cards to presentations—transform ideas into stunning designs in minutes.
              </p>
            </div>
            <BusinessTemplates />
          </section>

          {/* Video Generator Section */}
          <section id="video-generator" className="py-16 md:py-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">AI Video Generator</h2>
              <p className="mt-4 max-w-2xl mx-auto text-gray-400">
                Bring your stories to life. Turn a simple prompt—or an image—into a high-quality, short video clip with our AI video model.
              </p>
            </div>
            <VideoGenerator />
          </section>
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default App;
