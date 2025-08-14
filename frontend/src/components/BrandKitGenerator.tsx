import React, { useState, useCallback, useContext, useEffect, useRef } from 'react';
import * as geminiService from '../services/geminiService';
import { BrandKit, Logo } from '../types';
import { CREDITS_COST } from '../constants';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../contexts/ToastContext';
import Spinner from './common/Spinner';
import { Sparkles, Palette, Type, Quote, Download } from 'lucide-react';

const BRAND_KIT_LOADING_MESSAGES = [
    "Defining your brand's core...",
    "Brainstorming creative names...",
    "Crafting a compelling mission...",
    "Choosing a representative color story...",
    "Pairing the perfect typography...",
    "Conceptualizing logo designs...",
    "Building your brand kit...",
];

const BrandKitGenerator: React.FC = () => {
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [brandKit, setBrandKit] = useState<BrandKit | null>(null);
    const [loadingMessage, setLoadingMessage] = useState(BRAND_KIT_LOADING_MESSAGES[0]);

    const { user, deductCredits, setIsAuthModalOpen } = useUser();
    const { showToast } = useToast();
    const messageIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (isLoading) {
            let i = 0;
            messageIntervalRef.current = window.setInterval(() => {
                i = (i + 1) % BRAND_KIT_LOADING_MESSAGES.length;
                setLoadingMessage(BRAND_KIT_LOADING_MESSAGES[i]);
            }, 2500);
        } else {
            if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
        }

        return () => {
            if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
        };
    }, [isLoading]);
    
    useEffect(() => {
        if (brandKit?.fontPairings) {
            const { heading, body } = brandKit.fontPairings;
            const link = document.createElement('link');
            link.href = `https://fonts.googleapis.com/css2?family=${heading.replace(/ /g, '+')}:wght@400;700&family=${body.replace(/ /g, '+')}:wght@400;700&display=swap`;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
            
            return () => {
                document.head.removeChild(link);
            };
        }
    }, [brandKit]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!user) {
            setIsAuthModalOpen(true);
            return;
        }

        if (user.credits < CREDITS_COST.BRAND_KIT_GENERATION) {
            showToast(`Insufficient credits. You need ${CREDITS_COST.BRAND_KIT_GENERATION} credits.`, 'error');
            return;
        }

        if (!description.trim()) {
            setError('Please describe your brand.');
            return;
        }

        setIsLoading(true);
        setBrandKit(null);
        setLoadingMessage(BRAND_KIT_LOADING_MESSAGES[0]);

        try {
            // Step 1: Generate textual brand identity and logo prompt
            const identityData = await geminiService.generateBrandIdentity(description);
            
            setLoadingMessage("Generating logo concepts...");

            // Step 2: Generate logos using the prompt from step 1
            const imageBytesArray = await geminiService.generateLogos(identityData.logoPrompt);
            const generatedLogos: Logo[] = imageBytesArray.map((bytes, index) => ({
                id: `logo-${Date.now()}-${index}`,
                base64: bytes,
            }));

            // Step 3: Combine results and set state
            setBrandKit({ ...identityData, logos: generatedLogos });
            deductCredits(CREDITS_COST.BRAND_KIT_GENERATION);
            showToast('Your brand kit has been generated!', 'success');

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
            showToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [description, user, deductCredits, setIsAuthModalOpen, showToast]);

    const ColorSwatch: React.FC<{ color: string; label: string }> = ({ color, label }) => (
        <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-full border-4 border-gray-700 shadow-md" style={{ backgroundColor: color }}></div>
            <p className="mt-2 font-bold text-gray-200">{label}</p>
            <p className="text-sm text-gray-400 font-mono">{color}</p>
        </div>
    );
    
    return (
        <div className="w-full max-w-6xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/60 p-6 md:p-8 rounded-xl shadow-2xl">
                <form onSubmit={handleSubmit}>
                    <label htmlFor="brandDescription" className="block text-lg font-medium text-gray-200 mb-2">Describe Your Brand or Idea</label>
                    <p className="text-sm text-gray-400 mb-4">What do you do? Who is your audience? What is the feeling you want to convey?</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            id="brandDescription"
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g., An eco-friendly subscription box for indoor plant lovers"
                            className="flex-grow bg-gray-900/70 border border-gray-600 rounded-md px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                            required
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-shrink-0 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-800 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 shadow-lg"
                        >
                            {isLoading ? <><Spinner size="h-5 w-5" /> Generating...</> : <><Sparkles size={18} /> Generate Brand Kit ({CREDITS_COST.BRAND_KIT_GENERATION} Credits)</>}
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
                        <p className="text-sm text-gray-500">This is where the magic happens...</p>
                    </div>
                )}
                {brandKit && (
                    <div className="bg-gray-800/30 backdrop-blur-md border border-gray-700/50 rounded-2xl shadow-2xl p-6 md:p-10 space-y-12">
                        <div className="text-center border-b border-gray-700 pb-8">
                             <h2 className="text-4xl md:text-5xl font-extrabold text-white">{brandKit.brandName}</h2>
                             <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-300 flex items-center justify-center gap-3">
                                <Quote className="w-5 h-5 text-teal-400 transform -scale-x-100" /> 
                                <span>{brandKit.missionStatement}</span>
                                <Quote className="w-5 h-5 text-teal-400" />
                             </p>
                        </div>
                       
                        {/* Logos */}
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-white text-center">Logo Concepts</h3>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                                {brandKit.logos.map((logo) => (
                                <div key={logo.id} className="relative group bg-gray-800/50 backdrop-blur-sm border border-gray-700/60 rounded-lg p-4 flex items-center justify-center aspect-square shadow-lg transition-transform hover:scale-105 duration-300">
                                    <img src={`data:image/png;base64,${logo.base64}`} alt="Generated Logo" className="max-w-full max-h-full object-contain" />
                                    <a href={`data:image/png;base64,${logo.base64}`} download={`${brandKit.brandName}-logo-${logo.id}.png`} className="absolute bottom-2 right-2 p-2 bg-teal-600/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Download size={16} />
                                    </a>
                                </div>
                                ))}
                            </div>
                        </div>

                        {/* Colors & Fonts */}
                        <div className="grid md:grid-cols-2 gap-12 pt-8 border-t border-gray-700">
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold text-white text-center mb-6 flex items-center justify-center gap-2"><Palette/> Color Palette</h3>
                                <div className="flex justify-around items-start">
                                    <ColorSwatch color={brandKit.colorPalette.primary} label="Primary" />
                                    <ColorSwatch color={brandKit.colorPalette.secondary} label="Secondary" />
                                    <ColorSwatch color={brandKit.colorPalette.accent} label="Accent" />
                                </div>
                            </div>
                             <div className="space-y-4">
                                <h3 className="text-2xl font-bold text-white text-center mb-6 flex items-center justify-center gap-2"><Type/> Typography</h3>
                                <div className="text-center">
                                    <p className="text-gray-400">Heading Font</p>
                                    <p className="text-4xl text-white" style={{ fontFamily: brandKit.fontPairings.heading }}>{brandKit.fontPairings.heading}</p>
                                </div>
                                <div className="text-center mt-6">
                                    <p className="text-gray-400">Body Font</p>
                                    <p className="text-lg text-white" style={{ fontFamily: brandKit.fontPairings.body }}>{brandKit.fontPairings.body}</p>
                                    <p className="text-gray-400 mt-2" style={{ fontFamily: brandKit.fontPairings.body }}>The quick brown fox jumps over the lazy dog.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrandKitGenerator;
