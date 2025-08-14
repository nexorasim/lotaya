require('dotenv').config();
const express = require('express');
const path = require('path');
const { GoogleGenAI, Type } = require('@google/genai');

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable is not set. API calls will fail.");
}

const app = express();
app.use(express.json({ limit: '10mb' })); // Increase limit for images

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// API error handler
const handleApiError = (res, error, serviceName) => {
    console.error(`Error in ${serviceName}:`, error);
    res.status(500).json({ message: error.message || `An error occurred in ${serviceName}.` });
};

// --- Gemini API Endpoints ---

app.post('/api/generate-logos', async (req, res) => {
    try {
        const { prompt } = req.body;
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt,
            config: { numberOfImages: 4, outputMimeType: 'image/png', aspectRatio: '1:1' },
        });
        res.json({ images: response.generatedImages.map(img => img.image.imageBytes) });
    } catch (error) {
        handleApiError(res, error, 'Logo Generation');
    }
});

app.post('/api/generate-social-image', async (req, res) => {
    try {
        const { prompt, aspectRatio } = req.body;
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt,
            config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio },
        });
        res.json({ image: response.generatedImages[0].image.imageBytes });
    } catch (error) {
        handleApiError(res, error, 'Social Image Generation');
    }
});

app.post('/api/generate-social-text', async (req, res) => {
    try {
        const { prompt } = req.body;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on this idea: "${prompt}", generate a compelling social media caption and a list of 5 relevant hashtags.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        caption: { type: Type.STRING },
                        hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["caption", "hashtags"]
                }
            }
        });
        res.json(JSON.parse(response.text));
    } catch (error) {
        handleApiError(res, error, 'Social Text Generation');
    }
});

app.post('/api/generate-template-idea', async (req, res) => {
    try {
        const { description, templateType } = req.body;
        const prompt = `I need a design concept for a ${templateType}. The business or event is: "${description}". Generate a creative idea including a layout suggestion, font pairings (one for heading, one for body), and a color palette (primary, secondary, accent hex codes).`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        layoutSuggestion: { type: Type.STRING },
                        fontPairings: { type: Type.OBJECT, properties: { heading: { type: Type.STRING }, body: { type: Type.STRING } } },
                        colorPalette: { type: Type.OBJECT, properties: { primary: { type: Type.STRING }, secondary: { type: Type.STRING }, accent: { type: Type.STRING } } }
                    },
                }
            }
        });
        res.json(JSON.parse(response.text));
    } catch (error) {
        handleApiError(res, error, 'Template Idea Generation');
    }
});

app.post('/api/generate-brand-identity', async (req, res) => {
     try {
        const { description } = req.body;
        const prompt = `Based on the following brand description, generate a complete brand identity kit. Description: "${description}". Generate: 1. A short, catchy Brand Name. 2. A compelling one-sentence Mission Statement. 3. A color palette with primary, secondary, and accent hex codes. 4. Font pairings for heading and body text (suggest real font names). 5. A concise, descriptive prompt for an AI image generator to create a modern vector logo on a clean background. Return JSON.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        brandName: { type: Type.STRING },
                        missionStatement: { type: Type.STRING },
                        colorPalette: { type: Type.OBJECT, properties: { primary: { type: Type.STRING }, secondary: { type: Type.STRING }, accent: { type: Type.STRING } } },
                        fontPairings: { type: Type.OBJECT, properties: { heading: { type: Type.STRING }, body: { type: Type.STRING } } },
                        logoPrompt: { type: Type.STRING }
                    },
                }
            }
        });
        res.json(JSON.parse(response.text));
    } catch (error) {
        handleApiError(res, error, 'Brand Identity Generation');
    }
});

app.post('/api/generate-videos', async (req, res) => {
    try {
        const { prompt, image } = req.body;
        const params = { model: 'veo-2.0-generate-001', prompt, config: { numberOfVideos: 1 } };
        if (image) params.image = { imageBytes: image.imageBytes, mimeType: image.mimeType };
        const operation = await ai.models.generateVideos(params);
        res.json(operation);
    } catch (error) {
        handleApiError(res, error, 'Video Generation Start');
    }
});

app.post('/api/get-video-operation', async (req, res) => {
    try {
        const { operation } = req.body;
        const result = await ai.operations.getVideosOperation({ operation });
        res.json(result);
    } catch (error) {
        handleApiError(res, error, 'Video Operation Poll');
    }
});

app.get('/api/fetch-video', async (req, res) => {
    try {
        const downloadLink = req.query.uri;
        if (!downloadLink) return res.status(400).json({ message: "Missing video URI" });

        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!response.ok || !response.body) {
            throw new Error(`Failed to fetch video: ${response.statusText}`);
        }
        res.setHeader('Content-Type', 'video/mp4');
        response.body.pipe(res);
    } catch (error) {
        handleApiError(res, error, 'Fetch Video');
    }
});


// --- Health Check ---
app.get('/health', (req, res) => res.status(200).send('OK'));


// --- Mock Auth & Credits API for Demo ---
let mockUser = { name: "Demo User", email: "demo@lotaya.io", credits: 50 };
let mockTransactions = [];

app.get('/api/auth/session', (req, res) => res.status(404).json({ message: 'No active session' }));
app.post('/api/auth/login', (req, res) => res.json(mockUser));
app.post('/api/auth/signup', (req, res) => res.json(mockUser));
app.post('/api/auth/logout', (req, res) => res.status(204).send());
app.get('/api/transactions', (req, res) => res.json(mockTransactions));

app.post('/api/credits/deduct', (req, res) => {
    const { amount, description } = req.body;
    mockUser.credits -= amount;
    const transaction = { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], description, amount: -amount };
    mockTransactions.unshift(transaction);
    res.json({ newCredits: mockUser.credits, transaction });
});

app.post('/api/credits/top-up', (req, res) => {
    const { amount } = req.body;
    mockUser.credits += amount;
    const transaction = { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], description: `Top-up ${amount} credits`, amount };
    mockTransactions.unshift(transaction);
    res.json({ newCredits: mockUser.credits, transaction });
});


// --- Serve Frontend ---
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});