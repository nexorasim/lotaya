import { IndustryCategory, BusinessTemplate } from './types';
import { Briefcase, Megaphone, Calendar, Shirt, Mail, QrCode, Presentation, Menu, Gift, DraftingCompass, Newspaper, PenTool, Music, Mic, ShoppingCart } from 'lucide-react';


export const FONT_STYLES = ['Modern', 'Elegant', 'Bold', 'Minimalist', 'Playful', 'Classic'];

export const INDUSTRY_CATEGORIES: IndustryCategory[] = [
    'Construction', 'Cool', 'DJ', 'Restaurant', 'Letter', 'Real Estate', 'Circle', 
    'Fashion', 'Cartoon', 'Travel', 'Cafe', 'Eagle', 'Podcast', 'Bakery', 'Text', 
    'Icon', 'Word', 'Team', 'App', 'Barber', 'Font', 'Web', 'Pizza', 'Shop', 'Simple', 
    'Symbol', 'Beauty', 'Coffee', 'Doctor', 'Gym', 'Lion', 'Music'
];

export const SOCIAL_TEMPLATES = {
  'Facebook Cover': { width: 1200, height: 630, aspectRatio: '1.91:1' },
  'YouTube Banner': { width: 2560, height: 1440, aspectRatio: '16:9' },
  'LinkedIn Banner': { width: 1584, height: 396, aspectRatio: '4:1' },
  'Twitter Header': { width: 1500, height: 500, aspectRatio: '3:1' },
  'Twitch Banner': { width: 1200, height: 480, aspectRatio: '2.5:1' },
  'Pinterest Board Cover': { width: 600, height: 600, aspectRatio: '1:1' },
  'Instagram Post': { width: 1080, height: 1080, aspectRatio: '1:1' },
  'Instagram Story': { width: 1080, height: 1920, aspectRatio: '9:16' },
};


export const BUSINESS_TEMPLATES_DATA: BusinessTemplate[] = [
    { category: 'business', title: 'Business Card', description: 'Professional business cards with modern design', dimensions: '3.5x2 in', icon: Briefcase },
    { category: 'business', title: 'Letterhead', description: 'Corporate letterheads for official correspondence', dimensions: '8.5x11 in', icon: Newspaper },
    { category: 'apparel', title: 'T-Shirt Design', description: 'Custom t-shirt designs for brands and events', dimensions: 'Custom', icon: Shirt },
    { category: 'business', title: 'Email Signature', description: 'Professional email signatures with contact info', dimensions: 'Responsive', icon: Mail },
    { category: 'marketing', title: 'Flyer', description: 'Eye-catching flyers for promotions and events', dimensions: '8.5x11 in', icon: Megaphone },
    { category: 'marketing', title: 'Poster', description: 'Large format posters for advertising', dimensions: '18x24 in', icon: PenTool },
    { category: 'business', title: 'Gift Certificate', description: 'Professional gift certificates and vouchers', dimensions: '8.5x3.5 in', icon: Gift },
    { category: 'events', title: 'Invitation', description: 'Elegant invitations for special events', dimensions: '5x7 in', icon: Calendar },
    { category: 'marketing', title: 'QR Code', description: 'Custom QR codes with branding', dimensions: 'Scalable', icon: QrCode },
    { category: 'business', title: 'Presentation', description: 'Professional presentation templates', dimensions: '16:9', icon: Presentation },
    { category: 'business', title: 'Menu', description: 'Restaurant and cafe menu designs', dimensions: '8.5x14 in', icon: Menu },
    { category: 'events', title: 'Thank You Card', description: 'Personalized thank you cards', dimensions: '5x3.5 in', icon: DraftingCompass }
];

// Kept separate for the "Request Custom Template" dropdown
export const BUSINESS_TEMPLATES = ['Business Card', 'Flyer', 'Poster', 'Brochure', 'Menu', 'Invitation', 'T-Shirt', 'Letterhead'];

export const CREDITS_COST = {
  LOGO_GENERATION: 4, // for 4 logos
  SOCIAL_POST_GENERATION: 2,
  TEMPLATE_IDEA_GENERATION: 1,
  VIDEO_GENERATION: 10,
  BRAND_KIT_GENERATION: 8,
};