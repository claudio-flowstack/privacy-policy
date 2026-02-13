/**
 * localStorage persistence for LinkedIn Dashboard
 * Keys: flowstack-linkedin-campaigns, flowstack-linkedin-posts,
 *       flowstack-linkedin-leads, flowstack-linkedin-templates,
 *       flowstack-linkedin-sequences
 */

const LI_CAMPAIGNS_KEY = 'flowstack-linkedin-campaigns';
const LI_POSTS_KEY = 'flowstack-linkedin-posts';
const LI_LEADS_KEY = 'flowstack-linkedin-leads';
const LI_TEMPLATES_KEY = 'flowstack-linkedin-templates';
const LI_SEQUENCES_KEY = 'flowstack-linkedin-sequences';

function load<T>(key: string): T[] {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function save<T>(key: string, items: T[]): boolean {
  try { localStorage.setItem(key, JSON.stringify(items)); return true; }
  catch (e) { console.warn('localStorage error:', e); return false; }
}

export const loadLinkedinCampaigns = <T>(): T[] => load<T>(LI_CAMPAIGNS_KEY);
export const saveLinkedinCampaigns = <T>(items: T[]): boolean => save(LI_CAMPAIGNS_KEY, items);

export const loadLinkedinPosts = <T>(): T[] => load<T>(LI_POSTS_KEY);
export const saveLinkedinPosts = <T>(items: T[]): boolean => save(LI_POSTS_KEY, items);

export const loadLinkedinLeads = <T>(): T[] => load<T>(LI_LEADS_KEY);
export const saveLinkedinLeads = <T>(items: T[]): boolean => save(LI_LEADS_KEY, items);

export const loadLinkedinTemplates = <T>(): T[] => load<T>(LI_TEMPLATES_KEY);
export const saveLinkedinTemplates = <T>(items: T[]): boolean => save(LI_TEMPLATES_KEY, items);

export const loadLinkedinSequences = <T>(): T[] => load<T>(LI_SEQUENCES_KEY);
export const saveLinkedinSequences = <T>(items: T[]): boolean => save(LI_SEQUENCES_KEY, items);
