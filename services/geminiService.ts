import { TemplateIdea, BrandIdentityData, VideoResult } from '../types';

const handleApiResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Request failed with status ${response.status}` }));
        throw new Error(errorData.message || 'An unknown server error occurred.');
    }
    return response.json();
};

const handleBlobResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Request failed with status ${response.status}` }));
        throw new Error(errorData.message || 'An unknown server error occurred.');
    }
    return response.blob();
}

export const generateLogos = async (prompt: string): Promise<string[]> => {
    const response = await fetch('/api/generate-logos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
    });
    const data = await handleApiResponse(response);
    return data.images;
};

export const generateSocialImage = async (prompt: string, aspectRatio: string): Promise<string> => {
    const response = await fetch('/api/generate-social-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, aspectRatio })
    });
    const data = await handleApiResponse(response);
    return data.image;
};

export const generateSocialText = async (prompt: string): Promise<{ caption: string, hashtags: string[] }> => {
    const response = await fetch('/api/generate-social-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
    });
    return handleApiResponse(response);
};

export const generateTemplateIdea = async (description: string, templateType: string): Promise<TemplateIdea> => {
     const response = await fetch('/api/generate-template-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, templateType })
    });
    return handleApiResponse(response);
};

export const generateBrandIdentity = async (description: string): Promise<BrandIdentityData> => {
    const response = await fetch('/api/generate-brand-identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
    });
    return handleApiResponse(response);
};

export const startVideoGeneration = async (prompt: string, image?: { imageBytes: string; mimeType: string; }) => {
    const response = await fetch('/api/generate-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, image })
    });
    return handleApiResponse(response);
};

export const getVideosOperation = async (operation: any) => {
    const response = await fetch('/api/get-video-operation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation })
    });
    return handleApiResponse(response);
};

export const fetchVideo = async (downloadLink: string): Promise<Blob> => {
     const response = await fetch(`/api/fetch-video?uri=${encodeURIComponent(downloadLink)}`);
     return handleBlobResponse(response);
};