import React, { useState, useCallback, useEffect, useRef, useContext } from 'react';
import { SocialContent } from '../types';
import { SOCIAL_TEMPLATES, CREDITS_COST } from '../constants';
import * as geminiService from '../services/geminiService';
import Spinner from './common/Spinner';
import { Wand2, Facebook, Youtube, Linkedin, Twitter, Twitch, Clipboard, Instagram } from 'lucide-react';
import DesignCanvas from './common/DesignCanvas';
import { UserContext } from '../contexts/UserContext';
import { useToast } from '../contexts/ToastContext';

const platformIcons: { [key: string]: React.ReactNode } = {
    'Facebook Cover': <Facebook size={24} />,
    'YouTube Banner': <Youtube size={24} />,
    'LinkedIn Banner': <Linkedin size={24} />,
    'Twitter Header': <Twitter size={24} />,
    'Twitch Banner': <Twitch size={24} />,
    'Pinterest Board Cover': <Clipboard size={24} />,
    'Instagram Post': <Instagram size={24} />,
    'Instagram Story': <Instagram size={24} />,
};

const SOCIAL_LOADING_MESSAGES = [
    "Brainstorming catchy captions...",
    "Designing a stunning visual...",
    "Finding the perfect hashtags...",
    "Optimizing for your platform...",
    "Assembling your post...",
    "Your content is almost ready to shine!"
];

const SocialMediaAssistant: React.FC = () => {
  const templateNames = Object.keys(SOCIAL_TEMPLATES);
  const [designIdea, setDesignIdea] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(templateNames[0]);
  const [content, setContent] = useState<SocialContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(SOCIAL_LOADING_MESSAGES[0]);
  const messageIntervalRef = useRef<number | null>(null);

  const { user, deductCredits, setIsAuthModalOpen } = useContext(UserContext);
  const { showToast } = useToast();

  useEffect(() => {
    if (isLoading) {
        let i = 0;
        messageIntervalRef.current = window.setInterval(() => {
            i = (i + 1) % SOCIAL_LOADING_MESSAGES.length;
            setLoadingMessage(SOCIAL_LOADING_MESSAGES[i]);
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
    
    if (user.credits < CREDITS_COST.SOCIAL_POST_GENERATION) {
      setError(`You need at least ${CREDITS_COST.SOCIAL_POST_GENERATION} credits for this. Please top up.`);
      showToast('Insufficient credits. Please top up.', 'error');
      return;
    }

    if (!designIdea.trim()) {
      setError('Please describe your design idea.');
      return;
    }
    
    setIsLoading(true);
    setLoadingMessage(SOCIAL_LOADING_MESSAGES[0]);
    setContent(null);

    try {
      await deductCredits(CREDITS_COST.SOCIAL_POST_GENERATION, `Social Post: ${selectedTemplate}`);
      const templateDetails = SOCIAL_TEMPLATES[selectedTemplate as keyof typeof SOCIAL_TEMPLATES];
      const imagePrompt = `A high-quality, visually appealing background image for a social media post. The theme is: "${designIdea}". The image should be suitable for a ${selectedTemplate}. Aspect ratio should be ${templateDetails.aspectRatio}. No text on the image. Photorealistic.`;
      
      const [imageData, textData] = await Promise.all([
        geminiService.generateSocialImage(imagePrompt, templateDetails.aspectRatio as any),
        geminiService.generateSocialText(designIdea)
      ]);
      
      setContent({
        image: imageData,
        caption: textData.caption,
        hashtags: textData.hashtags
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [designIdea, selectedTemplate, user, deductCredits, setIsAuthModalOpen, showToast]);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
        {templateNames.map(name => {
          const template = SOCIAL_TEMPLATES[name as keyof typeof SOCIAL_TEMPLATES];
          return (
            <button
              key={name}
              onClick={() => setSelectedTemplate(name)}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                selectedTemplate === name
                  ? 'bg-purple-600/20 border-purple-500 shadow-lg scale-105'
                  : 'bg-gray-800/50 border-gray-700/60 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-3 text-purple-400 mb-2">
                {platformIcons[name]}
                <h3 className="font-bold text-gray-100">{name}</h3>
              </div>
              <p className="text-sm text-gray-400">{template.width}x{template.height}px</p>
            </button>
          );
        })}
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/60 p-6 md:p-8 rounded-xl shadow-2xl">
        <form onSubmit={handleSubmit}>
          <label htmlFor="designIdea" className="block text-sm font-medium text-gray-300 mb-2">
            Start with an idea for your <span className="font-bold text-purple-400">{selectedTemplate}</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                id="designIdea"
                value={designIdea}
                onChange={(e) => setDesignIdea(e.target.value)}
                placeholder="e.g., A special offer for a new coffee blend"
                className="flex-grow bg-gray-900/70 border border-gray-600 rounded-md px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                required
              />
            <button
              type="submit"
              disabled={isLoading}
              className="flex-shrink-0 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 shadow-lg"
            >
              {isLoading ? <><Spinner size="h-5 w-5" /> Generating...</> : <><Wand2 size={18} /> Create Design ({CREDITS_COST.SOCIAL_POST_GENERATION} Credits)</>}
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
            <p className="text-sm text-gray-500">This might take a few seconds.</p>
          </div>
        )}
        {content && (
          <div className="flex flex-col gap-8">
            <DesignCanvas
                imageSrc={content.image}
                caption={content.caption}
                hashtags={content.hashtags}
                width={SOCIAL_TEMPLATES[selectedTemplate as keyof typeof SOCIAL_TEMPLATES].width}
                height={SOCIAL_TEMPLATES[selectedTemplate as keyof typeof SOCIAL_TEMPLATES].height}
                templateName={selectedTemplate}
            />
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/60 rounded-xl p-6 shadow-lg flex flex-col">
              <h3 className="text-xl font-bold text-gray-100 mb-4">Copy Content</h3>
              <div className="space-y-6 flex-grow">
                <div>
                  <h4 className="font-semibold text-purple-400 mb-2">Caption</h4>
                  <p className="text-gray-300 whitespace-pre-wrap">{content.caption}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-400 mb-2">Hashtags</h4>
                  <div className="flex flex-wrap gap-2">
                    {content.hashtags.map((tag, i) => (
                      <span key={i} className="bg-gray-700 text-gray-300 text-sm font-medium px-2 py-1 rounded">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialMediaAssistant;
