import React, { useState, useCallback, useEffect, useRef, useContext } from 'react';
import { Logo, IndustryCategory } from '../types';
import { FONT_STYLES, INDUSTRY_CATEGORIES, CREDITS_COST } from '../constants';
import * as geminiService from '../services/geminiService';
import Spinner from './common/Spinner';
import { Sparkles } from 'lucide-react';
import { UserContext } from '../contexts/UserContext';
import { useToast } from '../contexts/ToastContext';

const LOGO_LOADING_MESSAGES = [
    "Sketching initial concepts...",
    "Exploring color palettes...",
    "Considering font pairings...",
    "Refining vector shapes...",
    "Polishing your new logos...",
    "Almost there, finalizing the designs!"
];

const LogoGenerator: React.FC = () => {
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState<IndustryCategory>('Construction');
  const [fontStyle, setFontStyle] = useState(FONT_STYLES[0]);
  const [logos, setLogos] = useState<Logo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(LOGO_LOADING_MESSAGES[0]);
  const messageIntervalRef = useRef<number | null>(null);

  const { user, deductCredits, setIsAuthModalOpen } = useContext(UserContext);
  const { showToast } = useToast();

  useEffect(() => {
    if (isLoading) {
        let i = 0;
        messageIntervalRef.current = window.setInterval(() => {
            i = (i + 1) % LOGO_LOADING_MESSAGES.length;
            setLoadingMessage(LOGO_LOADING_MESSAGES[i]);
        }, 2000);
    } else {
        if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
    }

    return () => {
        if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
    };
  }, [isLoading]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (user.credits < CREDITS_COST.LOGO_GENERATION) {
      setError(`You need at least ${CREDITS_COST.LOGO_GENERATION} credits to generate logos. Please top up.`);
      showToast(`Insufficient credits. Please top up.`, 'error');
      return;
    }

    if (!businessName.trim()) {
      setError('Please fill in the Business Name.');
      return;
    }
    
    setIsLoading(true);
    setLoadingMessage(LOGO_LOADING_MESSAGES[0]);
    setLogos([]);

    const prompt = `A modern, sleek, and professional vector logo for a company named '${businessName}'. The logo is for the ${industry} industry. The style should be ${fontStyle}. The logo should be an icon, simple, on a clean, solid color background, suitable for branding.`;

    try {
      const imageBytesArray = await geminiService.generateLogos(prompt);
      const generatedLogos = imageBytesArray.map((bytes, index) => ({
        id: `logo-${Date.now()}-${index}`,
        base64: bytes,
      }));
      setLogos(generatedLogos);
      deductCredits(CREDITS_COST.LOGO_GENERATION);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
        showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [businessName, industry, fontStyle, user, deductCredits, setIsAuthModalOpen, showToast]);

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/60 p-6 md:p-8 rounded-xl shadow-2xl">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-300 mb-2">Business Name</label>
              <input
                type="text"
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g., BuildIt"
                className="w-full bg-gray-900/70 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
              />
            </div>
            <div>
              <label htmlFor="fontStyle" className="block text-sm font-medium text-gray-300 mb-2">Font Style</label>
              <select
                id="fontStyle"
                value={fontStyle}
                onChange={(e) => setFontStyle(e.target.value)}
                className="w-full bg-gray-900/70 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              >
                {FONT_STYLES.map(style => <option key={style} value={style}>{style}</option>)}
              </select>
            </div>
          </div>
            
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Industry Category</label>
            <div className="flex flex-wrap gap-2">
                {INDUSTRY_CATEGORIES.map(cat => (
                    <button
                        type="button"
                        key={cat}
                        onClick={() => setIndustry(cat)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors duration-200 ${
                            industry === cat 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'bg-gray-700/60 hover:bg-gray-600/80 text-gray-300'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 shadow-lg"
            >
              {isLoading ? <><Spinner size="h-5 w-5" /> Generating...</> : <><Sparkles size={18} /> Generate Logos ({CREDITS_COST.LOGO_GENERATION} Credits)</>}
            </button>
          </div>
        </form>
        {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
      </div>

      <div className="mt-12">
        {isLoading && (
          <div className="flex flex-col items-center justify-center text-center">
            <Spinner size="h-12 w-12" />
            <p className="mt-4 text-lg text-gray-300">{loadingMessage}</p>
            <p className="text-sm text-gray-500">This may take a moment.</p>
          </div>
        )}
        {logos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {logos.map((logo) => (
              <div key={logo.id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/60 rounded-lg p-4 flex items-center justify-center aspect-square shadow-lg transition-transform hover:scale-105 duration-300">
                <img
                  src={`data:image/png;base64,${logo.base64}`}
                  alt="Generated Logo"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LogoGenerator;