import React, { useState, useCallback, useEffect, useRef, useContext } from 'react';
import * as geminiService from '../services/geminiService';
import { VideoResult } from '../types';
import Spinner from './common/Spinner';
import { Clapperboard, Film, UploadCloud, X, Download } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { CREDITS_COST } from '../constants';
import { useToast } from '../contexts/ToastContext';

const LOADING_MESSAGES = [
    "Warming up the virtual cameras...",
    "Setting the scene and lighting...",
    "Directing the digital actors...",
    "Rendering the first few frames...",
    "Applying special effects and color grading...",
    "Adding sound and finishing touches...",
    "Your video masterpiece is almost ready!",
    "This can take a few minutes, please be patient."
];

const VideoGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [image, setImage] = useState<{ base64: string, name: string, mimeType: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
    const [error, setError] = useState<string | null>(null);
    const [video, setVideo] = useState<VideoResult | null>(null);
    const [operation, setOperation] = useState<any | null>(null);

    const { user, deductCredits, setIsAuthModalOpen } = useUser();
    const { showToast } = useToast();

    const messageIntervalRef = useRef<number | null>(null);
    const pollingIntervalRef = useRef<number | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64String = (event.target?.result as string).split(',')[1];
                setImage({
                    base64: base64String,
                    name: file.name,
                    mimeType: file.type,
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const pollOperation = useCallback(async (op: any) => {
        pollingIntervalRef.current = window.setInterval(async () => {
            try {
                const updatedOp = await geminiService.getVideosOperation(op);
                if (updatedOp.done) {
                    setIsLoading(false);
                    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                    
                    const downloadLink = updatedOp.response?.generatedVideos?.[0]?.video?.uri;
                    if (downloadLink) {
                         setLoadingMessage("Downloading your video...");
                         const videoBlob = await geminiService.fetchVideo(downloadLink);
                         const blobUrl = URL.createObjectURL(videoBlob);
                         setVideo({ uri: downloadLink, blobUrl });
                         setLoadingMessage("");
                         deductCredits(CREDITS_COST.VIDEO_GENERATION);
                    } else {
                        throw new Error("Video generation finished but no download link was found.");
                    }
                }
                setOperation(updatedOp);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown polling error occurred.';
                setError(errorMessage);
                showToast(errorMessage, 'error');
                setIsLoading(false);
            }
        }, 10000); // Poll every 10 seconds
    }, [deductCredits, showToast]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        if (!user) {
          setIsAuthModalOpen(true);
          return;
        }

        if (user.credits < CREDITS_COST.VIDEO_GENERATION) {
          setError(`You need at least ${CREDITS_COST.VIDEO_GENERATION} credits for video generation. Please top up.`);
          showToast('Insufficient credits. Please top up.', 'error');
          return;
        }
        
        if (!prompt.trim()) {
            setError('Please enter a prompt for your video.');
            return;
        }

        setVideo(null);
        setIsLoading(true);
        setLoadingMessage(LOADING_MESSAGES[0]);

        try {
            const initialOp = await geminiService.startVideoGeneration(prompt, image ? { imageBytes: image.base64, mimeType: image.mimeType } : undefined);
            setOperation(initialOp);
            await pollOperation(initialOp);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
            showToast(errorMessage, 'error');
            setIsLoading(false);
        }
    }, [prompt, image, pollOperation, user, setIsAuthModalOpen, showToast]);

    useEffect(() => {
        if (isLoading) {
            let i = 0;
            messageIntervalRef.current = window.setInterval(() => {
                i = (i + 1) % LOADING_MESSAGES.length;
                setLoadingMessage(LOADING_MESSAGES[i]);
            }, 5000);
        } else {
            if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        }

        return () => {
            if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        };
    }, [isLoading]);

    return (
        <div className="w-full max-w-5xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/60 p-6 md:p-8 rounded-xl shadow-2xl">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">Describe your video</label>
                            <textarea
                                id="prompt"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., A neon hologram of a cat driving a sports car at top speed"
                                rows={4}
                                className="w-full bg-gray-900/70 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Add an image (optional)</label>
                            <label htmlFor="image-upload" className="cursor-pointer group flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-600 hover:border-rose-500 rounded-lg p-4 transition">
                                <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-rose-400 transition" />
                                <p className="text-sm text-gray-400 mt-2 text-center">{image ? image.name : 'Click to upload'}</p>
                            </label>
                            <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            {image && <button type="button" onClick={() => setImage(null)} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 mx-auto"><X size={14} /> Remove image</button>}
                        </div>
                    </div>
                    <div className="mt-8">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 shadow-lg"
                        >
                            {isLoading ? <><Spinner size="h-5 w-5" /> Generating...</> : <><Clapperboard size={18} /> Generate Video ({CREDITS_COST.VIDEO_GENERATION} Credits)</>}
                        </button>
                    </div>
                </form>
                {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
            </div>

            <div className="mt-12">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center text-center bg-gray-800/50 backdrop-blur-sm border border-gray-700/60 p-8 rounded-xl shadow-2xl">
                        <Film className="w-16 h-16 text-rose-400 animate-pulse" />
                        <p className="mt-6 text-lg text-gray-200">{loadingMessage}</p>
                        <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4 overflow-hidden">
                            <div className="bg-rose-500 h-2.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                        </div>
                    </div>
                )}
                {video && (
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/60 p-6 rounded-xl shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-100">Your Video is Ready!</h3>
                            <a
                                href={video.blobUrl}
                                download={`lotaya-ai-video.mp4`}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ease-in-out bg-rose-600 text-white hover:bg-rose-700 shadow-md"
                            >
                                <Download size={16} />
                                <span>Download</span>
                            </a>
                        </div>
                        <video
                            src={video.blobUrl}
                            controls
                            autoPlay
                            loop
                            className="w-full rounded-lg"
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoGenerator;