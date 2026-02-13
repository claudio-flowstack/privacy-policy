import type { SystemResource } from '../types/automation';

const RESOURCES_KEY = 'flowstack-system-resources';

export function loadResources(): SystemResource[] {
  try {
    const stored = localStorage.getItem(RESOURCES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

export function saveResources(resources: SystemResource[]): boolean {
  try {
    localStorage.setItem(RESOURCES_KEY, JSON.stringify(resources));
    return true;
  } catch (e) {
    console.warn('localStorage error saving resources:', e);
    return false;
  }
}

export function getResourcesForSystem(systemId: string): SystemResource[] {
  return loadResources().filter(r => r.systemId === systemId);
}

export function addResource(resource: SystemResource): boolean {
  const all = loadResources();
  all.push(resource);
  return saveResources(all);
}

export function deleteResource(resourceId: string): boolean {
  const all = loadResources().filter(r => r.id !== resourceId);
  return saveResources(all);
}
