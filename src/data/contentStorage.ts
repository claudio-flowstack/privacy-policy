/**
 * localStorage persistence for Content Dashboard
 * Keys: flowstack-content-items, flowstack-content-research, flowstack-content-files, flowstack-content-plans
 */

const CONTENT_KEY = 'flowstack-content-items';
const RESEARCH_KEY = 'flowstack-content-research';
const FILES_KEY = 'flowstack-content-files';
const PLANS_KEY = 'flowstack-content-plans';

// ---- Content Items ----

export function loadContentItems<T>(): T[] {
  try {
    const stored = localStorage.getItem(CONTENT_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveContentItems<T>(items: T[]): boolean {
  try {
    localStorage.setItem(CONTENT_KEY, JSON.stringify(items));
    return true;
  } catch (e) {
    console.warn('localStorage error saving content items:', e);
    return false;
  }
}

// ---- Research Notes ----

export function loadResearchNotes<T>(): T[] {
  try {
    const stored = localStorage.getItem(RESEARCH_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveResearchNotes<T>(items: T[]): boolean {
  try {
    localStorage.setItem(RESEARCH_KEY, JSON.stringify(items));
    return true;
  } catch (e) {
    console.warn('localStorage error saving research notes:', e);
    return false;
  }
}

// ---- File Links ----

export function loadFileLinks<T>(): T[] {
  try {
    const stored = localStorage.getItem(FILES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveFileLinks<T>(items: T[]): boolean {
  try {
    localStorage.setItem(FILES_KEY, JSON.stringify(items));
    return true;
  } catch (e) {
    console.warn('localStorage error saving file links:', e);
    return false;
  }
}

// ---- Marketing Plans ----

export function loadPlans<T>(): T[] {
  try {
    const stored = localStorage.getItem(PLANS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function savePlans<T>(items: T[]): boolean {
  try {
    localStorage.setItem(PLANS_KEY, JSON.stringify(items));
    return true;
  } catch (e) {
    console.warn('localStorage error saving plans:', e);
    return false;
  }
}
