/**
 * ApplePage - Ultra Premium Landing Page
 * Insane animations, Apple-level design, mind-blowing effects
 */

import { Link } from "react-router-dom";
import { useState, useEffect, useRef, ReactNode } from "react";
import { ArrowRight, Check, X, ChevronDown, Zap } from "lucide-react";
import { siteConfig, faqItems, teamContent } from "@/config/content";

// ============================================
// HOOKS & UTILITIES
// ============================================
const useScrollAnimation = (threshold = 0.1) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
        setScrollProgress(entry.intersectionRatio);
      },
      { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible, scrollProgress };
};

// Parallax hook available for future use
// const useParallax = (speed = 0.5) => { ... };

// ============================================
// ANIMATED COMPONENTS
// ============================================
const AnimatedSection = ({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) => {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div
      ref={ref}
      className={`${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0) scale(1)" : "translateY(80px) scale(0.95)",
        transition: `all 1.2s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

// ============================================
// ANIMATED WORKFLOW - Premium Version
// ============================================
const PremiumWorkflow = () => {
  const { ref, isVisible } = useScrollAnimation();

  const N8nIcon = () => (
    <svg viewBox="0 0 48 48" className="w-7 h-7" fill="#FF6D5A">
      <circle cx="10" cy="24" r="6"/>
      <circle cx="38" cy="12" r="6"/>
      <circle cx="38" cy="36" r="6"/>
      <path d="M14 22 L32 14" stroke="#FF6D5A" strokeWidth="4" strokeLinecap="round"/>
      <path d="M14 26 L32 34" stroke="#FF6D5A" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  );

  const OpenAIIcon = () => (
    <svg viewBox="0 0 24 24" className="w-7 h-7">
      <path fill="#fff" d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
    </svg>
  );

  const AirtableIcon = () => (
    <svg viewBox="0 0 200 170" className="w-7 h-7">
      <path fill="#FCB400" d="M90.039 12.368L24.079 39.66c-3.667 1.519-3.63 6.729.062 8.192l66.235 26.266a24.58 24.58 0 0 0 18.12-.001l66.235-26.265c3.691-1.463 3.729-6.673.062-8.192l-65.96-27.293a24.58 24.58 0 0 0-18.794 0z"/>
      <path fill="#18BFFF" d="M105.312 88.46v65.617c0 3.12 3.147 5.258 6.048 4.108l73.806-28.648a4.42 4.42 0 0 0 2.79-4.108V59.813c0-3.121-3.147-5.258-6.048-4.108l-73.806 28.648a4.42 4.42 0 0 0-2.79 4.108z"/>
      <path fill="#F82B60" d="M88.078 91.846l-21.904 10.576-2.224 1.075-46.238 22.155c-2.93 1.414-6.672-.722-6.672-3.978V60.088c0-1.178.604-2.195 1.414-2.96a5.09 5.09 0 0 1 1.469-.915c1.96-.904 4.478-.384 6.107.967l68.048 32.837z"/>
    </svg>
  );

  const SlackIcon = () => (
    <svg viewBox="0 0 24 24" className="w-7 h-7">
      <path fill="#E01E5A" d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z"/>
      <path fill="#36C5F0" d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z"/>
      <path fill="#2EB67D" d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z"/>
      <path fill="#ECB22E" d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
    </svg>
  );

  const nodes = [
    { id: "trigger", x: 80, y: 180, icon: <Zap className="w-7 h-7 text-white" />, color: "from-purple-500 to-purple-700", label: "Trigger" },
    { id: "n8n", x: 260, y: 70, icon: <N8nIcon />, color: "from-gray-800 to-gray-900", label: "n8n" },
    { id: "ai", x: 260, y: 290, icon: <OpenAIIcon />, color: "from-emerald-500 to-teal-600", label: "KI" },
    { id: "airtable", x: 440, y: 180, icon: <AirtableIcon />, color: "from-indigo-500 to-violet-600", label: "Airtable" },
    { id: "slack", x: 620, y: 70, icon: <SlackIcon />, color: "from-gray-700 to-gray-800", label: "Slack" },
    { id: "output", x: 620, y: 290, icon: <Check className="w-7 h-7 text-white" />, color: "from-green-500 to-emerald-600", label: "Output" },
  ];

  const connections = [
    { from: "trigger", to: "n8n", delay: 0 },
    { from: "trigger", to: "ai", delay: 0.4 },
    { from: "n8n", to: "airtable", delay: 1 },
    { from: "ai", to: "airtable", delay: 1.3 },
    { from: "airtable", to: "slack", delay: 2 },
    { from: "airtable", to: "output", delay: 2.3 },
  ];

  return (
    <div ref={ref} className="relative w-full max-w-4xl mx-auto" style={{ aspectRatio: "700 / 360" }}>
      {/* Glow Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/30 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* SVG Connections */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 700 360" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.6" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {connections.map((conn, i) => {
          const from = nodes.find((n) => n.id === conn.from)!;
          const to = nodes.find((n) => n.id === conn.to)!;
          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2;
          const curve = Math.abs(from.y - to.y) > 50 ? 0 : 30;

          return (
            <g key={i}>
              <path
                d={`M ${from.x} ${from.y} Q ${midX} ${midY - curve} ${to.x} ${to.y}`}
                fill="none"
                stroke="url(#flowGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                className="transition-all duration-1000"
                style={{
                  opacity: isVisible ? 1 : 0,
                  strokeDasharray: isVisible ? "none" : "10 10",
                  transitionDelay: `${conn.delay * 400}ms`,
                }}
              />
              {/* Animated Particle */}
              <circle r="6" fill="#c084fc" filter="url(#glow)">
                <animateMotion
                  dur="2.5s"
                  repeatCount="indefinite"
                  begin={`${conn.delay}s`}
                  path={`M ${from.x} ${from.y} Q ${midX} ${midY - curve} ${to.x} ${to.y}`}
                />
                <animate attributeName="opacity" values="0;1;1;0" dur="2.5s" repeatCount="indefinite" begin={`${conn.delay}s`} />
                <animate attributeName="r" values="4;8;4" dur="2.5s" repeatCount="indefinite" begin={`${conn.delay}s`} />
              </circle>
            </g>
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map((node, i) => (
        <div
          key={node.id}
          className="absolute transition-all duration-700"
          style={{
            left: `${(node.x / 700) * 100}%`,
            top: `${(node.y / 360) * 100}%`,
            transform: "translate(-50%, -50%)",
            opacity: isVisible ? 1 : 0,
            scale: isVisible ? "1" : "0.5",
            transitionDelay: `${i * 100}ms`,
          }}
        >
          <div className="group relative cursor-pointer">
            {/* Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${node.color} rounded-2xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity scale-150`} />
            {/* Node */}
            <div className={`relative w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br ${node.color} rounded-2xl shadow-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-white/20`}>
              {node.icon}
            </div>
            {/* Label */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="text-xs md:text-sm font-semibold text-white/80 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                {node.label}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================
// FLOATING STATS
// ============================================
const FloatingStat = ({ value, label, delay = 0 }: { value: string; label: string; delay?: number }) => {
  const { ref, isVisible } = useScrollAnimation();
  const [count, setCount] = useState(0);
  const numericValue = parseInt(value.replace(/\D/g, ""));

  useEffect(() => {
    if (!isVisible) return;
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(eased * numericValue));
      if (progress < 1) requestAnimationFrame(animate);
    };
    setTimeout(animate, delay);
  }, [isVisible, numericValue, delay]);

  return (
    <div
      ref={ref}
      className="text-center transition-all duration-1000"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0) scale(1)" : "translateY(40px) scale(0.9)",
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className="text-[80px] md:text-[120px] lg:text-[150px] font-bold leading-none tracking-tighter bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
        {count}{value.replace(/\d/g, "")}
      </div>
      <p className="text-lg md:text-xl text-white/60 mt-2">{label}</p>
    </div>
  );
};

// ============================================
// MAIN PAGE
// ============================================
const ApplePage = () => {
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "Flowstack Systems";
    window.scrollTo(0, 0);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const heroOpacity = Math.max(0, 1 - scrollY / 600);
  const heroScale = 1 + scrollY * 0.0002;

  return (
    <div className="bg-black text-white overflow-x-hidden">
      {/* Global Styles */}
      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .gradient-animate {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }
        .float { animation: float 6s ease-in-out infinite; }
        .float-delayed { animation: float 6s ease-in-out infinite; animation-delay: -3s; }
      `}</style>

      {/* ============================================ */}
      {/* NAVBAR */}
      {/* ============================================ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrollY > 50 ? "bg-black/80 backdrop-blur-2xl border-b border-white/10" : ""}`}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="text-white font-semibold text-lg tracking-tight">{siteConfig.name}</Link>
          <div className="hidden md:flex items-center gap-8">
            {["System", "Ergebnisse", "Ablauf", "FAQ"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm text-white/60 hover:text-white transition-colors">{item}</a>
            ))}
          </div>
          <Link to="/kostenlose-beratung" className="px-5 py-2 bg-white text-black font-medium text-sm rounded-full hover:bg-white/90 transition-colors">
            Jetzt starten
          </Link>
        </div>
      </nav>

      {/* ============================================ */}
      {/* HERO - Full Screen with Parallax */}
      {/* ============================================ */}
      <section ref={heroRef} className="relative min-h-[200vh]">
        <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden" style={{ opacity: heroOpacity }}>
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-gradient-conic from-purple-900 via-black via-50% to-purple-900 rounded-full opacity-30 blur-3xl gradient-animate" style={{ transform: `translate(-50%, -50%) scale(${heroScale})` }} />
            <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-[150px] float" />
            <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[150px] float-delayed" />
          </div>

          {/* Content */}
          <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
            <AnimatedSection>
              <p className="text-purple-400 text-lg md:text-xl font-medium mb-6 tracking-wide">
                Für Agenturen & B2B-Dienstleister
              </p>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <h1 className="text-[clamp(3rem,10vw,8rem)] font-bold leading-[0.95] tracking-tight mb-8">
                Deine Agentur.
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent gradient-animate">
                  Auf Autopilot.
                </span>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <p className="text-xl md:text-2xl lg:text-3xl text-white/50 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
                Das Flowstack-System ersetzt 80% deiner Routinearbeit durch KI-Workflows. Automatisch. Zuverlässig. Skalierbar.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={300}>
              <Link
                to="/kostenlose-beratung"
                className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-black font-semibold text-lg rounded-full hover:scale-105 transition-transform shadow-2xl shadow-white/20"
              >
                Kostenlose Prozess-Analyse
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Link>
            </AnimatedSection>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-white/40 uppercase tracking-widest">Scroll</span>
              <ChevronDown className="w-5 h-5 text-white/40 animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* PROBLEM DEEP DIVE */}
      {/* ============================================ */}
      <section className="py-32 md:py-48 bg-white text-black">
        <div className="max-w-5xl mx-auto px-6">
          <AnimatedSection className="text-center mb-20">
            <p className="text-red-500 text-sm font-semibold tracking-widest uppercase mb-4">Das Problem</p>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
              Deine Agentur wächst.<br />
              <span className="text-gray-400">Aber du nicht.</span>
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {[
              {
                title: "Mehr Umsatz = Mehr Arbeit",
                desc: "Jeder neue Kunde bedeutet mehr Aufwand. Das Hamsterrad dreht sich schneller, aber du kommst nicht voran.",
                icon: "📈"
              },
              {
                title: "Du bist der Flaschenhals",
                desc: "Ohne dich läuft nichts. E-Mails, Calls, Entscheidungen – alles hängt an dir. Urlaub? Nur mit Laptop.",
                icon: "🔒"
              },
              {
                title: "Mitarbeiter kosten",
                desc: "Jede Neueinstellung frisst Marge. Gehalt, Onboarding, Management – und dann kündigen sie nach einem Jahr.",
                icon: "💸"
              },
              {
                title: "Skalierung unmöglich",
                desc: "Du weißt, was möglich wäre. Aber wie soll das gehen, wenn du schon jetzt am Limit bist?",
                icon: "🚧"
              },
            ].map((item, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <div className="p-8 md:p-10 rounded-3xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors h-full">
                  <span className="text-4xl mb-6 block">{item.icon}</span>
                  <h3 className="text-xl md:text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-500 text-lg leading-relaxed">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="text-center">
            <p className="text-2xl md:text-3xl text-gray-400 font-light italic">
              "Was wäre, wenn deine Agentur ohne dich laufen könnte?"
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================ */}
      {/* THE SHIFT - Paradigm Change */}
      {/* ============================================ */}
      <section className="py-32 md:py-48 bg-black relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-purple-900/20 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-emerald-900/20 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <AnimatedSection className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
              Es gibt einen<br />besseren Weg.
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={200} className="text-center">
            <p className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto leading-relaxed">
              Die erfolgreichsten Agenturen 2025 haben eines gemeinsam: Sie arbeiten nicht härter.
              Sie haben <span className="text-white font-semibold">Systeme</span>, die für sie arbeiten.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={400} className="mt-20">
            <div className="relative p-12 md:p-20 rounded-[40px] bg-gradient-to-br from-white/5 to-white/0 border border-white/10 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
                <div className="text-center">
                  <div className="text-6xl md:text-8xl font-bold text-red-400/50 line-through">80%</div>
                  <p className="text-white/40 mt-2">manuelle Arbeit</p>
                </div>
                <div className="text-4xl text-white/20">→</div>
                <div className="text-center">
                  <div className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">80%</div>
                  <p className="text-white/40 mt-2">automatisiert</p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================ */}
      {/* SYSTEM VISUALIZATION */}
      {/* ============================================ */}
      <section id="system" className="py-32 md:py-48 relative">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedSection className="text-center mb-20">
            <p className="text-purple-400 text-sm font-semibold tracking-widest uppercase mb-4">Das System</p>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Ein System.<br />Unendliche Möglichkeiten.
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <PremiumWorkflow />
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================ */}
      {/* STATS - Massive Numbers */}
      {/* ============================================ */}
      <section id="ergebnisse" className="py-32 md:py-48 bg-gradient-to-b from-black via-purple-950/20 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <AnimatedSection className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Ergebnisse, die sprechen.
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-12">
            <FloatingStat value="80%" label="weniger Routinearbeit" delay={0} />
            <FloatingStat value="50%+" label="Umsatzrendite" delay={200} />
            <FloatingStat value="5×" label="mehr Kapazität" delay={400} />
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* USE CASES - What We Automate */}
      {/* ============================================ */}
      <section className="py-32 md:py-48 bg-white text-black">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedSection className="text-center mb-20">
            <p className="text-purple-600 text-sm font-semibold tracking-widest uppercase mb-4">Anwendungen</p>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Was wir automatisieren.
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                category: "Lead Management",
                items: ["Automatische Lead-Qualifizierung", "CRM-Updates in Echtzeit", "Follow-up Sequenzen", "Pipeline-Tracking"],
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                category: "Client Onboarding",
                items: ["Vertragsversand & Signing", "Automatische Projektanlage", "Willkommens-Sequenzen", "Tool-Zugänge erstellen"],
                gradient: "from-purple-500 to-pink-500"
              },
              {
                category: "Projektmanagement",
                items: ["Task-Erstellung aus Briefings", "Status-Updates an Kunden", "Deadline-Erinnerungen", "Reporting-Automation"],
                gradient: "from-orange-500 to-red-500"
              },
              {
                category: "Content & Social",
                items: ["KI-Content-Generierung", "Multi-Plattform-Posting", "Engagement-Tracking", "Recycling von Content"],
                gradient: "from-green-500 to-emerald-500"
              },
              {
                category: "Finanzen & Admin",
                items: ["Rechnungsstellung", "Zahlungs-Tracking", "Ausgaben-Kategorisierung", "Buchhaltungs-Export"],
                gradient: "from-yellow-500 to-orange-500"
              },
              {
                category: "Recruiting & HR",
                items: ["Bewerbungs-Screening", "Interview-Scheduling", "Onboarding-Checklisten", "Performance-Tracking"],
                gradient: "from-pink-500 to-rose-500"
              },
            ].map((useCase, i) => (
              <AnimatedSection key={i} delay={i * 80}>
                <div className="group relative h-full">
                  <div className={`absolute inset-0 bg-gradient-to-br ${useCase.gradient} rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  <div className="relative p-8 rounded-3xl bg-gray-50 border border-gray-100 group-hover:border-gray-200 transition-all h-full">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${useCase.gradient} mb-6 flex items-center justify-center`}>
                      <Check className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">{useCase.category}</h3>
                    <ul className="space-y-2">
                      {useCase.items.map((item, j) => (
                        <li key={j} className="text-gray-500 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={600} className="text-center mt-16">
            <p className="text-gray-400 text-lg">
              + dutzende weitere individuelle Automations für dein Business
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================ */}
      {/* INTEGRATIONS - Tool Logos */}
      {/* ============================================ */}
      <section className="py-24 md:py-32 bg-black border-y border-white/10 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h3 className="text-2xl md:text-3xl font-bold text-white/80">
              Verbindet sich mit deinen Tools
            </h3>
          </AnimatedSection>

          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10" />

            <div className="flex items-center gap-16 animate-scroll">
              {["Airtable", "Slack", "Notion", "HubSpot", "Zapier", "n8n", "OpenAI", "Make", "Google", "Calendly", "Stripe", "Typeform", "Webflow", "Figma", "Asana", "Monday"].map((tool, i) => (
                <div key={i} className="flex-shrink-0 px-8 py-4 bg-white/5 rounded-full border border-white/10">
                  <span className="text-white/60 font-medium whitespace-nowrap">{tool}</span>
                </div>
              ))}
            </div>
          </div>

          <style>{`
            @keyframes scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-scroll {
              animation: scroll 30s linear infinite;
              width: max-content;
            }
          `}</style>
        </div>
      </section>

      {/* ============================================ */}
      {/* BEFORE/AFTER - Split Screen */}
      {/* ============================================ */}
      <section className="py-32 md:py-48">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedSection className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
              Vorher. Nachher.
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <AnimatedSection>
              <div className="relative group h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-red-900/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative p-10 md:p-14 rounded-3xl bg-gradient-to-br from-red-950/80 to-black border border-red-500/20 h-full">
                  <p className="text-red-400 font-bold text-sm tracking-widest uppercase mb-8">Ohne Flowstack</p>
                  <ul className="space-y-6">
                    {[
                      "80% der Zeit für Routinearbeit",
                      "Du bist der Flaschenhals",
                      "Neue Kunden = mehr Stress",
                      "Urlaub nur mit Laptop",
                      "Marge unter 20%",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-4 text-lg text-white/80">
                        <X className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={150}>
              <div className="relative group h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-emerald-900/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative p-10 md:p-14 rounded-3xl bg-gradient-to-br from-emerald-950/80 to-black border border-emerald-500/20 h-full">
                  <p className="text-emerald-400 font-bold text-sm tracking-widest uppercase mb-8">Mit Flowstack</p>
                  <ul className="space-y-6">
                    {[
                      "80% läuft vollautomatisch",
                      "System arbeitet ohne dich",
                      "5× mehr Kunden möglich",
                      "Echte Freiheit",
                      "50%+ Umsatzrendite",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-4 text-lg text-white/80">
                        <Check className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* PROCESS - Timeline */}
      {/* ============================================ */}
      <section id="ablauf" className="py-32 md:py-48 bg-white text-black">
        <div className="max-w-4xl mx-auto px-6">
          <AnimatedSection className="text-center mb-24">
            <p className="text-purple-600 text-sm font-semibold tracking-widest uppercase mb-4">Der Ablauf</p>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">In 4 Wochen live.</h2>
          </AnimatedSection>

          <div className="space-y-16">
            {[
              { week: "Woche 1", title: "Analyse", desc: "Wir analysieren deine Prozesse und identifizieren die größten Automatisierungs-Hebel." },
              { week: "Woche 1-2", title: "Design", desc: "Wir designen dein individuelles Flowstack-System mit allen Integrationen." },
              { week: "Woche 2-3", title: "Build", desc: "Wir bauen alle Automations, KI-Workflows und Integrationen. Du musst nichts tun." },
              { week: "Woche 4+", title: "Launch", desc: "Dein System geht live. Wir schulen dein Team und optimieren kontinuierlich." },
            ].map((step, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <div className="flex gap-8 items-start">
                  <div className="flex-shrink-0 w-24 h-24 rounded-3xl bg-black text-white flex items-center justify-center text-3xl font-bold shadow-2xl">
                    0{i + 1}
                  </div>
                  <div className="pt-2">
                    <p className="text-purple-600 font-semibold text-sm mb-1">{step.week}</p>
                    <h3 className="text-2xl md:text-3xl font-bold mb-2">{step.title}</h3>
                    <p className="text-gray-500 text-lg">{step.desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FEATURES DEEP DIVE */}
      {/* ============================================ */}
      <section className="py-32 md:py-48 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <AnimatedSection className="text-center mb-24">
            <p className="text-purple-400 text-sm font-semibold tracking-widest uppercase mb-4">Features</p>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Alles, was du brauchst.
            </h2>
          </AnimatedSection>

          {/* Feature 1 - Big */}
          <AnimatedSection className="mb-12">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-[40px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative p-10 md:p-16 rounded-[40px] bg-gradient-to-br from-white/5 to-white/0 border border-white/10">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-8">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold mb-4">KI-Workflows</h3>
                    <p className="text-white/60 text-lg leading-relaxed mb-6">
                      Nicht nur simple Automations, sondern intelligente Workflows, die mitdenken.
                      GPT-4, Claude, Whisper – nahtlos integriert.
                    </p>
                    <ul className="space-y-3">
                      {["Automatische Texterstellung", "Intelligente Kategorisierung", "Sentiment-Analyse", "Spracherkennung"].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-white/80">
                          <Check className="w-5 h-5 text-purple-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="relative h-64 md:h-80">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-3xl" />
                    <div className="absolute inset-4 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-4">🧠</div>
                        <p className="text-white/40 text-sm">KI-Engine Visualisierung</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Features 2 & 3 - Side by Side */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <AnimatedSection delay={100}>
              <div className="relative group h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-[32px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-10 rounded-[32px] bg-gradient-to-br from-white/5 to-white/0 border border-white/10 h-full">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6">
                    <ArrowRight className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Echtzeit-Sync</h3>
                  <p className="text-white/60 leading-relaxed">
                    Alle deine Tools sprechen miteinander. Änderungen propagieren sofort durchs gesamte System.
                  </p>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <div className="relative group h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-[32px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-10 rounded-[32px] bg-gradient-to-br from-white/5 to-white/0 border border-white/10 h-full">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center mb-6">
                    <Check className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Zero Maintenance</h3>
                  <p className="text-white/60 leading-relaxed">
                    Wir bauen, pflegen und optimieren. Du genießt die Ergebnisse. Ohne technisches Wissen.
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* ROI VISUALIZATION */}
      {/* ============================================ */}
      <section className="py-32 md:py-48 bg-gradient-to-b from-black via-purple-950/30 to-black relative overflow-hidden">
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <AnimatedSection className="text-center mb-20">
            <p className="text-purple-400 text-sm font-semibold tracking-widest uppercase mb-4">Kalkulation</p>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Die Rechnung geht auf.
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <div className="p-10 md:p-16 rounded-[40px] bg-black/50 backdrop-blur-sm border border-white/10">
              <div className="grid md:grid-cols-3 gap-12">
                <div className="text-center">
                  <p className="text-white/40 text-sm uppercase tracking-wider mb-2">Zeitersparnis</p>
                  <div className="text-5xl md:text-6xl font-bold text-white mb-2">160h</div>
                  <p className="text-white/40">pro Monat</p>
                </div>
                <div className="text-center border-x border-white/10">
                  <p className="text-white/40 text-sm uppercase tracking-wider mb-2">Dein Stundensatz</p>
                  <div className="text-5xl md:text-6xl font-bold text-white mb-2">150€</div>
                  <p className="text-white/40">konservativ</p>
                </div>
                <div className="text-center">
                  <p className="text-white/40 text-sm uppercase tracking-wider mb-2">Monatlicher Wert</p>
                  <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">24.000€</div>
                  <p className="text-white/40">eingesparte Zeit</p>
                </div>
              </div>

              <div className="mt-12 pt-12 border-t border-white/10 text-center">
                <p className="text-white/60 text-lg">
                  Selbst bei einem Investment von 5.000€/Monat:<br />
                  <span className="text-white font-semibold">5× ROI. Jeden Monat.</span>
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================ */}
      {/* TESTIMONIALS */}
      {/* ============================================ */}
      <section className="py-32 md:py-48 bg-white text-black">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedSection className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
              Was unsere Partner sagen.
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                quote: "Wir haben unseren Umsatz verdreifacht – mit dem gleichen Team. Flowstack hat alles verändert.",
                name: "Michael K.",
                role: "Geschäftsführer, Marketing-Agentur",
                metric: "+300% Umsatz"
              },
              {
                quote: "Endlich kann ich wieder am Business arbeiten, statt nur im Business. Die Automations laufen perfekt.",
                name: "Sarah M.",
                role: "Inhaberin, Design Studio",
                metric: "20h/Woche gespart"
              },
              {
                quote: "Die Onboarding-Automation allein hat sich in 2 Wochen amortisiert. Der Rest ist Bonus.",
                name: "Thomas R.",
                role: "CEO, SaaS-Agentur",
                metric: "ROI in 14 Tagen"
              },
              {
                quote: "Ich hab schon alles probiert – Zapier, Make, eigene Devs. Nichts kam an Flowstack ran.",
                name: "Lisa H.",
                role: "Gründerin, Performance Agentur",
                metric: "80% weniger Fehler"
              },
            ].map((testimonial, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <div className="p-8 md:p-10 rounded-3xl bg-gray-50 border border-gray-100 h-full">
                  <div className="inline-block px-4 py-1.5 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full mb-6">
                    {testimonial.metric}
                  </div>
                  <p className="text-xl md:text-2xl font-medium text-gray-800 mb-8 leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div>
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* GUARANTEE */}
      {/* ============================================ */}
      <section className="py-32 md:py-48 bg-black relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <AnimatedSection>
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 mb-10">
              <Check className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">
              Keine Ergebnisse?<br />Kein Risiko.
            </h2>
            <p className="text-xl md:text-2xl text-white/60 leading-relaxed max-w-2xl mx-auto mb-12">
              Wir sind so überzeugt von unserem System, dass wir dir eine Garantie geben:
              Wenn du nach 90 Tagen nicht mindestens 10 Stunden pro Woche sparst,
              arbeiten wir kostenlos weiter, bis du es tust.
            </p>
            <div className="inline-block px-6 py-3 border border-emerald-500/50 rounded-full text-emerald-400 font-semibold">
              100% Ergebnis-Garantie
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================ */}
      {/* TEAM */}
      {/* ============================================ */}
      <section className="py-32 md:py-48 bg-white text-black">
        <div className="max-w-5xl mx-auto px-6">
          <AnimatedSection className="text-center mb-20">
            <p className="text-purple-600 text-sm font-semibold tracking-widest uppercase mb-4">Das Team</p>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
              Die Menschen dahinter.
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {teamContent.members.slice(0, 1).map((member) => (
              <AnimatedSection key={member.name}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-[40px] blur-3xl opacity-30" />
                  <img
                    src={member.image}
                    alt={member.name}
                    className="relative w-full aspect-[4/5] rounded-[40px] object-cover object-top"
                  />
                </div>
              </AnimatedSection>
            ))}

            <AnimatedSection delay={200}>
              {teamContent.members.slice(0, 1).map((member) => (
                <div key={member.name}>
                  <h3 className="text-3xl md:text-4xl font-bold mb-2">{member.name}</h3>
                  <p className="text-purple-600 text-xl mb-8">{member.role}</p>
                  <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
                    {member.bio?.split("\n\n").map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                  <div className="mt-10 flex flex-wrap gap-3">
                    {["n8n Certified", "Make Expert", "500+ Automations", "5 Jahre Erfahrung"].map((badge, i) => (
                      <span key={i} className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* WHY US */}
      {/* ============================================ */}
      <section className="py-32 md:py-48 bg-gray-50 text-black">
        <div className="max-w-5xl mx-auto px-6">
          <AnimatedSection className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
              Warum Flowstack?
            </h2>
          </AnimatedSection>

          <div className="grid gap-8">
            {[
              {
                number: "01",
                title: "Wir verstehen Agenturen",
                desc: "Wir kommen selbst aus der Agenturwelt und kennen die Herausforderungen. Keine Berater, die noch nie eine Deadline verpasst haben."
              },
              {
                number: "02",
                title: "Fertig in 4 Wochen",
                desc: "Kein endloses Projekt. Kein Feature-Creep. Du bekommst ein fertiges System, das vom ersten Tag an Ergebnisse liefert."
              },
              {
                number: "03",
                title: "Wir bauen, du genießt",
                desc: "Du brauchst weder technisches Wissen noch stundenlange Abstimmungen. Wir machen alles – du lehnst dich zurück."
              },
              {
                number: "04",
                title: "Langfristige Partnerschaft",
                desc: "Wir sind kein Agency-Hopper. Wir betreuen unsere Partner langfristig und entwickeln ihre Systeme kontinuierlich weiter."
              },
            ].map((item, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <div className="flex gap-8 items-start p-8 md:p-10 bg-white rounded-3xl border border-gray-100 hover:border-gray-200 transition-colors">
                  <span className="text-5xl md:text-6xl font-bold text-gray-200 flex-shrink-0">{item.number}</span>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                    <p className="text-gray-500 text-lg leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FAQ */}
      {/* ============================================ */}
      <section id="faq" className="py-32 md:py-48 bg-white text-black">
        <div className="max-w-3xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Fragen?</h2>
          </AnimatedSection>

          <div className="space-y-4">
            {faqItems.slice(0, 5).map((item, i) => (
              <AnimatedSection key={i} delay={i * 50}>
                <details className="group bg-gray-50 rounded-2xl overflow-hidden">
                  <summary className="flex items-center justify-between p-6 cursor-pointer font-semibold text-lg">
                    {item.question}
                    <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-6 pb-6 text-gray-500">{item.answer}</div>
                </details>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SCARCITY / URGENCY */}
      {/* ============================================ */}
      <section className="py-24 md:py-32 bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <AnimatedSection>
            <p className="text-purple-200 text-sm font-semibold tracking-widest uppercase mb-4">Limitiert</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Wir nehmen nur 3 neue Partner pro Monat.
            </h2>
            <p className="text-lg md:text-xl text-purple-200/80 max-w-2xl mx-auto">
              Um maximale Qualität zu garantieren, limitieren wir die Anzahl aktiver Projekte.
              Sichere dir jetzt einen der Plätze für den kommenden Monat.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================ */}
      {/* FINAL CTA */}
      {/* ============================================ */}
      <section className="py-32 md:py-48 lg:py-64 bg-black relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-conic from-purple-600 via-pink-500 to-purple-600 rounded-full blur-[200px] opacity-30 gradient-animate" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[150px] float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[150px] float-delayed" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <AnimatedSection>
            <h2 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight mb-8">
              Bereit für<br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent gradient-animate">
                mehr?
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-white/50 mb-16 max-w-2xl mx-auto leading-relaxed">
              Buche jetzt deine kostenlose Prozess-Analyse.<br />
              Wir zeigen dir genau, was in deiner Agentur möglich ist.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <Link
              to="/kostenlose-beratung"
              className="group inline-flex items-center gap-4 px-14 py-7 bg-white text-black font-bold text-2xl rounded-full hover:scale-105 transition-transform shadow-2xl shadow-white/20"
            >
              Kostenlose Beratung
              <ArrowRight className="w-7 h-7 group-hover:translate-x-2 transition-transform" />
            </Link>
          </AnimatedSection>

          <AnimatedSection delay={400} className="mt-12">
            <p className="text-white/30 text-sm">
              ✓ Unverbindlich · ✓ 30 Minuten · ✓ Sofort umsetzbare Insights
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================ */}
      {/* FOOTER */}
      {/* ============================================ */}
      <footer className="py-8 bg-black border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">© {new Date().getFullYear()} {siteConfig.name}</p>
          <div className="flex gap-6 text-sm text-white/40">
            <a href="/impressum" target="_blank" className="hover:text-white">Impressum</a>
            <a href="/datenschutz" target="_blank" className="hover:text-white">Datenschutz</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ApplePage;
