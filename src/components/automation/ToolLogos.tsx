/**
 * Tool Logos – Predefined SVG logos for popular tools/services
 * Usage: renderNodeIcon(node) returns the appropriate React element
 */

import React from 'react';
import { TikTok, GoogleAds, Instagram, Calendly, Stripe, YouTube, Typeform } from './FunnelLogos';

// ─── Inline SVG Logo Components ───────────────────────────────────────────────

const size = 20;

const GoogleDrive = () => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M8.01 18.26l-3.47-6L8.54 6h6.93l4 6-3.47 6.26H8.01z" fill="#4285F4" opacity={0.8}/>
    <path d="M1.07 18.26L4.54 12.26 8.54 6 15.47 6 8.01 18.26z" fill="#0F9D58" opacity={0.8}/>
    <path d="M15.47 6L8.54 6 12 12.26l3.47 6H22.93l-3.46-6L15.47 6z" fill="#FBBC04" opacity={0.8}/>
  </svg>
);

const Gmail = () => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="2" y="5" width="20" height="14" rx="2" fill="#EA4335" opacity={0.15}/>
    <path d="M2 7l10 6 10-6" stroke="#EA4335" strokeWidth="2" fill="none"/>
    <rect x="2" y="5" width="20" height="14" rx="2" stroke="#EA4335" strokeWidth="1.5" fill="none"/>
  </svg>
);

const GoogleSheets = () => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="4" y="2" width="16" height="20" rx="2" fill="#0F9D58" opacity={0.2}/>
    <rect x="4" y="2" width="16" height="20" rx="2" stroke="#0F9D58" strokeWidth="1.5" fill="none"/>
    <line x1="4" y1="9" x2="20" y2="9" stroke="#0F9D58" strokeWidth="1"/>
    <line x1="4" y1="14" x2="20" y2="14" stroke="#0F9D58" strokeWidth="1"/>
    <line x1="12" y1="5" x2="12" y2="19" stroke="#0F9D58" strokeWidth="1"/>
  </svg>
);

const GoogleDocs = () => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="4" y="2" width="16" height="20" rx="2" fill="#4285F4" opacity={0.15}/>
    <rect x="4" y="2" width="16" height="20" rx="2" stroke="#4285F4" strokeWidth="1.5" fill="none"/>
    <line x1="8" y1="8" x2="16" y2="8" stroke="#4285F4" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="8" y1="12" x2="16" y2="12" stroke="#4285F4" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="8" y1="16" x2="13" y2="16" stroke="#4285F4" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const GoogleCalendar = () => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="17" rx="2" fill="#4285F4" opacity={0.15}/>
    <rect x="3" y="4" width="18" height="17" rx="2" stroke="#4285F4" strokeWidth="1.5" fill="none"/>
    <line x1="3" y1="9" x2="21" y2="9" stroke="#4285F4" strokeWidth="1.5"/>
    <line x1="8" y1="2" x2="8" y2="6" stroke="#4285F4" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="16" y1="2" x2="16" y2="6" stroke="#4285F4" strokeWidth="1.5" strokeLinecap="round"/>
    <text x="12" y="17" textAnchor="middle" fill="#4285F4" fontSize="7" fontWeight="bold">31</text>
  </svg>
);

const Slack = () => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 15a2 2 0 01-2-2 2 2 0 012-2h2v2a2 2 0 01-2 2z" fill="#E01E5A"/>
    <path d="M9 15a2 2 0 002-2V6a2 2 0 10-4 0v7a2 2 0 002 2z" fill="#E01E5A"/>
    <path d="M9 6a2 2 0 012-2 2 2 0 012 2v2h-2a2 2 0 01-2-2z" fill="#36C5F0"/>
    <path d="M9 9a2 2 0 002 2h7a2 2 0 100-4h-7a2 2 0 00-2 2z" fill="#36C5F0"/>
    <path d="M18 9a2 2 0 012 2 2 2 0 01-2 2h-2v-2a2 2 0 012-2z" fill="#2EB67D"/>
    <path d="M15 9a2 2 0 00-2 2v7a2 2 0 104 0v-7a2 2 0 00-2-2z" fill="#2EB67D"/>
    <path d="M15 18a2 2 0 01-2 2 2 2 0 01-2-2v-2h2a2 2 0 012 2z" fill="#ECB22E"/>
    <path d="M15 15a2 2 0 00-2-2H6a2 2 0 100 4h7a2 2 0 002-2z" fill="#ECB22E"/>
  </svg>
);

const WhatsApp = () => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2C6.48 2 2 6.48 2 12c0 1.77.46 3.43 1.27 4.88L2 22l5.23-1.23C8.65 21.54 10.28 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" fill="#25D366" opacity={0.15}/>
    <path d="M12 2C6.48 2 2 6.48 2 12c0 1.77.46 3.43 1.27 4.88L2 22l5.23-1.23C8.65 21.54 10.28 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" stroke="#25D366" strokeWidth="1.5" fill="none"/>
    <path d="M8.5 10.5c.3.8 1 2 2.2 2.8 1.2.8 2 .9 2.5.7.3-.1.8-.6.9-1.1.1-.3-.1-.6-.3-.8l-1-.6c-.2-.1-.5 0-.7.2l-.3.4c-.1.1-.3.1-.5 0-.5-.3-1-.7-1.3-1.2-.1-.2-.1-.3.1-.5l.3-.3c.2-.2.2-.5.1-.7l-.6-1c-.2-.3-.5-.3-.7-.2-.5.2-.9.6-1 1.1-.1.5.1 1.2.3 1.2z" fill="#25D366"/>
  </svg>
);

const HubSpot = () => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="17" cy="8" r="2" stroke="#FF7A59" strokeWidth="1.5" fill="#FF7A59" opacity={0.2}/>
    <circle cx="12" cy="14" r="3.5" stroke="#FF7A59" strokeWidth="1.5" fill="#FF7A59" opacity={0.15}/>
    <circle cx="7" cy="9" r="2" stroke="#FF7A59" strokeWidth="1.5" fill="#FF7A59" opacity={0.2}/>
    <line x1="9" y1="10" x2="10" y2="12.5" stroke="#FF7A59" strokeWidth="1.5"/>
    <line x1="15" y1="9.5" x2="14" y2="12" stroke="#FF7A59" strokeWidth="1.5"/>
    <line x1="12" y1="17.5" x2="12" y2="20" stroke="#FF7A59" strokeWidth="1.5"/>
    <circle cx="12" cy="21" r="1" fill="#FF7A59"/>
  </svg>
);

const Salesforce = () => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M10 5c1.5-1.5 4-1.5 5.5 0s1.5 4 0 5.5c1.5.5 2.5 2 2.5 3.5 0 2.2-1.8 4-4 4H8c-2.8 0-5-2.2-5-5 0-2.2 1.4-4 3.4-4.6C6.2 7.2 7.8 5.5 10 5z" fill="#00A1E0" opacity={0.2}/>
    <path d="M10 5c1.5-1.5 4-1.5 5.5 0s1.5 4 0 5.5c1.5.5 2.5 2 2.5 3.5 0 2.2-1.8 4-4 4H8c-2.8 0-5-2.2-5-5 0-2.2 1.4-4 3.4-4.6C6.2 7.2 7.8 5.5 10 5z" stroke="#00A1E0" strokeWidth="1.5" fill="none"/>
  </svg>
);

const Make = () => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="#6D00CC" strokeWidth="1.5" fill="#6D00CC" opacity={0.12}/>
    <circle cx="8" cy="12" r="2" fill="#6D00CC" opacity={0.6}/>
    <circle cx="16" cy="12" r="2" fill="#6D00CC" opacity={0.6}/>
    <path d="M10 12h4" stroke="#6D00CC" strokeWidth="1.5"/>
  </svg>
);

const N8n = () => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="4" stroke="#EA4B71" strokeWidth="1.5" fill="#EA4B71" opacity={0.12}/>
    <text x="12" y="16" textAnchor="middle" fill="#EA4B71" fontSize="9" fontWeight="bold">n8n</text>
  </svg>
);

const Zapier = () => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="#FF4A00" strokeWidth="1.5" fill="#FF4A00" opacity={0.12}/>
    <path d="M12 6v12M6 12h12M8 8l8 8M16 8l-8 8" stroke="#FF4A00" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="2.5" fill="#FF4A00" opacity={0.3}/>
  </svg>
);

const OpenAI = () => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9z" fill="#10A37F" opacity={0.12}/>
    <path d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9z" stroke="#10A37F" strokeWidth="1.5" fill="none"/>
    <path d="M12 7v4l3 2" stroke="#10A37F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="1" fill="#10A37F"/>
  </svg>
);

const Claude = () => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="5" fill="#D97706" opacity={0.12}/>
    <rect x="3" y="3" width="18" height="18" rx="5" stroke="#D97706" strokeWidth="1.5" fill="none"/>
    <circle cx="9" cy="11" r="1.5" fill="#D97706"/>
    <circle cx="15" cy="11" r="1.5" fill="#D97706"/>
    <path d="M9 15.5c1 1 5 1 6 0" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const Notion = () => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="4" y="3" width="16" height="18" rx="2" stroke="#000" strokeWidth="1.5" fill="none" className="dark:stroke-white"/>
    <path d="M8 7h8M8 11h5M8 15h7" stroke="#000" strokeWidth="1.2" strokeLinecap="round" className="dark:stroke-white" opacity={0.5}/>
    <rect x="15" y="13" width="3" height="5" rx="0.5" fill="#000" className="dark:fill-white" opacity={0.2}/>
  </svg>
);

const Airtable = () => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4 8l8-4 8 4v2l-8 4-8-4V8z" fill="#18BFFF" opacity={0.3}/>
    <path d="M4 8l8-4 8 4-8 4-8-4z" stroke="#18BFFF" strokeWidth="1.5" fill="none"/>
    <path d="M4 12l8 4 8-4" stroke="#F82B60" strokeWidth="1.5" fill="none"/>
    <path d="M4 16l8 4 8-4" stroke="#FCBF00" strokeWidth="1.5" fill="none"/>
  </svg>
);

const LinkedIn = () => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="3" fill="#0A66C2" opacity={0.15}/>
    <rect x="3" y="3" width="18" height="18" rx="3" stroke="#0A66C2" strokeWidth="1.5" fill="none"/>
    <path d="M8 10v6M8 7.5v.01" stroke="#0A66C2" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 16v-4c0-1.1.9-2 2-2s2 .9 2 2v4" stroke="#0A66C2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Meta = () => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 12c0-3 1.5-6 3-6s2 2 3 4c1-2 1.5-4 3-4s3 3 3 6-1.5 6-3 6-2-2-3-4c-1 2-1.5 4-3 4s-3-3-3-6z" stroke="#0081FB" strokeWidth="1.5" fill="#0081FB" opacity={0.12}/>
  </svg>
);

const GitHub = () => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21.5c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12c0-5.52-4.48-10-10-10z" fill="currentColor" opacity={0.7}/>
  </svg>
);

const Jira = () => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12.005 2L2 12.005l4.998 4.998L12.005 22l10.005-10.005L17.003 7.003 12.005 2zm0 5.6l4.398 4.398-4.398 4.397-4.398-4.397L12.005 7.6z" fill="#2684FF" opacity={0.6}/>
  </svg>
);

// ─── Logo Registry ────────────────────────────────────────────────────────────

export interface ToolLogo {
  id: string;
  name: string;
  category: string;
  component: React.FC;
  color: string;
}

export const TOOL_LOGOS: Record<string, ToolLogo> = {
  'logo-google-drive':    { id: 'logo-google-drive',    name: 'Google Drive',    category: 'Google',        component: GoogleDrive,    color: '#4285F4' },
  'logo-gmail':           { id: 'logo-gmail',           name: 'Gmail',           category: 'Google',        component: Gmail,          color: '#EA4335' },
  'logo-google-sheets':   { id: 'logo-google-sheets',   name: 'Google Sheets',   category: 'Google',        component: GoogleSheets,   color: '#0F9D58' },
  'logo-google-docs':     { id: 'logo-google-docs',     name: 'Google Docs',     category: 'Google',        component: GoogleDocs,     color: '#4285F4' },
  'logo-google-calendar': { id: 'logo-google-calendar', name: 'Google Calendar', category: 'Google',        component: GoogleCalendar, color: '#4285F4' },
  'logo-slack':           { id: 'logo-slack',           name: 'Slack',           category: 'Communication', component: Slack,          color: '#4A154B' },
  'logo-whatsapp':        { id: 'logo-whatsapp',        name: 'WhatsApp',        category: 'Communication', component: WhatsApp,       color: '#25D366' },
  'logo-hubspot':         { id: 'logo-hubspot',         name: 'HubSpot',         category: 'CRM',           component: HubSpot,        color: '#FF7A59' },
  'logo-salesforce':      { id: 'logo-salesforce',      name: 'Salesforce',      category: 'CRM',           component: Salesforce,     color: '#00A1E0' },
  'logo-make':            { id: 'logo-make',            name: 'Make',            category: 'Automation',    component: Make,           color: '#6D00CC' },
  'logo-n8n':             { id: 'logo-n8n',             name: 'n8n',             category: 'Automation',    component: N8n,            color: '#EA4B71' },
  'logo-zapier':          { id: 'logo-zapier',          name: 'Zapier',          category: 'Automation',    component: Zapier,         color: '#FF4A00' },
  'logo-openai':          { id: 'logo-openai',          name: 'OpenAI',          category: 'AI',            component: OpenAI,         color: '#10A37F' },
  'logo-claude':          { id: 'logo-claude',          name: 'Claude',          category: 'AI',            component: Claude,         color: '#D97706' },
  'logo-notion':          { id: 'logo-notion',          name: 'Notion',          category: 'Productivity',  component: Notion,         color: '#000000' },
  'logo-airtable':        { id: 'logo-airtable',        name: 'Airtable',        category: 'Productivity',  component: Airtable,       color: '#18BFFF' },
  'logo-linkedin':        { id: 'logo-linkedin',        name: 'LinkedIn',        category: 'Social',        component: LinkedIn,       color: '#0A66C2' },
  'logo-meta':            { id: 'logo-meta',            name: 'Meta',            category: 'Social',        component: Meta,           color: '#0081FB' },
  'logo-github':          { id: 'logo-github',          name: 'GitHub',          category: 'Dev',           component: GitHub,         color: '#333333' },
  'logo-jira':            { id: 'logo-jira',            name: 'Jira',            category: 'Dev',           component: Jira,           color: '#2684FF' },
  // Funnel Visualizer logos
  'logo-tiktok':          { id: 'logo-tiktok',          name: 'TikTok',          category: 'Social',        component: TikTok,         color: '#000000' },
  'logo-google-ads':      { id: 'logo-google-ads',      name: 'Google Ads',      category: 'Ads',           component: GoogleAds,      color: '#4285F4' },
  'logo-instagram':       { id: 'logo-instagram',       name: 'Instagram',       category: 'Social',        component: Instagram,      color: '#E4405F' },
  'logo-calendly':        { id: 'logo-calendly',        name: 'Calendly',        category: 'Booking',       component: Calendly,       color: '#006BFF' },
  'logo-stripe':          { id: 'logo-stripe',          name: 'Stripe',          category: 'Payment',       component: Stripe,         color: '#635BFF' },
  'logo-youtube':         { id: 'logo-youtube',         name: 'YouTube',         category: 'Social',        component: YouTube,        color: '#FF0000' },
  'logo-typeform':        { id: 'logo-typeform',        name: 'Typeform',        category: 'Forms',         component: Typeform,       color: '#262627' },
};

// ─── Unified Icon Renderer ────────────────────────────────────────────────────

export function isToolLogo(icon: string): boolean {
  return icon.startsWith('logo-');
}

export function getToolLogo(icon: string): ToolLogo | undefined {
  return TOOL_LOGOS[icon];
}

export function getToolLogosByCategory(): Record<string, ToolLogo[]> {
  const categories: Record<string, ToolLogo[]> = {};
  Object.values(TOOL_LOGOS).forEach(logo => {
    if (!categories[logo.category]) categories[logo.category] = [];
    categories[logo.category].push(logo);
  });
  return categories;
}

/**
 * Renders the icon for a node.
 * Priority: logoUrl > logo- prefix > lucide icon key
 */
/**
 * Renders the icon for a node.
 * Priority: logoUrl > logo- prefix > lucide icon key
 * Dark mode: logos get slight brightness boost for better visibility.
 */
export function renderNodeIcon(
  icon: string,
  logoUrl?: string,
  fallbackIcon?: React.ReactNode,
  iconSize = 20,
): React.ReactNode {
  // Custom URL
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt="Logo"
        className="rounded object-contain dark:brightness-110"
        style={{ width: iconSize, height: iconSize }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
    );
  }

  // Tool logo — wrapped with dark-mode brightness adjustment
  const logo = TOOL_LOGOS[icon];
  if (logo) {
    const Logo = logo.component;
    return <span className="inline-flex dark:brightness-110"><Logo /></span>;
  }

  // Fallback to lucide icon or default
  return fallbackIcon || null;
}
