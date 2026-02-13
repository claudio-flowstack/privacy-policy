/**
 * localStorage persistence for Hub Dashboard
 * Key: flowstack-hub-notes
 */

const NOTES_KEY = 'flowstack-hub-notes';

export function loadHubNotes<T>(): T[] {
  try {
    const stored = localStorage.getItem(NOTES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

export function saveHubNotes<T>(items: T[]): boolean {
  try { localStorage.setItem(NOTES_KEY, JSON.stringify(items)); return true; }
  catch (e) { console.warn('localStorage error saving hub notes:', e); return false; }
}
