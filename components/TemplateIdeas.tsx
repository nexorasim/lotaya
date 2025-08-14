import React, { useState, useCallback, useContext } from 'react';
import { TemplateIdea } from '../types';
import { BUSINESS_TEMPLATES, BUSINESS_TEMPLATES_DATA, CREDITS_COST } from '../constants';
import * as geminiService from '../services/geminiService';
import Spinner from './common/Spinner';
import { Lightbulb, Layers } from 'lucide-react';
import { UserContext } from '../contexts/UserContext';
import { useToast } from '../contexts/ToastContext';

const BusinessTemplates: React.FC = () => {
  const [description, setDescription] = useState('');
  const [templateType, setTemplateType] = useState(BUSINESS_TEMPLATES[0]);
  const [idea, setIdea] = useState<TemplateIdea | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, deductCredits, setIsAuthModalOpen } = useContext(UserContext);
  const { showToast } = useToast();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (user.credits < CREDITS_COST.TEMPLATE_IDEA_GENERATION) {
      setError(`You need at least ${CREDITS_COST.TEMPLATE_IDEA_GENERATION} credit for this. Please top up.`);
      showToast('Insufficient credits. Please top up.', 'error');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a description of your business or event.');
      return;
    }
    
    setIsLoading(true);
    setIdea(null);

    try {
      const result = await geminiService.generateTemplateIdea(description, templateType);
      setIdea(result);
      deductCredits(CREDITS_COST.TEMPLATE_IDEA_GENERATION);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [description, templateType, user, deductCredits, setIsAuthModalOpen, showToast]);

  const ColorSwatch: React.FC<{ color: string; label: string }> = ({ color, label }) => (
    <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-gray-500" style={{ backgroundColor: color }}></div>
        <div>
            <p className="font-semibold text-gray-200">{label}</p>
            <p className="text-sm text-gray-400 font-mono">{color}</p>
        </div>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto">
        {/* Template Gallery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
            {BUSINESS_TEMPLATES_DATA.map((template) => {
                const Icon = template.icon;
                return (
                    <div key={template.title} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/60 rounded-xl p-5 flex flex-col text-left transition-all hover:border-gray-600 hover:shadow-xl">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="bg-green-600/10 p-2 rounded-lg"><Icon className="text-green-400" size={24} /></div>
                            <h3 className="text-lg font-bold text-gray-100">{template.title}</h3>
                        </div>
                        <p className="text-sm text-gray-400 flex-grow mb-4">{template.description}</p>
                        <div className="flex justify-between items-center mt-auto">
                            <span className="text-xs font-semibold bg-gray-700/80 text-gray-300 px-2 py-1 rounded-md">{template.dimensions}</span>
                             <button onClick={() => user ? undefined : setIsAuthModalOpen(true)} className="text-sm font-medium text-green-400 hover:text-green-300">Customize</button>
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Custom Template Request */}
        <div className="text-center mb-8">
            <h3 className="text-2xl font-bold">Can't find what you're looking for?</h3>
            <p className="text-gray-400 mt-2">Our AI can create custom template concepts for any business need.</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/60 p-6 md:p-8 rounded-xl shadow-2xl">
            <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Business / Event Description</label>
                <textarea
                    id="description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., A cozy, rustic coffee shop that serves organic pastries."
                    className="w-full bg-gray-900/70 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                    required
                />
                </div>
                <div>
                <label htmlFor="templateType" className="block text-sm font-medium text-gray-300 mb-2">Template Type</label>
                <select
                    id="templateType"
                    value={templateType}
                    onChange={(e) => setTemplateType(e.target.value)}
                    className="w-full bg-gray-900/70 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                >
                    {BUSINESS_TEMPLATES.map(name => <option key={name} value={name}>{name}</option>)}
                </select>
                </div>
            </div>
            <div className="mt-6">
                <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 shadow-lg"
                >
                {isLoading ? <><Spinner size="h-5 w-5" /> Generating Idea...</> : <><Lightbulb size={18} /> Request Custom Template ({CREDITS_COST.TEMPLATE_IDEA_GENERATION} Credit)</>}
                </button>
            </div>
            </form>
            {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
        </div>

        <div className="mt-12">
            {isLoading && (
            <div className="flex flex-col items-center justify-center text-center">
                <Spinner size="h-12 w-12" />
                <p className="mt-4 text-lg text-gray-300">Searching for inspiration...</p>
                <p className="text-sm text-gray-500">Good ideas take time.</p>
            </div>
            )}
            {idea && (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/60 rounded-xl shadow-2xl p-6 md:p-8 space-y-6">
                <h3 className="text-2xl font-bold text-gray-100 flex items-center gap-3"><Layers size={24} /> Your Custom Template Idea</h3>
                
                <div>
                <h4 className="font-semibold text-lg text-green-400 mb-2">Layout Suggestion</h4>
                <p className="text-gray-300">{idea.layoutSuggestion}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold text-lg text-green-400 mb-3">Font Pairings</h4>
                        <div className="space-y-3">
                            <p><span className="font-medium text-gray-400">Heading:</span> <span className="font-bold text-gray-200">{idea.fontPairings.heading}</span></p>
                            <p><span className="font-medium text-gray-400">Body:</span> <span className="font-bold text-gray-200">{idea.fontPairings.body}</span></p>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-lg text-green-400 mb-3">Color Palette</h4>
                        <div className="space-y-4">
                            <ColorSwatch color={idea.colorPalette.primary} label="Primary" />
                            <ColorSwatch color={idea.colorPalette.secondary} label="Secondary" />
                            <ColorSwatch color={idea.colorPalette.accent} label="Accent" />
                        </div>
                    </div>
                </div>
            </div>
            )}
      </div>
    </div>
  );
};

export default BusinessTemplates;