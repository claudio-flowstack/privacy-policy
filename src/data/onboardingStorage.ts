import type { OnboardingFormData } from '../types/automation';

const ONBOARDING_KEY = 'flowstack-onboarding-submissions';

interface OnboardingSubmission extends OnboardingFormData {
  id: string;
  submittedAt: string;
}

export function loadOnboardingSubmissions(): OnboardingSubmission[] {
  try {
    const stored = localStorage.getItem(ONBOARDING_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

export function saveOnboardingSubmission(data: OnboardingFormData): string {
  const id = `onb-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
  const submissions = loadOnboardingSubmissions();
  submissions.push({ ...data, id, submittedAt: new Date().toISOString() });
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(submissions));
  return id;
}
