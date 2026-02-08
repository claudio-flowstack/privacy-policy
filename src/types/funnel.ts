import type { PortDirection } from './automation';

// ─── Element Types ───────────────────────────────────────────────────────────

export type FunnelElementType = 'platform' | 'mockup' | 'text' | 'media';

export type PlatformKind =
  | 'facebook-ads' | 'instagram-ads' | 'google-ads' | 'linkedin-ads'
  | 'tiktok-ads' | 'landingpage' | 'website' | 'formular'
  | 'kalender' | 'crm' | 'email' | 'whatsapp-sms'
  | 'webinar' | 'checkout' | 'youtube' | 'seo';

export type MockupKind = 'mobile' | 'desktop' | 'tablet' | 'social-post' | 'ad-mockup'
  | 'facebook-ad' | 'instagram-ad' | 'google-ad' | 'linkedin-ad' | 'linkedin-post' | 'tiktok-ad';

export type TextKind = 'headline' | 'subheadline' | 'body' | 'note';

export type FunnelLineStyle = 'solid' | 'dashed' | 'dotted';

// ─── Core Data ───────────────────────────────────────────────────────────────

export interface FunnelElement {
  id: string;
  type: FunnelElementType;
  x: number;
  y: number;
  width: number;
  height: number;

  // Platform-specific
  platformKind?: PlatformKind;
  icon?: string;
  label?: string;
  description?: string;

  // Mockup-specific
  mockupKind?: MockupKind;
  mockupImageUrl?: string;
  mockupText?: string;
  mockupProfileImage?: string;
  mockupProfileName?: string;
  mockupBodyText?: string;
  mockupHeadline?: string;
  mockupDescription?: string;
  mockupCtaText?: string;
  mockupBrowserUrl?: string;

  // Text-specific
  textKind?: TextKind;
  textContent?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  textColor?: string;
  textAlign?: 'left' | 'center' | 'right';

  // Media-specific
  mediaUrl?: string;
  mediaAlt?: string;

  // Visual
  backgroundColor?: string;
  borderColor?: string;

  // Metrics
  metricLabel?: string;
  metricValue?: number;
  metricTarget?: number;

  // Notes / Comments
  notes?: string;
}

export interface FunnelConnection {
  id: string;
  from: string;
  to: string;
  fromPort: PortDirection;
  toPort: PortDirection;
  label?: string;
  lineStyle?: FunnelLineStyle;
  color?: string;
}

export interface FunnelPhase {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface FunnelBoard {
  id: string;
  name: string;
  description: string;
  linkedSystemId?: string;
  elements: FunnelElement[];
  connections: FunnelConnection[];
  phases: FunnelPhase[];
  createdAt: string;
  updatedAt: string;
}

export interface FunnelSnapshot {
  elements: FunnelElement[];
  connections: FunnelConnection[];
  phases: FunnelPhase[];
}

// ─── Defaults ────────────────────────────────────────────────────────────────

export const ELEMENT_DEFAULTS: Record<FunnelElementType, { width: number; height: number }> = {
  platform: { width: 200, height: 80 },
  mockup:   { width: 220, height: 420 },
  text:     { width: 260, height: 48 },
  media:    { width: 300, height: 200 },
};

export const MOCKUP_SIZES: Record<MockupKind, { width: number; height: number }> = {
  'mobile':        { width: 220, height: 420 },
  'desktop':       { width: 480, height: 320 },
  'tablet':        { width: 360, height: 280 },
  'social-post':   { width: 280, height: 320 },
  'ad-mockup':     { width: 280, height: 360 },
  'facebook-ad':   { width: 280, height: 380 },
  'instagram-ad':  { width: 260, height: 400 },
  'google-ad':     { width: 340, height: 160 },
  'linkedin-ad':   { width: 300, height: 360 },
  'linkedin-post': { width: 300, height: 340 },
  'tiktok-ad':     { width: 220, height: 400 },
};

// ─── Platform Registry ──────────────────────────────────────────────────────

export interface PlatformInfo {
  kind: PlatformKind;
  label: string;
  icon: string;
  color: string;
  category: string;
}

export const PLATFORMS: PlatformInfo[] = [
  // Werbung
  { kind: 'facebook-ads',   label: 'Facebook Ads',   icon: 'logo-meta',       color: '#0081FB', category: 'Werbung' },
  { kind: 'instagram-ads',  label: 'Instagram Ads',  icon: 'logo-instagram',  color: '#E4405F', category: 'Werbung' },
  { kind: 'google-ads',     label: 'Google Ads',     icon: 'logo-google-ads', color: '#4285F4', category: 'Werbung' },
  { kind: 'linkedin-ads',   label: 'LinkedIn Ads',   icon: 'logo-linkedin',   color: '#0A66C2', category: 'Werbung' },
  { kind: 'tiktok-ads',     label: 'TikTok Ads',     icon: 'logo-tiktok',     color: '#000000', category: 'Werbung' },
  { kind: 'youtube',        label: 'YouTube Ads',    icon: 'logo-youtube',    color: '#FF0000', category: 'Werbung' },
  // Touchpoints
  { kind: 'landingpage',    label: 'Landing Page',   icon: 'globe',           color: '#8b5cf6', category: 'Touchpoints' },
  { kind: 'website',        label: 'Website',        icon: 'globe',           color: '#6366f1', category: 'Touchpoints' },
  { kind: 'formular',       label: 'Formular',       icon: 'file-text',       color: '#f59e0b', category: 'Touchpoints' },
  { kind: 'kalender',       label: 'Kalender / Booking', icon: 'logo-calendly', color: '#006BFF', category: 'Touchpoints' },
  { kind: 'webinar',        label: 'Webinar',        icon: 'video',           color: '#7c3aed', category: 'Touchpoints' },
  // Backend
  { kind: 'crm',            label: 'CRM',            icon: 'logo-hubspot',    color: '#FF7A59', category: 'Backend' },
  { kind: 'email',          label: 'E-Mail',         icon: 'mail',            color: '#ef4444', category: 'Backend' },
  { kind: 'whatsapp-sms',   label: 'WhatsApp / SMS', icon: 'logo-whatsapp',   color: '#25D366', category: 'Backend' },
  { kind: 'checkout',       label: 'Checkout / Payment', icon: 'logo-stripe', color: '#635BFF', category: 'Backend' },
  { kind: 'seo',            label: 'SEO',            icon: 'search',          color: '#10b981', category: 'Backend' },
];
