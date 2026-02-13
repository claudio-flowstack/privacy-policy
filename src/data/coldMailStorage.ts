/**
 * localStorage persistence for Cold Mail Dashboard
 * Keys: flowstack-coldmail-campaigns, flowstack-coldmail-leads, flowstack-coldmail-templates
 */

const CAMPAIGNS_KEY = 'flowstack-coldmail-campaigns';
const LEADS_KEY = 'flowstack-coldmail-leads';
const TEMPLATES_KEY = 'flowstack-coldmail-templates';

export function loadCampaigns<T>(): T[] {
  try {
    const stored = localStorage.getItem(CAMPAIGNS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

export function saveCampaigns<T>(items: T[]): boolean {
  try { localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(items)); return true; }
  catch (e) { console.warn('localStorage error saving campaigns:', e); return false; }
}

export function loadLeads<T>(): T[] {
  try {
    const stored = localStorage.getItem(LEADS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

export function saveLeads<T>(items: T[]): boolean {
  try { localStorage.setItem(LEADS_KEY, JSON.stringify(items)); return true; }
  catch (e) { console.warn('localStorage error saving leads:', e); return false; }
}

export function loadTemplates<T>(): T[] {
  try {
    const stored = localStorage.getItem(TEMPLATES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

export function saveTemplates<T>(items: T[]): boolean {
  try { localStorage.setItem(TEMPLATES_KEY, JSON.stringify(items)); return true; }
  catch (e) { console.warn('localStorage error saving templates:', e); return false; }
}
