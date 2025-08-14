export interface Logo {
  id: string;
  base64: string;
}

export interface SocialContent {
  image: string;
  caption: string;
  hashtags: string[];
}

export interface TemplateIdea {
  layoutSuggestion: string;
  fontPairings: {
    heading: string;
    body: string;
  };
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface VideoResult {
    uri: string;
    blobUrl: string;
}

export interface BrandKit {
  brandName: string;
  missionStatement: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fontPairings: {
    heading: string;
    body: string;
  };
  logos: Logo[];
}

export interface BrandIdentityData {
  brandName: string;
  missionStatement: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fontPairings: {
    heading: string;
    body: string;
  };
  logoPrompt: string;
}

export type IndustryCategory = 'Construction' | 'Cool' | 'DJ' | 'Restaurant' | 'Letter' | 'Real Estate' | 'Circle' | 'Fashion' | 'Cartoon' | 'Travel' | 'Cafe' | 'Eagle' | 'Podcast' | 'Bakery' | 'Text' | 'Icon' | 'Word' | 'Team' | 'App' | 'Barber' | 'Font' | 'Web' | 'Pizza' | 'Shop' | 'Simple' | 'Symbol' | 'Beauty' | 'Coffee' | 'Doctor' | 'Gym' | 'Lion' | 'Music';

export interface BusinessTemplate {
  category: 'business' | 'marketing' | 'events' | 'apparel';
  title: string;
  description: string;
  dimensions: string;
  icon: React.ComponentType<{ className?: string; size?: number | string; }>;
}

export interface User {
  name: string;
  email: string;
  credits: number;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number; // positive for top-up, negative for usage
}

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}