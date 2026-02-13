/**
 * localStorage persistence for Marketing Dashboard
 * Keys: flowstack-marketing-campaigns, flowstack-marketing-leads
 */

const MKT_CAMPAIGNS_KEY = 'flowstack-marketing-campaigns';
const MKT_LEADS_KEY = 'flowstack-marketing-leads';

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

export const loadMarketingCampaigns = <T>(): T[] => load<T>(MKT_CAMPAIGNS_KEY);
export const saveMarketingCampaigns = <T>(items: T[]): boolean => save(MKT_CAMPAIGNS_KEY, items);

export const loadMarketingLeads = <T>(): T[] => load<T>(MKT_LEADS_KEY);
export const saveMarketingLeads = <T>(items: T[]): boolean => save(MKT_LEADS_KEY, items);
