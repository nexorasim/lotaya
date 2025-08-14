

import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { TemplateIdea, BrandIdentityData } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateLogos = async (prompt: string): Promise<string[]> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: prompt,
            config: {
                numberOfImages: 4,
                outputMimeType: 'image/png',
                aspectRatio: '1:1',
            },
        });

        return response.generatedImages.map(img => img.image.imageBytes);
    } catch (error) {
        console.error("Error generating logos:", error);
        throw new Error("Failed to generate logos. Please check your prompt and API key.");
    }
};

export const generateSocialImage = async (prompt: string, aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '1.91:1' | '3:1' | '4:1' | '2.5:1'): Promise<string> => {
     try {
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: aspectRatio,
            },
        });
        
        return response.generatedImages[0].image.imageBytes;
    } catch (error) {
        console.error("Error generating social image:", error);
        throw new Error("Failed to generate the social media image.");
    }
};


export const generateSocialText = async (prompt: string): Promise<{ caption: string, hashtags: string[] }> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on this idea: "${prompt}", generate a compelling social media caption and a list of 5 relevant hashtags.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        caption: {
                            type: Type.STRING,
                            description: "A short, engaging caption for a social media post."
                        },
                        hashtags: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "An array of 5 relevant hashtags, without the '#' symbol."
                        }
                    },
                    required: ["caption", "hashtags"]
                }
            }
        });
        
        const jsonText = response.text;
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating social text:", error);
        throw new Error("Failed to generate social media text content.");
    }
};


export const generateTemplateIdea = async (description: string, templateType: string): Promise<TemplateIdea> => {
    const prompt = `I need a design concept for a ${templateType}. The business or event is: "${description}". Generate a creative idea including a layout suggestion, font pairings (one for heading, one for body), and a color palette (primary, secondary, accent hex codes).`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        layoutSuggestion: {
                            type: Type.STRING,
                            description: "A brief description of a suggested layout for the template."
                        },
                        fontPairings: {
                            type: Type.OBJECT,
                            properties: {
                                heading: { type: Type.STRING, description: "Name of the font for headings." },
                                body: { type: Type.STRING, description: "Name of the font for body text." }
                            },
                            required: ["heading", "body"]
                        },
                        colorPalette: {
                            type: Type.OBJECT,
                            properties: {
                                primary: { type: Type.STRING, description: "Primary hex color code." },
                                secondary: { type: Type.STRING, description: "Secondary hex color code." },
                                accent: { type: Type.STRING, description: "Accent hex color code." }
                            },
                            required: ["primary", "secondary", "accent"]
                        }
                    },
                    required: ["layoutSuggestion", "fontPairings", "colorPalette"]
                }
            }
        });

        const jsonText = response.text;
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Error generating template idea:", error);
        throw new Error("Failed to generate the template idea.");
    }
};

export const generateBrandIdentity = async (description: string): Promise<BrandIdentityData> => {
    const prompt = `Based on the following brand description, generate a complete brand identity kit.
    Brand Description: "${description}"

    Your task is to generate:
    1. A short, catchy Brand Name.
    2. A compelling one-sentence Mission Statement.
    3. A color palette with primary, secondary, and accent hex codes. The colors should be harmonious and reflect the brand's essence.
    4. Font pairings for a heading and body text. Suggest real, accessible font names (e.g., from Google Fonts).
    5. A concise, descriptive prompt for an AI image generator to create a logo. The prompt should specify a modern, vector logo, on a clean background, and capture the brand's core idea. Do not include the brand name in quotes in the prompt. For example, instead of 'Logo for "Innovate Inc."', say 'Logo for Innovate Inc.'.

    Return the result as a JSON object.`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        brandName: { type: Type.STRING, description: "The generated brand name." },
                        missionStatement: { type: Type.STRING, description: "The generated mission statement." },
                        colorPalette: {
                            type: Type.OBJECT,
                            properties: {
                                primary: { type: Type.STRING, description: "Primary hex color code." },
                                secondary: { type: Type.STRING, description: "Secondary hex color code." },
                                accent: { type: Type.STRING, description: "Accent hex color code." }
                            },
                            required: ["primary", "secondary", "accent"]
                        },
                        fontPairings: {
                            type: Type.OBJECT,
                            properties: {
                                heading: { type: Type.STRING, description: "Name of the font for headings." },
                                body: { type: Type.STRING, description: "Name of the font for body text." }
                            },
                            required: ["heading", "body"]
                        },
                        logoPrompt: { type: Type.STRING, description: "A prompt for an AI image generator to create a logo."}
                    },
                    required: ["brandName", "missionStatement", "colorPalette", "fontPairings", "logoPrompt"]
                }
            }
        });

        const jsonText = response.text;
        return JSON.parse(jsonText) as BrandIdentityData;

    } catch (error) {
        console.error("Error generating brand identity:", error);
        throw new Error("Failed to generate the brand identity kit.");
    }
};

export const startVideoGeneration = async (prompt: string, image?: { imageBytes: string; mimeType: string; }) => {
    try {
        const params: any = {
            model: 'veo-2.0-generate-001',
            prompt,
            config: {
                numberOfVideos: 1,
            }
        };
        if (image) {
            params.image = {
                imageBytes: image.imageBytes,
                mimeType: image.mimeType,
            };
        }

        const operation = await ai.models.generateVideos(params);
        return operation;
    } catch (error) {
        console.error("Error starting video generation:", error);
        throw new Error("Failed to start video generation.");
    }
};

export const getVideosOperation = async (operation: any) => {
    try {
        return await ai.operations.getVideosOperation({ operation });
    } catch (error) {
        console.error("Error getting video operation status:", error);
        throw new Error("Failed to get video operation status.");
    }
};

export const fetchVideo = async (downloadLink: string): Promise<Blob> => {
    try {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY not available to fetch video.");
        }
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!response.ok) {
            const errorBody = await response.text();
            console.error("Fetch video error:", errorBody);
            throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`);
        }
        return await response.blob();
    } catch (error) {
        console.error("Error fetching video:", error);
        throw new Error("Failed to download video data.");
    }
};