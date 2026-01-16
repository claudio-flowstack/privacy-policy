/**
 * Landing Page Content Configuration
 * Style: jousefmurad.com (elegant dark theme with gold accents)
 * Content: German - B2B Process Architecture for Agencies
 * Framework: 14-section psychological conversion sequence
 */

// ============================================
// Section 1: Hero (Site Configuration)
// Psychology: Attention capture + Positioning
// ============================================
export const siteConfig = {
  name: "Jousef Murad",
  title: "Mehr Marge.",
  titleAccent: "Mehr Kapazität.", // Displayed in italic serif font
  tagline:
    "Skaliere durch KI-gestützte Prozessarchitektur – nicht durch mehr Personal.",
  cta: {
    text: "Kostenlose Analyse buchen",
    href: "https://calendly.com/your-link/30min",
  },
  available: true,
};

// ============================================
// Navigation Links
// ============================================
export const navLinks = [
  { label: "Leistungen", href: "#services" },
  { label: "Prozess", href: "#process" },
  { label: "Referenzen", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
];

// ============================================
// Section 2: Trust Strip
// Psychology: Credibility anchor with specific numbers
// ============================================
export const trustMetrics = {
  headline: "Vertrauen durch Ergebnisse",
  metrics: [
    { value: "100+", label: "implementierte KI- und Automationssysteme" },
    { value: "50.000+", label: "eingesparte Arbeitsstunden" },
    { value: "3x", label: "durchschnittliche Kapazitätssteigerung" },
  ],
};

export const clientLogos = [
  { name: "Company 1", logo: "https://via.placeholder.com/150x50?text=Logo+1" },
  { name: "Company 2", logo: "https://via.placeholder.com/150x50?text=Logo+2" },
  { name: "Company 3", logo: "https://via.placeholder.com/150x50?text=Logo+3" },
  { name: "Company 4", logo: "https://via.placeholder.com/150x50?text=Logo+4" },
  { name: "Company 5", logo: "https://via.placeholder.com/150x50?text=Logo+5" },
  { name: "Company 6", logo: "https://via.placeholder.com/150x50?text=Logo+6" },
];

// ============================================
// Section 3: Emotional Reframe
// Psychology: Remove self-blame, create safety
// ============================================
export const emotionalReframe = {
  headline: "Es liegt nicht an dir.",
  subheadline: "Das Wachstumsparadox ist real.",
  content: `Du hast härter gearbeitet als alle anderen. Ein echtes Unternehmen aufgebaut.
Und trotzdem: Jeder neue Kunde bringt mehr Chaos statt mehr Marge.

Das Problem ist nicht dein Einsatz – sondern dass Wachstum ohne Architektur
Komplexität erzeugt, die sich mit jedem neuen Mitarbeiter, Tool und Prozess potenziert.

Alle Entscheidungen und Übergaben ruhen noch immer auf deinen Schultern.`,
};

// ============================================
// Section 4: Problem Mirror
// Psychology: Recognition ("Das bin ich!")
// ============================================
export const problemMirror = {
  headline: "Kommt dir das bekannt vor?",
  problems: [
    {
      title: "Engpass-Abhängigkeit",
      description: "Jede Entscheidung und Übergabe geht noch durch dich",
      icon: "UserX",
    },
    {
      title: "Margenfresser",
      description: "Koordinationsaufwand frisst die Marge trotz steigendem Umsatz",
      icon: "TrendingDown",
    },
    {
      title: "Unvorhersehbare Lieferung",
      description: "Qualität hängt davon ab, wer gerade arbeitet",
      icon: "AlertTriangle",
    },
    {
      title: "Dauerhaftes Feuerlöschen",
      description: "Keine Zeit für Strategie, weil du ständig Brände löschst",
      icon: "Flame",
    },
    {
      title: "Daten-Chaos",
      description: "Informationen verstreut über 12 verschiedene Tools",
      icon: "Database",
    },
    {
      title: "Komplexitätsspirale",
      description: "Jedes Wachstum erhöht die Komplexität statt sie zu reduzieren",
      icon: "RefreshCw",
    },
  ],
};

// ============================================
// Section 5: Consequences
// Psychology: Cost of inaction (loss aversion)
// ============================================
export const consequences = {
  headline: "Was passiert, wenn sich nichts ändert?",
  subheadline: "Wachstum ohne Architektur = kontrollierter Kontrollverlust",
  items: [
    "Jede neue Maßnahme wird zum Risiko",
    "Deine besten Leute brennen aus – oder gehen",
    "Wettbewerber mit besseren Systemen überholen dich",
    "Jeder neue Mitarbeiter erhöht die Komplexität, nicht die Kapazität",
  ],
  costPerDay: {
    headline: "Die Kosten des Wartens",
    items: [
      { metric: "2+ Stunden", description: "täglich verloren durch Koordinationsaufwand" },
      { metric: "500€+", description: "Margenverlust pro Tag" },
      { metric: "1 Tag", description: "näher am Burnout deiner Schlüsselpersonen" },
    ],
  },
};

// ============================================
// Section 6: False Solutions
// Psychology: Disqualify what they've already tried
// ============================================
export const falseSolutions = {
  headline: "Was nicht funktioniert",
  subheadline: "Du hast wahrscheinlich schon versucht:",
  solutions: [
    {
      title: "Mehr Personal einstellen",
      problem: "Die Marge wird schlechter – Koordinationsaufwand skaliert mit Headcount",
      icon: "Users",
    },
    {
      title: "Weitere Tools hinzufügen",
      problem: "Komplexität steigt – Tools reden nicht miteinander",
      icon: "Puzzle",
    },
    {
      title: "Einzelne Automatisierungen",
      problem: "Neue Probleme entstehen – Automation ohne Architektur beschleunigt nur das Chaos",
      icon: "Zap",
    },
  ],
  conclusion: "Keins davon adressiert die Wurzel des Problems: fehlende Prozessarchitektur.",
};

// ============================================
// Section 7: Core Differentiator
// Psychology: Your unique insight/approach
// ============================================
export const differentiator = {
  headline: "Der Unterschied, der zählt",
  insight: {
    left: {
      title: "Automation",
      description: "führt Aufgaben aus",
    },
    right: {
      title: "Architektur",
      description: "definiert Abläufe, Verantwortlichkeiten, Ausnahmen, Eskalationen und Qualitätskontrolle",
    },
  },
  conclusion: `Ohne Architektur beschleunigt Automation nur das Chaos.

Wir bauen zuerst die Architektur – dann automatisieren wir.`,
  keyInsight: "Reaktives vs. geplantes Operieren: Der Unterschied zwischen Überleben und Skalieren.",
};

// ============================================
// Section 8: Outcomes
// Psychology: Tangible results they'll achieve
// ============================================
export const outcomes = {
  headline: "Was du erreichst",
  items: [
    {
      title: "Kapazität ohne Neueinstellungen",
      description: "3x mehr Output mit dem gleichen Team",
      icon: "TrendingUp",
    },
    {
      title: "Replizierbare Qualität",
      description: "Konsistente Ergebnisse – unabhängig davon, wer arbeitet",
      icon: "CheckCircle",
    },
    {
      title: "Bessere Margen",
      description: "15-25% Margensteigerung durch reduzierten Nacharbeitsaufwand",
      icon: "PiggyBank",
    },
    {
      title: "Strategische Zeit",
      description: "Endlich Zeit für Wachstum statt Feuerlöschen",
      icon: "Clock",
    },
  ],
};

// ============================================
// Section 9: Implementation Areas (Services)
// Psychology: Scope clarity
// ============================================
export interface Service {
  title: string;
  description: string;
  icon: string;
}

export const services: Service[] = [
  {
    title: "Vertriebsprozesse",
    description: "Von Lead bis Abschluss – durchgängig automatisiert und messbar",
    icon: "Target",
  },
  {
    title: "Projektabwicklung",
    description: "Standardisierte Fulfillment-Prozesse mit klaren Übergaben",
    icon: "FolderKanban",
  },
  {
    title: "Kundenkommunikation",
    description: "Automatisierte Touchpoints ohne Qualitätsverlust",
    icon: "MessageSquare",
  },
  {
    title: "Interne Übergaben",
    description: "Nahtlose Handoffs zwischen Teams und Abteilungen",
    icon: "ArrowLeftRight",
  },
  {
    title: "Reporting & Analytics",
    description: "Echtzeit-Einblicke statt Excel-Chaos",
    icon: "BarChart3",
  },
  {
    title: "KI-gestützte Aufgaben",
    description: "Intelligente Assistenz für wiederkehrende Entscheidungen",
    icon: "Bot",
  },
];

// ============================================
// Section 10: Process (3-Step Methodology)
// Psychology: Reduce uncertainty with simple steps
// ============================================
export interface ProcessStep {
  step: string;
  title: string;
  subtitle: string;
  description: string;
  duration?: string;
  items: string[];
}

export const processSteps: ProcessStep[] = [
  {
    step: "01",
    title: "Systemanalyse",
    subtitle: "VERSTEHEN",
    description:
      "Wir analysieren deine bestehenden Prozesse, identifizieren Engpässe und dokumentieren den Ist-Zustand. Keine Annahmen – nur Fakten.",
    duration: "KOSTENLOS",
    items: [
      "Prozess-Mapping deiner kritischen Abläufe",
      "Identifikation von Engpässen und Margenfressern",
      "Klarer Report mit Handlungsempfehlungen",
    ],
  },
  {
    step: "02",
    title: "Architektur-Entwicklung",
    subtitle: "DESIGNEN",
    description:
      "Wir entwickeln die Prozessarchitektur: Abläufe, Verantwortlichkeiten, Ausnahmen, Eskalationen. Das Fundament für skalierbare Automation.",
    duration: "1-2 WOCHEN",
    items: [
      "Prozessarchitektur-Blueprint",
      "Klare Verantwortlichkeiten und Eskalationspfade",
      "Technische Spezifikation für Implementation",
    ],
  },
  {
    step: "03",
    title: "Technische Umsetzung",
    subtitle: "BAUEN",
    description:
      "Wir implementieren die Systeme, schulen dein Team und stellen sicher, dass alles reibungslos läuft. Hands-on, nicht Hands-off.",
    duration: "4-8 WOCHEN",
    items: [
      "System-Setup und Konfiguration",
      "Team-Schulung und Dokumentation",
      "Laufende Optimierung und Support",
    ],
  },
];

// ============================================
// Section 11: Social Proof (Testimonials)
// Psychology: Proof it works for people like them
// ============================================
export interface Testimonial {
  companyLogo: string;
  quote: string;
  description: string;
  author: {
    name: string;
    title: string;
    image: string;
  };
}

export const testimonials: Testimonial[] = [
  {
    companyLogo: "https://via.placeholder.com/150x45?text=Agentur+A",
    quote: "Eine der wertvollsten Investitionen, die wir gemacht haben!",
    description:
      "Das Team hat unsere Ziele verstanden und in eine Prozessarchitektur übersetzt, die unsere Erwartungen übertroffen hat. Wir haben jetzt 3x mehr Kapazität – ohne einen einzigen neuen Mitarbeiter.",
    author: {
      name: "Thomas Müller",
      title: "Geschäftsführer, Agentur A",
      image: "https://via.placeholder.com/60x60?text=TM",
    },
  },
  {
    companyLogo: "https://via.placeholder.com/150x45?text=Beratung+B",
    quote: "Endlich ein Partner, der Prozesse versteht – nicht nur Tools verkauft!",
    description:
      "Wir hatten schon drei Automatisierungsprojekte, die gescheitert sind. Hier war es anders: Erst die Architektur, dann die Technik. Das Ergebnis spricht für sich.",
    author: {
      name: "Sandra Weber",
      title: "COO, Beratung B",
      image: "https://via.placeholder.com/60x60?text=SW",
    },
  },
  {
    companyLogo: "https://via.placeholder.com/150x45?text=Scale+Up+C",
    quote: "Von 60-Stunden-Wochen auf 40 – bei 40% mehr Umsatz.",
    description:
      "Die Prozessarchitektur hat nicht nur unsere Effizienz gesteigert, sondern auch meine Lebensqualität als Gründer. Ich kann endlich wieder strategisch arbeiten.",
    author: {
      name: "Markus Schmidt",
      title: "Gründer, Scale-Up C",
      image: "https://via.placeholder.com/60x60?text=MS",
    },
  },
];

// ============================================
// Section 12: ROI / Decision Urgency
// Psychology: Make the cost of waiting visible
// ============================================
export const roiSection = {
  headline: "Jeder Tag ohne System kostet dich",
  items: [
    { metric: "Jede manuelle Stunde", cost: "kostet Geld" },
    { metric: "Jeder Prozessbruch", cost: "kostet Fokus" },
    { metric: "Jede Eskalation", cost: "kostet Wachstum" },
  ],
  cta: {
    headline: "In 3 Monaten:",
    options: [
      "Gleiches Chaos, weniger Marge",
      "Oder: Systematische Skalierung ohne Neueinstellungen",
    ],
  },
};

// ============================================
// Section 13: FAQ
// Psychology: Objection handling
// ============================================
export interface FAQItem {
  question: string;
  answer: string;
}

export const faqItems: FAQItem[] = [
  {
    question: "Für wen ist das geeignet?",
    answer:
      "Für B2B-Unternehmen, Agenturen, Berater und Dienstleister, die zwischen 500K und 10M Umsatz machen und an Kapazitätsgrenzen stoßen. Besonders effektiv, wenn du merkst, dass Wachstum mehr Chaos statt mehr Marge bringt.",
  },
  {
    question: "Was unterscheidet euch von anderen Automatisierungsanbietern?",
    answer:
      "Wir verkaufen keine Tools – wir bauen Architektur. Die meisten Anbieter automatisieren bestehende (oft kaputte) Prozesse. Wir designen zuerst die richtige Struktur, dann automatisieren wir. Das ist der Unterschied zwischen schnellerem Chaos und echte Skalierung.",
  },
  {
    question: "Wie lange dauert ein typisches Projekt?",
    answer:
      "Die Systemanalyse ist kostenlos und dauert 1-2 Stunden. Die Architektur-Entwicklung 1-2 Wochen. Die technische Umsetzung 4-8 Wochen. Erste Ergebnisse siehst du oft schon nach 2-3 Wochen.",
  },
  {
    question: "Was kostet das?",
    answer:
      "Das hängt vom Scope ab. Die Systemanalyse ist kostenlos – danach hast du einen klaren Report mit ROI-Rechnung. Typische Projekte liegen zwischen 10K und 50K, amortisieren sich aber meist innerhalb von 2-3 Monaten durch eingesparte Koordinationskosten und verbesserte Margen.",
  },
  {
    question: "Was, wenn es nicht funktioniert?",
    answer:
      "In 8 Jahren und 100+ Projekten ist das noch nie passiert. Aber: Wenn wir in der kostenlosen Analyse sehen, dass Prozessarchitektur nicht die richtige Lösung für dein Problem ist, sagen wir dir das ehrlich. Wir arbeiten nur mit Unternehmen, bei denen wir sicher sind, Ergebnisse liefern zu können.",
  },
  {
    question: "Wie viel meiner Zeit braucht ihr?",
    answer:
      "Für die Analyse: 1-2 Stunden. Für die Architektur-Phase: ca. 2-3 Stunden pro Woche für Abstimmungen. Für die Umsetzung: minimal – wir machen die Arbeit, du gibst Feedback. Insgesamt deutlich weniger Zeit als du aktuell mit Feuerlöschen verbringst.",
  },
];

// ============================================
// Section 14: Final CTA
// Psychology: Clear, single action to close
// ============================================
export const finalCta = {
  headline: "Bereit für systematische Skalierung?",
  subheadline: "Unverbindliche Systemanalyse",
  description:
    "Wir analysieren deine Prozesse, identifizieren Engpässe und zeigen dir den Weg zu skalierbaren Systemen – ohne Verpflichtung.",
  cta: {
    text: "Kostenlose Analyse buchen",
    href: "https://calendly.com/your-link/30min",
  },
  trust: "30 Minuten. Kein Verkaufsgespräch. Nur Klarheit über deine nächsten Schritte.",
};

// ============================================
// Footer
// ============================================
export const footerLinks = {
  social: [
    { label: "LinkedIn", href: "https://linkedin.com", icon: "Linkedin" },
    { label: "Twitter", href: "https://twitter.com", icon: "Twitter" },
    { label: "YouTube", href: "https://youtube.com", icon: "Youtube" },
  ],
  legal: [
    { label: "Datenschutz", href: "/datenschutz" },
    { label: "AGB", href: "/agb" },
    { label: "Impressum", href: "/impressum" },
  ],
};

// ============================================
// About Section (kept for compatibility)
// ============================================
export const aboutContent = {
  title: "Über uns",
  description: `Mit über 8 Jahren Erfahrung in Prozessdesign, Automation und KI
    helfen wir Unternehmen, ihre Operationen zu transformieren.
    Unsere Mission: Dich von operativem Chaos befreien, damit du dich auf Wachstum konzentrieren kannst.`,
  stats: [
    { value: "100+", label: "Systeme implementiert" },
    { value: "50.000+", label: "Stunden eingespart" },
    { value: "3x", label: "Kapazitätssteigerung" },
    { value: "8+", label: "Jahre Erfahrung" },
  ],
};

// Legacy exports for backward compatibility
export const caseStudies = [];
