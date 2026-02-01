/**
 * Landing Page Content Configuration
 * Brand: Flowstack Systems
 * Style: Dark theme with gold accents
 * Content: German - KI-Automatisierung für Agenturen & B2B-Dienstleister
 * Framework: Conversion-optimized
 */

// ============================================
// Section 1: Hero
// ============================================
export const siteConfig = {
  name: "Flowstack Systems",
  eyebrow: "Für Agenturen & B2B-Dienstleister",
  title: "Verdopple deine Gewinnmarge durch KI-Automatisierung",
  titleAccent: "– Done-for-You in 2-4 Wochen",
  tagline:
    "Das Flowstack-System ersetzt deine zeitfressenden Routineaufgaben durch KI-Workflows, die rund um die Uhr arbeiten – damit du skalierst, ohne für jeden neuen Kunden einen neuen Mitarbeiter zu brauchen.",
  bulletPoints: [
    "80% deiner manuellen Fulfillment-Arbeit läuft automatisch – ohne Krankmeldungen, ohne Urlaubsvertretung, ohne Motivationslöcher",
    "Deine Marge springt von 20% auf 40-50%, weil KI-Token Centbeträge kosten – nicht 4.500€ Monatsgehalt",
    "Du nimmst neue Kunden an, ohne zu rechnen ob du \"noch einen einstellen musst\"",
    "In 2-4 Wochen hast du ein laufendes System – komplett gebaut, nicht nur erklärt",
  ],
  cta: {
    text: "Jetzt kostenlose Prozess-Analyse sichern",
    href: "/kostenlose-beratung",
    isInternal: true,
  },
  ctaSubtext: "Done-for-You KI-Automation für Agenturen",
  available: true,
};

// ============================================
// Navigation Links
// ============================================
export const navLinks = [
  { label: "System", href: "#flowstack-system" },
  { label: "Fallstudien", href: "#case-studies" },
  { label: "Leistungen", href: "#services" },
  { label: "FAQ", href: "#faq" },
];

// ============================================
// Section 2: Trust Strip (Metriken)
// ============================================
export const trustMetrics = {
  metrics: [
    { value: "80%", label: "weniger Routinearbeit möglich" },
    { value: "2-4 Wochen", label: "bis dein System live ist" },
    { value: "30-50%", label: "mehr Marge durch Automation" },
    { value: "0", label: "zusätzliche Mitarbeiter nötig" },
  ],
};

export const tools = [
  { name: "Make", logo: "https://cdn.simpleicons.org/make" },
  { name: "Airtable", logo: "https://cdn.simpleicons.org/airtable" },
  { name: "Notion", logo: "https://cdn.simpleicons.org/notion" },
  { name: "Slack", logo: "https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png" },
  { name: "Zapier", logo: "https://cdn.simpleicons.org/zapier" },
  { name: "HubSpot", logo: "https://cdn.simpleicons.org/hubspot" },
  { name: "OpenAI", logo: "https://cdn.simpleicons.org/openai" },
  { name: "n8n", logo: "https://cdn.simpleicons.org/n8n" },
];

// ============================================
// Section 3: Empathy Opening
// ============================================
export const empathyOpening = {
  headline: "Du arbeitest härter als je zuvor – und trotzdem bleibt am Monatsende nicht mehr übrig?",
  paragraphs: [
    "Es liegt nicht an dir.",
    "Du hast alles richtig gemacht: Kunden gewonnen, ein Team aufgebaut, Prozesse etabliert. Aber niemand hat dir gesagt, dass \"mehr Kunden = mehr Mitarbeiter = gleiche Marge\" eine Sackgasse ist.",
  ],
  painPoints: [
    "Die endlosen Slack-Nachrichten, die dich ständig aus dem Fokus reißen",
    "Mitarbeiter, die für Routine-Aufgaben viel zu lange brauchen",
    "Das Gefühl, selbst der größte Engpass im eigenen Unternehmen zu sein",
    "Die Frage: \"Wann arbeite ich endlich AM statt IM Business?\"",
  ],
  empathy: "DU BIST NICHT ALLEIN.",
  closing: "47+ Agenturinhaber standen genau da, wo du jetzt stehst. Sie haben einen anderen Weg gefunden.\n\nUnd du kannst das auch.",
};

// ============================================
// Section 4: Problem Mirror (6 Störfaktoren)
// ============================================
export const problemSection = {
  headline: "Welcher dieser 6 Engpässe bremst dein Wachstum?",
  subheadline: "Was wäre, wenn dein stagnierendes Wachstum nicht an dir liegt – sondern an einem dieser Störfaktoren, die deine Skalierung sabotieren?",
  problems: [
    {
      icon: "TrendingDown",
      label: "STÖRFAKTOR 1",
      title: "Deine Marge schrumpft mit jedem neuen Kunden",
      description: "Mehr Umsatz, aber nicht mehr Gewinn? Jeder neue Kunde bedeutet: neuer Mitarbeiter. Deine Marge bleibt bei 15-25% – egal wie viel du umsetzt.",
    },
    {
      icon: "User",
      label: "STÖRFAKTOR 2",
      title: "Du bist der Flaschenhals",
      description: "Ohne dich läuft nichts. Jede Entscheidung, jede Freigabe, jedes Problem landet auf deinem Tisch. Urlaub? Nur mit Laptop.",
    },
    {
      icon: "Clock",
      label: "STÖRFAKTOR 3",
      title: "Dein Team ertrinkt in Routinearbeit",
      description: "Deine besten Leute verbringen 60% ihrer Zeit mit Copy-Paste, Datenübertragung und Kleinkram – statt mit dem, wofür du sie eingestellt hast.",
    },
    {
      icon: "Layers",
      label: "STÖRFAKTOR 4",
      title: "Tool-Chaos frisst Zeit",
      description: "12 Tools, die nicht miteinander sprechen. Daten manuell hin- und herkopieren. Fehler durch Medienbrüche. Jeden. Einzelnen. Tag.",
    },
    {
      icon: "AlertTriangle",
      label: "STÖRFAKTOR 5",
      title: "Qualität schwankt mit der Tagesform",
      description: "Montags liefert Team-Mitglied A perfekt. Dienstags macht B den gleichen Job – halb so gut. Kein Standard, keine Konstanz.",
    },
    {
      icon: "XCircle",
      label: "STÖRFAKTOR 6",
      title: "Du lehnst Neukunden ab",
      description: "Die Anfragen sind da. Aber du weißt: Mehr Kunden = mehr Chaos. Also sagst du ab – und lässt Umsatz auf der Straße liegen.",
    },
  ],
  conclusion: "Wenn du dich in 2 oder mehr dieser Punkte wiedererkennst, dann ist es Zeit für ein System-Upgrade.",
};

// ============================================
// Section 5: Solution Preview (NEU)
// ============================================
export const solutionPreview = {
  headline: "Stell dir vor, das wäre ab nächsten Monat deine Realität:",
  benefits: [
    {
      icon: "DollarSign",
      title: "DOPPELTE MARGE – BEI GLEICHEM UMSATZ",
      description: "Deine Gewinnmarge springt von 20% auf 40-50%+, weil KI-Workflows für Centbeträge arbeiten, nicht für Gehälter. Bei 100k Umsatz sind das 20-30k mehr Gewinn – jeden Monat.",
    },
    {
      icon: "Zap",
      title: "DEIN TEAM ARBEITET NUR NOCH AN DEM, WAS ZÄHLT",
      description: "80% der Routinearbeit läuft automatisch. Deine Leute konzentrieren sich auf Strategie, Kundenbeziehungen und kreative Arbeit – statt auf Copy-Paste und Datenpflege.",
    },
    {
      icon: "TrendingUp",
      title: "SKALIERUNG OHNE PROPORTIONAL MEHR PERSONAL",
      description: "Nimm 50% mehr Kunden an, ohne 50% mehr Leute einzustellen. Das Flowstack-System wächst mit – deine Personalkosten nicht.",
    },
  ],
  closing: "Das ist keine Zukunftsmusik. Das passiert, wenn das Flowstack-System in deiner Agentur läuft.",
};

// ============================================
// Section 6: Flowstack System (4 Stufen)
// ============================================
export const flowstackSystem = {
  headline: "Das Flowstack-System: Dein Weg zu 50%+ Marge in 4 klaren Stufen",
  subheadline: "Wir implementieren KI-Workflows, die deine Routineprozesse automatisieren – Done-for-You, schlüsselfertig, in 2-4 Wochen live.",
  stages: [
    {
      number: "1",
      icon: "Search",
      title: "ANALYSE",
      subtitle: "Prozess-Röntgen & ROI-Mapping",
      duration: "Woche 1",
      description: "Wir durchleuchten jeden deiner Workflows und finden die Goldadern:",
      items: [
        "Deep-Dive Audit aller operativen Prozesse",
        "Identifikation der größten Zeit- und Kostenfresser",
        "ROI-Priorisierung: Welche Automation bringt den größten Hebel?",
        "Technische Analyse deiner Tool-Landschaft",
      ],
      result: "Eine klare Roadmap mit den 3-5 Prozessen, die wir zuerst automatisieren – priorisiert nach Impact.",
    },
    {
      number: "2",
      icon: "PenTool",
      title: "ARCHITEKTUR",
      subtitle: "System-Design & Workflow-Blueprints",
      duration: "Woche 1-2",
      description: "Wir designen dein individuelles Automatisierungs-System:",
      items: [
        "Maßgeschneiderte Workflow-Architektur",
        "Auswahl der optimalen KI-Tools und Integrationen",
        "Design der Kontrollpunkte (Human-in-the-Loop)",
        "Technische Spezifikation für nahtlose Implementation",
      ],
      result: "Fertige Blueprints für jeden Workflow – abgestimmt auf deine Tools und dein Team.",
    },
    {
      number: "3",
      icon: "Rocket",
      title: "AUTOMATION",
      subtitle: "KI-Integration & Go-Live",
      duration: "Woche 2-4",
      description: "Jetzt wird gebaut – wir machen das, du lehnst dich zurück:",
      items: [
        "Komplette technische Implementierung (n8n, Make, APIs)",
        "KI-Prompt-Engineering für deine spezifischen Use Cases",
        "Integration in deine bestehenden Tools",
        "Testing und Feinabstimmung unter realen Bedingungen",
      ],
      result: "Ein live-geschaltetes System, das ab Tag 1 Arbeit abnimmt. Nicht in 6 Monaten – jetzt.",
    },
    {
      number: "4",
      icon: "TrendingUp",
      title: "SKALIERUNG",
      subtitle: "Optimierung & Erweiterung",
      duration: "Ongoing",
      description: "Wir lassen dich nicht alleine:",
      items: [
        "Performance-Monitoring und kontinuierliche Optimierung",
        "Regelmäßige Check-ins und Support",
        "Erweiterung auf weitere Prozesse",
        "Strategische Beratung für nächste Automationen",
      ],
      result: "Ein System, das mit dir wächst und immer besser wird.",
    },
  ],
  closing: "Das Flowstack-System ist keine Software, die du selbst einrichten musst. Es ist eine Done-for-You Transformation deiner operativen Prozesse.",
};

// ============================================
// Section 7: Case Studies
// ============================================
export const caseStudiesSection = {
  headline: "Echte Ergebnisse von echten Agenturen:",
  headlineAccent: "",
  subheadline: "",
};

export interface CaseStudy {
  category: string;
  teamSize: string;
  problem: string;
  solution: string;
  results: {
    value: string;
    label: string;
  }[];
  quote: string;
  author: {
    role: string;
    name?: string;
    title?: string;
    company?: string;
    image?: string;
  };
  // Legacy properties for backward compatibility
  title?: string;
  challenge?: string;
  videoThumbnail?: string;
  metrics?: { value: string; label: string }[];
}

export const caseStudies: CaseStudy[] = [
  {
    category: "SOCIAL-MEDIA-AGENTUR",
    teamSize: "8 Mitarbeiter",
    problem: "\"Wir haben 30+ Kunden betreut und für jeden manuell Reports erstellt, Content eingeplant und Ads hochgeladen. 2 Vollzeit-Leute nur für Routine.\"",
    solution: "Automatisiertes Reporting, KI-Content-Planung, Auto-Upload mit Freigabe-Workflow",
    results: [
      { value: "73%", label: "weniger Zeitaufwand" },
      { value: "1.5", label: "Mitarbeiter umgeschichtet" },
      { value: "18% → 41%", label: "Margen-Steigerung" },
    ],
    quote: "\"Wir betreuen jetzt 45 Kunden mit weniger Aufwand als vorher bei 30.\"",
    author: { role: "— Geschäftsführer", name: "Max M.", title: "Geschäftsführer", company: "Social Media Agentur", image: "https://via.placeholder.com/80x80?text=MM" },
    title: "73% weniger Zeitaufwand",
    challenge: "30+ Kunden mit manuellen Reports betreut",
    videoThumbnail: "https://via.placeholder.com/640x360?text=Case+Study",
    metrics: [{ value: "73%", label: "weniger Zeitaufwand" }, { value: "41%", label: "Marge" }],
  },
  {
    category: "RECRUITING-AGENTUR",
    teamSize: "12 Mitarbeiter",
    problem: "\"Unser Kunden-Onboarding dauerte 10 Tage. Briefings aufnehmen, Stellenanzeigen schreiben, Kampagnen aufsetzen – alles manuell.\"",
    solution: "KI-generierte Stellenanzeigen aus Briefing, automatisiertes Kampagnen-Setup, Self-Service Portal für Kunden",
    results: [
      { value: "48h", label: "statt 10 Tage Onboarding" },
      { value: "3x", label: "mehr Kundenkapazität" },
      { value: "22% → 47%", label: "Margen-Steigerung" },
    ],
    quote: "\"Der Game-Changer: Kunden sind in 2 Tagen live statt 2 Wochen.\"",
    author: { role: "— Inhaberin", name: "Sandra L.", title: "Inhaberin", company: "Recruiting Agentur", image: "https://via.placeholder.com/80x80?text=SL" },
    title: "Onboarding in 48h statt 10 Tagen",
    challenge: "Kunden-Onboarding dauerte 10 Tage",
    videoThumbnail: "https://via.placeholder.com/640x360?text=Case+Study",
    metrics: [{ value: "48h", label: "Onboarding" }, { value: "47%", label: "Marge" }],
  },
  {
    category: "PERFORMANCE-AGENTUR",
    teamSize: "6 Mitarbeiter",
    problem: "\"Projektmanagement war unser Albtraum. Ständig fehlten Infos, Kunden fragten nach Status, wir hatten keinen Überblick.\"",
    solution: "Automatische Status-Updates, KI-Meeting-Zusammenfassungen, intelligente Task-Zuweisung und Erinnerungen",
    results: [
      { value: "85%", label: "weniger Status-Rückfragen" },
      { value: "-35%", label: "Projektdauer" },
      { value: "+40%", label: "Kundenzufriedenheit" },
    ],
    quote: "\"Unsere Kunden fragen nicht mehr 'Wie ist der Stand?' – sie wissen es.\"",
    author: { role: "— Creative Director", name: "Tom R.", title: "Creative Director", company: "Performance Agentur", image: "https://via.placeholder.com/80x80?text=TR" },
    title: "85% weniger Status-Rückfragen",
    challenge: "Projektmanagement ohne Überblick",
    videoThumbnail: "https://via.placeholder.com/640x360?text=Case+Study",
    metrics: [{ value: "85%", label: "weniger Rückfragen" }, { value: "-35%", label: "Projektdauer" }],
  },
];

// ============================================
// Section 8: CTA Inline
// ============================================
export const ctaInline = {
  primary: {
    headline: "Bereit herauszufinden, wie viel Potenzial in deiner Agentur steckt?",
    text: "In einem kostenlosen 30-Minuten-Call analysieren wir:",
    bullets: [
      "Welche deiner Prozesse das größte Automatisierungs-Potenzial haben",
      "Wie viel Zeit und Geld du realistisch einsparen kannst",
      "Ob das Flowstack-System für deine Situation Sinn macht",
    ],
    closing: "Keine Verkaufsshow. Echter Mehrwert. Garantiert.",
    cta: "Jetzt kostenlose Prozess-Analyse buchen",
    subtext: "⏱️ Nur noch wenige Plätze für diesen Monat",
  },
  secondary: {
    headline: "Der beste Zeitpunkt war gestern. Der zweitbeste ist jetzt.",
    text: "In 30 Minuten weißt du:",
    bullets: [
      "Welche 3 Prozesse du zuerst automatisieren solltest",
      "Wie viel Marge realistisch drin ist",
      "Ob wir die Richtigen für dich sind",
    ],
    cta: "Jetzt Termin für Prozess-Analyse wählen",
    subtext: "Kostenlos. Unverbindlich. Ohne Verkaufsdruck.",
  },
};

// ============================================
// Section 9: Outcomes (Vorher/Nachher)
// ============================================
export const outcomes = {
  headline: "Das verändert sich, wenn das Flowstack-System läuft:",
  comparison: [
    {
      left: { icon: "TrendingUp", title: "Marge:", highlight: "40-60%+", subtitle: "Mehr Gewinn bei gleichem Umsatz" },
      right: { icon: "TrendingDown", title: "Marge:", highlight: "15-25%", subtitle: "Trotz harter Arbeit" }
    },
    {
      left: { icon: "Sparkles", title: "Team arbeitet an", highlight: "Wertschöpfung", subtitle: "Kreative und strategische Arbeit" },
      right: { icon: "RefreshCw", title: "Team arbeitet an", highlight: "Routine", subtitle: "Copy-Paste und Datenpflege" }
    },
    {
      left: { icon: "Eye", title: "Du:", highlight: "Stratege mit Überblick", subtitle: "Fokus auf Wachstum" },
      right: { icon: "Flame", title: "Du:", highlight: "Feuerwehrmann im Alltag", subtitle: "Ständig Brände löschen" }
    },
    {
      left: { icon: "TrendingUp", title: "Mehr Kunden =", highlight: "mehr Gewinn", subtitle: "Skalierung ohne Mehrkosten" },
      right: { icon: "Users", title: "Mehr Kunden =", highlight: "mehr Personal", subtitle: "Kosten steigen linear" }
    },
    {
      left: { icon: "Coins", title: "", highlight: "50-200€/Monat", subtitle: "für KI-Tools" },
      right: { icon: "Banknote", title: "", highlight: "4.500€/Monat", subtitle: "pro Mitarbeiter" }
    },
    {
      left: { icon: "Shield", title: "", highlight: "Konstante Premium-Qualität", subtitle: "Keine Schwankungen" },
      right: { icon: "AlertTriangle", title: "Qualität", highlight: "schwankt", subtitle: "Abhängig von Tagesform" }
    },
    {
      left: { icon: "Rocket", title: "Skalierung macht", highlight: "Spaß", subtitle: "Wachstum mit System" },
      right: { icon: "AlertCircle", title: "Skalierung macht", highlight: "Angst", subtitle: "Mehr Chaos bei Wachstum" }
    },
  ],
  stats: {
    headline: "Was KI-Automation für Agenturen verändert:",
    items: [
      "Routineaufgaben, die heute 20+ Stunden pro Woche fressen? Laufen im Hintergrund – ohne menschliches Zutun.",
      "Die Marge, die bei 20% feststeckt? Springt auf 40-50%, weil KI für Centbeträge arbeitet, nicht für Gehälter.",
      "Das Gefühl, bei jedem neuen Kunden \"noch einen einstellen\" zu müssen? Verschwindet. Dein System wächst mit – dein Team muss es nicht.",
      "Die Zeit, die du in Mikromanagement verbrennst? Zurück bei dir. Für Strategie. Für Akquise. Für das, was nur du kannst.",
    ],
  },
};

// ============================================
// Section 10: Target Audience
// ============================================
export const targetAudience = {
  headline: "Das Flowstack-System ist nicht für jeden.",
  subheadline: "Wir arbeiten nur mit Agenturen, die diese Voraussetzungen erfüllen:",
  requirements: [
    "Du bist Inhaber einer Agentur oder B2B-Dienstleistung",
    "Dein Monatsumsatz liegt bei 15.000€ oder mehr",
    "Du hast wiederkehrende Prozesse, die sich wiederholen",
    "Du willst wachsen, ohne proportional mehr Personal einzustellen",
    "Du bist bereit, in Systeme zu investieren statt nur in mehr Köpfe",
    "Du verstehst: Gute Systeme kosten Geld – schlechte kosten mehr",
  ],
  notFor: {
    headline: "Das Flowstack-System ist NICHT das Richtige für dich, wenn:",
    items: [
      "Du unter 10.000€ Monatsumsatz machst (zu früh für Automation)",
      "Jedes Projekt bei dir 100% individuell ist (kein Prozess = keine Automation)",
      "Du nur ein günstiges DIY-Tool suchst (wir sind Done-for-You)",
      "Du in 2 Wochen Wunder erwartest (echte Transformation braucht 2-4 Wochen)",
    ],
  },
  cta: {
    text: "Du erfüllst die Voraussetzungen? Dann lass uns herausfinden, wie viel Potenzial in deiner Agentur steckt.",
    button: "Jetzt Potenzial-Check starten",
  },
};

// ============================================
// Section 11: Services
// ============================================
export const services = {
  headline: "Was im Flowstack-System enthalten ist:",
  items: [
    {
      icon: "Search",
      title: "PROZESS-AUDIT & STRATEGIE",
      items: [
        "Vollständiges Audit aller Workflows",
        "Engpass-Identifikation & ROI-Priorisierung",
        "Strategische Automatisierungs-Roadmap",
        "Tool-Stack-Analyse und Empfehlungen",
      ],
    },
    {
      icon: "PenTool",
      title: "WORKFLOW-DESIGN & BLUEPRINTS",
      items: [
        "Individuelle Workflow-Architektur",
        "KI-Prompt-Engineering für deine Use Cases",
        "Integration-Spezifikationen",
        "Dokumentation & SOPs",
      ],
    },
    {
      icon: "Code",
      title: "DONE-FOR-YOU IMPLEMENTATION",
      items: [
        "Komplette technische Umsetzung",
        "n8n/Make Workflow-Entwicklung",
        "KI-Integration (ChatGPT, Claude, etc.)",
        "API-Anbindungen & Tool-Verknüpfungen",
      ],
    },
    {
      icon: "Rocket",
      title: "GO-LIVE & FEINABSTIMMUNG",
      items: [
        "Testing unter realen Bedingungen",
        "Team-Einweisung & Übergabe",
        "14 Tage Feinabstimmung nach Go-Live",
        "Performance-Dashboard",
      ],
    },
    {
      icon: "Headphones",
      title: "ONGOING SUPPORT (OPTIONAL)",
      items: [
        "Regelmäßige Check-in Calls",
        "Priorisierter Support bei Fragen",
        "Kontinuierliche Workflow-Optimierung",
        "Erweiterung auf neue Prozesse",
      ],
    },
  ],
};

// ============================================
// Section 12: Timeline
// ============================================
export const timeline = {
  headline: "So läuft die Zusammenarbeit ab:",
  steps: [
    {
      icon: "Phone",
      title: "Kostenlose Prozess-Analyse (30 Min)",
      description: "Wir schauen gemeinsam auf deine Situation und identifizieren deine größten Automatisierungs-Hebel. Kein Pitch – echter Mehrwert.",
    },
    {
      icon: "Target",
      title: "Strategie-Session (bei Match)",
      description: "Wenn es passt, gehen wir tiefer: 60-90 Minuten Deep-Dive in deine Prozesse. Du erhältst eine konkrete Roadmap.",
    },
    {
      icon: "FileText",
      title: "Angebot & Kick-Off",
      description: "Individuelles Angebot basierend auf deinem Scope. Bei Zusage: Sofortiger Projektstart.",
    },
    {
      icon: "Rocket",
      title: "Implementation (2-4 Wochen)",
      description: "Wir bauen dein Flowstack-System. Du gibst Feedback. Wir iterieren. Du lehnst dich zurück.",
    },
    {
      icon: "TrendingUp",
      title: "Go-Live & Skalierung",
      description: "Dein System geht live. Wir optimieren. Du genießt die neue Freiheit.",
    },
  ],
};

// ============================================
// Section 13: Team
// ============================================
export const teamContent = {
  headline: "Wir bauen Systeme. Keine Luftschlösser.",
  intro: "Flowstack ist keine Beratung, die dir sagt was du tun sollst – und dich dann alleine lässt.\n\nWir sind Praktiker. Wir haben selbst Agenturen geführt, im Chaos gesteckt, die gleichen Fehler gemacht. Der Unterschied: Wir haben einen Weg raus gefunden.\n\nJetzt bauen wir diesen Weg für andere.\n\nDone-for-You bedeutet bei uns: Du gibst uns Zugang zu deinen Prozessen. Wir kommen in 2-4 Wochen mit einem funktionierenden System zurück. Fertig.",
  members: [
    {
      name: "Claudio Di Franco",
      role: "Gründer & Systemarchitekt",
      image: "/claudio.jpg",
      description: "→ Selbst Agentur aufgebaut und skaliert\n→ Hat den \"Mehr Kunden = Mehr Chaos\"-Albtraum am eigenen Leib erlebt\n→ Spezialisiert auf Prozessanalyse und Workflow-Architektur\n→ Baut Systeme, die ohne ihn funktionieren – genau wie deins funktionieren wird",
    },
    {
      name: "Anak Wannaphaschaiyong",
      role: "Automation & AI Engineer",
      image: "/anak.jpg",
      description: "→ Master in Machine Learning & Deep Learning (Florida Atlantic University)\n→ AWS-Architekt: Kinesis, Lambda, DynamoDB, S3, API Gateway, Terraform\n→ Hat Cloud-basierte Streaming-Plattform für COVID-19 Datenerfassung gebaut\n→ Publizierter Forscher im Bereich KI\n→ Python, n8n, Make, MLOps – baut Systeme die unter Last performen",
    },
  ],
};

// ============================================
// Section 14: Final CTA
// ============================================
export const finalCta = {
  headline: "Bereit für eine Agentur, die für dich arbeitet – statt umgekehrt?",
  subheadline: "Sichere dir jetzt deine kostenlose Prozess-Analyse und erfahre, wie viel Potenzial in deiner Agentur steckt.",
  description: "",
  bullets: [
    "30-Minuten-Call mit einem Flowstack-Experten",
    "Analyse deiner 3 größten Automatisierungs-Hebel",
    "Konkrete Einschätzung deiner möglichen Marge",
    "Ehrliche Antwort, ob wir dir helfen können",
  ],
  cta: {
    text: "Jetzt kostenlose Prozess-Analyse sichern",
    href: "/kostenlose-beratung",
    isInternal: true,
  },
  trustElements: [
    "🔒 Kein Verkaufsgespräch – echte Analyse mit Mehrwert",
    "📞 Persönlicher Call mit einem Experten (kein Bot)",
    "⏱️ Nur 3-4 Plätze pro Woche verfügbar",
  ],
  riskReversals: [
    "Kostenlos und unverbindlich",
    "Sachliche Analyse",
    "Ergebnis unabhängig von Zusammenarbeit",
  ],
  trust: "Done-for-You in 2-4 Wochen",
};

// ============================================
// Section 15: FAQ
// ============================================
export interface FAQItem {
  question: string;
  answer: string;
}

export const faqItems: FAQItem[] = [
  {
    question: "Was kostet das Flowstack-System?",
    answer: "Das hängt von deinem Scope ab. Nach der kostenlosen Prozess-Analyse erstellen wir ein individuelles Angebot. Was wir sagen können: Die meisten Kunden erreichen den ROI innerhalb von 60-90 Tagen durch eingesparte Personalkosten und höhere Effizienz.",
  },
  {
    question: "Wie lange dauert die Implementation?",
    answer: "2-4 Wochen, abhängig vom Projektumfang. Kleinere Automationen können sogar schneller live gehen. Du siehst erste Ergebnisse oft schon nach wenigen Tagen.",
  },
  {
    question: "Muss ich technisch fit sein?",
    answer: "Nein. Wir machen alles Done-for-You. Du erklärst uns deine Prozesse, wir bauen die Automation. Null Technik-Skills erforderlich auf deiner Seite.",
  },
  {
    question: "Was wenn etwas nicht funktioniert?",
    answer: "Wir bieten 14 Tage Feinabstimmung nach Go-Live. Wenn ein Workflow nicht wie erwartet performt, optimieren wir ihn – ohne Zusatzkosten.",
  },
  {
    question: "Funktioniert das auch für meine Branche?",
    answer: "Wir haben Erfahrung mit Marketing-Agenturen, Recruiting-Agenturen, Webdesign-Studios, Performance-Agenturen, Beratungen und anderen B2B-Dienstleistern. Im Erstgespräch klären wir, ob deine Prozesse automatisierbar sind.",
  },
  {
    question: "Ersetzt das Flowstack-System meine Mitarbeiter?",
    answer: "Es befreit sie. KI-Workflows übernehmen die langweilige Routine, sodass deine Leute sich auf wertvolle Arbeit konzentrieren können. Die meisten unserer Kunden stellen nicht weniger ein – sie setzen ihre Leute smarter ein.",
  },
  {
    question: "Ich nutze schon Zapier/Make – was bringt mir das?",
    answer: "Super Basis! Das Flowstack-System hebt deine bestehenden Automationen auf das nächste Level: bessere Architektur, KI-Integration, professionelle Prompts und jemand, der das Ganze strategisch durchdenkt.",
  },
  {
    question: "Wie unterscheidet ihr euch von anderen Anbietern?",
    answer: "Drei Dinge: (1) Wir machen Done-for-You, nicht DIY-Kurse. (2) Wir kommen aus dem Agentur-Business, verstehen deine Welt. (3) Wir liefern in 2-4 Wochen, nicht in 6 Monaten.",
  },
];

// ============================================
// Footer
// ============================================
export const footerLinks = {
  social: [
    { label: "LinkedIn", href: "https://linkedin.com", icon: "Linkedin" },
  ],
  legal: [
    { label: "Datenschutz", href: "/datenschutz" },
    { label: "Impressum", href: "/impressum" },
  ],
};

// ============================================
// Meta / SEO
// ============================================
export const metaContent = {
  title: "KI-Automatisierung für Agenturen | Done-for-You in 2-4 Wochen | Flowstack Systems",
  description: "Verdopple deine Gewinnmarge durch KI-Automatisierung. Das Flowstack-System ersetzt zeitfressende Routineaufgaben – Done-for-You, schlüsselfertig. ✓ 80% weniger Routinearbeit ✓ 30-50% mehr Marge ✓ 2-4 Wochen bis Go-Live",
};

// ============================================
// Legacy exports for backward compatibility
// ============================================
export const emotionalReframe = {
  headline: empathyOpening.headline,
  subheadline: "",
  content: empathyOpening.paragraphs.join("\n\n"),
};
export const problemMirror = problemSection;
export const differentiator = flowstackSystem;
export const benefits = {
  headline: outcomes.headline,
  items: outcomes.comparison.map((c) => ({
    icon: "Check",
    title: `${c.left.title} ${c.left.highlight}`,
    description: `Statt: ${c.right.title} ${c.right.highlight}`,
    metric: "",
  })),
};
export const comparison = {
  headline: "Das verändert sich, wenn das Flowstack-System läuft:",
  before: { title: "Manuell", items: outcomes.comparison.map(c => `${c.right.title} ${c.right.highlight}`) },
  after: { title: "Mit Flowstack", items: outcomes.comparison.map(c => `${c.left.title} ${c.left.highlight}`) },
};
export const processSteps = timeline.steps.map((s, idx) => ({
  step: String(idx + 1).padStart(2, '0'),
  title: s.title,
  subtitle: "",
  description: s.description,
  items: [] as string[],
}));
export const testimonials = caseStudies;

// Additional legacy exports
export const aboutContent = {
  title: "Über",
  description: teamContent.intro,
  stats: trustMetrics.metrics,
};

export const expertContent = {
  label: "Wer hinter Flowstack Systems steht",
  headline: teamContent.members[0].name,
  name: teamContent.members[0].name,
  experience: "Ex-Agenturinhaber",
  image: teamContent.members[0].image,
  paragraphs: teamContent.intro.split("\n\n"),
  credentials: trustMetrics.metrics,
};

export const consequences = {
  headline: "Die Kosten des Abwartens",
  subheadline: "",
  items: ["Verlorene Marge", "Gebundene Zeit", "Verpasste Chancen"],
  costPerDay: {
    headline: "",
    items: [] as { metric: string; description: string }[],
  },
};

export const roiSection = {
  headline: "Skalierung ist eine strukturelle Entscheidung.",
  subheadline: "",
  items: [] as { metric: string; cost: string }[],
};

export const relief = {
  headline: "Was wegfällt",
  items: [
    "Manuelle Übergaben zwischen Abteilungen",
    "Wiederkehrende Rückfragen zu identischen Themen",
    "Individuelle Sonderlösungen für Standardprozesse",
    "Abhängigkeit von einzelnen Schlüsselpersonen",
    "Operatives Nacharbeiten durch unsaubere Abläufe",
    "Wachstum mit steigender Unsicherheit",
  ],
};

export const falseSolutions = {
  headline: "Diese Lösungen funktionieren nicht.",
  subheadline: "",
  solutions: [] as { title: string; icon: string; problem: string }[],
  conclusion: "",
  transition: { headline: "", text: "" },
};
