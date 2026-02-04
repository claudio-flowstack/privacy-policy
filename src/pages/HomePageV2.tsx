/**
 * HomePageV2 - Ultra Modern Premium Design
 * With Scroll Animations, Logo Marquee, Bento Testimonials
 */

import { Link } from "react-router-dom";
import {
  siteConfig,
  trustMetrics,
  tools,
  problemSection,
  solutionPreview,
  flowstackSystem,
  ctaInline,
  outcomes,
  services,
  teamContent,
  faqItems,
  finalCta,
} from "@/config/content";
import {
  Check,
  ArrowRight,
  ArrowUpRight,
  Play,
  Star,
  Mail,
  MapPin,
  ChevronDown,
  Sparkles,
  Zap,
  AlertTriangle,
  Linkedin,
  MousePointer,
  Bot,
  Workflow,
  LineChart,
  Quote,
  BadgeCheck,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

// Scroll Animation Hook
const useScrollAnimation = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
};

// Animated Section Component
const AnimatedSection = ({
  children,
  className = "",
  delay = 0
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(40px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

// Staggered Children Animation
const StaggeredContainer = ({
  children,
  className = "",
  staggerDelay = 100
}: {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
}) => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div ref={ref} className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className="transition-all duration-500 ease-out"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(30px)",
            transitionDelay: `${index * staggerDelay}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

// Animated Workflow Visualization Component
const AnimatedWorkflow = ({ isHero = false }: { isHero?: boolean }) => {
  const { ref, isVisible } = useScrollAnimation();

  // Tool nodes configuration - larger spacing for hero
  const nodes = isHero ? [
    { id: 'trigger', label: 'Trigger', x: 60, y: 100, icon: 'trigger', color: 'from-violet-500 to-purple-600' },
    { id: 'make', label: 'Make', x: 200, y: 50, icon: 'make', color: 'from-pink-500 to-rose-600' },
    { id: 'ai', label: 'KI', x: 200, y: 150, icon: 'ai', color: 'from-emerald-500 to-teal-600' },
    { id: 'airtable', label: 'Airtable', x: 340, y: 100, icon: 'airtable', color: 'from-blue-500 to-indigo-600' },
    { id: 'slack', label: 'Slack', x: 480, y: 50, icon: 'slack', color: 'from-amber-500 to-orange-600' },
    { id: 'output', label: 'Output', x: 480, y: 150, icon: 'output', color: 'from-cyan-500 to-blue-600' },
  ] : [
    { id: 'trigger', label: 'Trigger', x: 50, y: 80, icon: 'trigger', color: 'from-violet-500 to-purple-600' },
    { id: 'make', label: 'Make', x: 180, y: 40, icon: 'make', color: 'from-pink-500 to-rose-600' },
    { id: 'ai', label: 'KI', x: 180, y: 120, icon: 'ai', color: 'from-emerald-500 to-teal-600' },
    { id: 'airtable', label: 'Airtable', x: 310, y: 80, icon: 'airtable', color: 'from-blue-500 to-indigo-600' },
    { id: 'slack', label: 'Slack', x: 440, y: 40, icon: 'slack', color: 'from-amber-500 to-orange-600' },
    { id: 'output', label: 'Output', x: 440, y: 120, icon: 'output', color: 'from-cyan-500 to-blue-600' },
  ];

  // Connection paths between nodes
  const connections = [
    { from: 'trigger', to: 'make', delay: 0 },
    { from: 'trigger', to: 'ai', delay: 0.3 },
    { from: 'make', to: 'airtable', delay: 0.8 },
    { from: 'ai', to: 'airtable', delay: 1.1 },
    { from: 'airtable', to: 'slack', delay: 1.8 },
    { from: 'airtable', to: 'output', delay: 2.1 },
  ];

  const getNodeById = (id: string) => nodes.find(n => n.id === id);

  const svgViewBox = isHero ? "0 0 540 200" : "0 0 500 160";
  const containerHeight = isHero ? "h-[380px] md:h-[350px]" : "h-[320px] md:h-[280px]";

  return (
    <div ref={ref} className={`relative w-full ${containerHeight}`}>
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <div className={`absolute top-1/4 left-1/4 ${isHero ? 'w-48 h-48' : 'w-32 h-32'} bg-blue-400/20 rounded-full blur-3xl animate-pulse-slow`} />
        <div className={`absolute bottom-1/4 right-1/4 ${isHero ? 'w-48 h-48' : 'w-32 h-32'} bg-violet-400/20 rounded-full blur-3xl animate-pulse-slower`} />
        {isHero && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl animate-pulse" />}
      </div>

      {/* SVG for connections */}
      <svg className="absolute inset-0 w-full h-full" viewBox={svgViewBox} preserveAspectRatio="xMidYMid meet">
        <defs>
          {/* Gradient for connection lines */}
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
          </linearGradient>

          {/* Animated gradient for flowing data */}
          <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0">
              <animate attributeName="offset" values="-1;1" dur="2s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#a78bfa" stopOpacity="1">
              <animate attributeName="offset" values="-0.5;1.5" dur="2s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0">
              <animate attributeName="offset" values="0;2" dur="2s" repeatCount="indefinite" />
            </stop>
          </linearGradient>

          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connection lines */}
        {connections.map((conn, index) => {
          const fromNode = getNodeById(conn.from);
          const toNode = getNodeById(conn.to);
          if (!fromNode || !toNode) return null;

          const midX = (fromNode.x + toNode.x) / 2;
          const midY = (fromNode.y + toNode.y) / 2;
          const curveOffset = Math.abs(fromNode.y - toNode.y) > 20 ? 0 : 15;

          return (
            <g key={index}>
              {/* Background line */}
              <path
                d={`M ${fromNode.x} ${fromNode.y} Q ${midX} ${midY - curveOffset} ${toNode.x} ${toNode.y}`}
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                className={`transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                style={{ transitionDelay: `${conn.delay * 500}ms` }}
              />

              {/* Animated flowing data particle */}
              <circle r="4" fill="#60a5fa" filter="url(#glow)">
                <animateMotion
                  dur="2s"
                  repeatCount="indefinite"
                  begin={`${conn.delay}s`}
                  path={`M ${fromNode.x} ${fromNode.y} Q ${midX} ${midY - curveOffset} ${toNode.x} ${toNode.y}`}
                />
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  dur="2s"
                  repeatCount="indefinite"
                  begin={`${conn.delay}s`}
                />
              </circle>

              {/* Second particle with offset */}
              <circle r="3" fill="#a78bfa" filter="url(#glow)">
                <animateMotion
                  dur="2s"
                  repeatCount="indefinite"
                  begin={`${conn.delay + 1}s`}
                  path={`M ${fromNode.x} ${fromNode.y} Q ${midX} ${midY - curveOffset} ${toNode.x} ${toNode.y}`}
                />
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  dur="2s"
                  repeatCount="indefinite"
                  begin={`${conn.delay + 1}s`}
                />
              </circle>
            </g>
          );
        })}
      </svg>

      {/* Tool nodes */}
      {nodes.map((node, index) => (
        <div
          key={node.id}
          className={`absolute transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
          style={{
            left: `${(node.x / (isHero ? 540 : 500)) * 100}%`,
            top: `${(node.y / (isHero ? 200 : 160)) * 100}%`,
            transform: 'translate(-50%, -50%)',
            transitionDelay: `${index * 150}ms`,
          }}
        >
          <div className="group relative">
            {/* Pulsing ring */}
            <div className={`absolute inset-0 bg-gradient-to-br ${node.color} rounded-xl blur-md opacity-40 group-hover:opacity-60 animate-pulse`}
                 style={{ animationDelay: `${index * 200}ms` }} />

            {/* Node container */}
            <div className={`relative w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br ${node.color} rounded-xl shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform cursor-pointer`}>
              {/* Icon based on type */}
              {node.icon === 'trigger' && (
                <Zap className="w-6 h-6 md:w-7 md:h-7 text-white" />
              )}
              {node.icon === 'make' && (
                <Workflow className="w-6 h-6 md:w-7 md:h-7 text-white" />
              )}
              {node.icon === 'ai' && (
                <Bot className="w-6 h-6 md:w-7 md:h-7 text-white" />
              )}
              {node.icon === 'airtable' && (
                <svg className="w-6 h-6 md:w-7 md:h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              )}
              {node.icon === 'slack' && (
                <svg className="w-6 h-6 md:w-7 md:h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.124 2.521a2.528 2.528 0 0 1 2.52-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.52V8.834zm-1.271 0a2.528 2.528 0 0 1-2.521 2.521 2.528 2.528 0 0 1-2.521-2.521V2.522A2.528 2.528 0 0 1 15.166 0a2.528 2.528 0 0 1 2.521 2.522v6.312zm-2.521 10.124a2.528 2.528 0 0 1 2.521 2.52A2.528 2.528 0 0 1 15.166 24a2.528 2.528 0 0 1-2.521-2.522v-2.52h2.521zm0-1.271a2.528 2.528 0 0 1-2.521-2.521 2.528 2.528 0 0 1 2.521-2.521h6.312A2.528 2.528 0 0 1 24 15.166a2.528 2.528 0 0 1-2.522 2.521h-6.312z"/>
                </svg>
              )}
              {node.icon === 'output' && (
                <Check className="w-6 h-6 md:w-7 md:h-7 text-white" />
              )}
            </div>

            {/* Label */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="text-xs font-semibold text-gray-600 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm">
                {node.label}
              </span>
            </div>
          </div>
        </div>
      ))}

      {/* Status indicator */}
      <div className={`absolute bottom-4 right-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-100 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
           style={{ transitionDelay: '800ms' }}>
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-semibold text-gray-700">Live & Running</span>
      </div>

      {/* Data packets counter */}
      <div className={`absolute bottom-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-100 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
           style={{ transitionDelay: '1000ms' }}>
        <Sparkles className="w-4 h-4 text-blue-500" />
        <span className="text-xs font-semibold text-gray-700">247 Tasks heute</span>
      </div>
    </div>
  );
};

export const HomePageV2 = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Duplicate tools for seamless marquee
  const allTools = [...tools, ...tools];

  // Testimonial data with varied content
  const testimonials = [
    {
      quote: "Das Flowstack-System hat unsere Agentur komplett transformiert. Wir sparen jetzt über 20 Stunden pro Woche.",
      name: teamContent.members[0]?.name || "Max M.",
      role: "Geschäftsführer, Social Media Agentur",
      image: teamContent.members[0]?.image || "/claudio.jpg",
      featured: true,
    },
    {
      quote: "Endlich kann ich mich auf Strategie konzentrieren statt auf operative Arbeit. Game Changer!",
      name: "Sandra L.",
      role: "Inhaberin, Recruiting Agentur",
      image: teamContent.members[1]?.image || "/anak.jpg",
      featured: false,
    },
    {
      quote: "Die Implementation war smooth und das Team super supportive. ROI nach 6 Wochen erreicht.",
      name: "Tom R.",
      role: "Creative Director",
      image: teamContent.members[0]?.image || "/claudio.jpg",
      featured: false,
    },
    {
      quote: "Wir haben unsere Kapazität verdreifacht ohne neue Mitarbeiter einzustellen. Unglaublich.",
      name: teamContent.members[1]?.name || "Anak W.",
      role: "COO, Performance Agentur",
      image: teamContent.members[1]?.image || "/anak.jpg",
      featured: true,
    },
    {
      quote: "Die Automatisierung läuft 24/7 fehlerfrei. Besser als jeder Mitarbeiter.",
      name: "Lisa K.",
      role: "Gründerin, Content Agentur",
      image: teamContent.members[0]?.image || "/claudio.jpg",
      featured: false,
    },
    {
      quote: "Beste Investition die wir je gemacht haben. Punkt.",
      name: "Marco S.",
      role: "CEO, E-Commerce Agentur",
      image: teamContent.members[1]?.image || "/anak.jpg",
      featured: false,
    },
  ];

  return (
    <div className="bg-[#fafbfc] text-gray-900 min-h-screen overflow-x-hidden antialiased">
      {/* ============================================ */}
      {/* NAVBAR - Glassmorphism */}
      {/* ============================================ */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-4 mt-4">
          <div className="max-w-7xl mx-auto bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg shadow-gray-900/5 px-6 py-3">
            <div className="flex items-center justify-between">
              <Link to="/v2" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {siteConfig.name}
                </span>
              </Link>

              <div className="hidden md:flex items-center gap-1">
                {['System', 'Features', 'Referenzen', 'FAQ'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 rounded-xl transition-all font-medium text-sm"
                  >
                    {item}
                  </a>
                ))}
              </div>

              <Link
                to="/kostenlose-beratung"
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-blue-600/25 transition-all hover:-translate-y-0.5 flex items-center gap-2"
              >
                Demo buchen
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ============================================ */}
      {/* HERO */}
      {/* ============================================ */}
      <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-gradient-to-bl from-blue-100/80 via-indigo-50/50 to-transparent rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-gradient-to-tr from-violet-100/60 via-blue-50/40 to-transparent rounded-full blur-3xl animate-pulse-slower" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-50/30 to-blue-50/30 rounded-full blur-3xl" />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `linear-gradient(gray 1px, transparent 1px), linear-gradient(90deg, gray 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-full text-sm font-medium mb-8 shadow-sm animate-fade-in">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <span className="text-gray-600">{siteConfig.eyebrow}</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-8 tracking-tight animate-fade-in-up">
                <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  {siteConfig.title.split(' ').slice(0, 2).join(' ')}
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  {siteConfig.title.split(' ').slice(2).join(' ')}
                </span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed mb-10 max-w-xl animate-fade-in-up animation-delay-200">
                {siteConfig.tagline}
              </p>

              <div className="flex flex-wrap gap-4 mb-10 animate-fade-in-up animation-delay-300">
                <Link
                  to="/kostenlose-beratung"
                  className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg overflow-hidden transition-all hover:shadow-2xl hover:shadow-blue-600/30 hover:-translate-y-1"
                >
                  <span className="relative z-10">{siteConfig.cta.text}</span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>

                <button className="group inline-flex items-center gap-3 bg-white text-gray-700 px-8 py-4 rounded-2xl font-semibold text-lg border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <Play className="w-4 h-4 ml-0.5" />
                  </div>
                  Video ansehen
                </button>
              </div>

              <div className="flex items-center gap-6 flex-wrap animate-fade-in-up animation-delay-400">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-white" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">47+</span> Agenturen
                  </span>
                </div>
                <div className="h-6 w-px bg-gray-200" />
                <div className="flex items-center gap-1.5">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">
                    <span className="font-semibold text-gray-900">4.9</span>/5 Rating
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Animated Workflow Visualization */}
            <div className="relative perspective-1000">
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-gray-900/10 border border-gray-100 overflow-hidden p-4 md:p-6">
                {/* Animated Workflow */}
                <AnimatedWorkflow isHero={true} />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <MousePointer className="w-5 h-5 text-gray-400 animate-bounce" />
          <span className="text-xs text-gray-400 uppercase tracking-widest">Scroll</span>
        </div>
      </section>

      {/* ============================================ */}
      {/* LOGOS - Infinite Marquee */}
      {/* ============================================ */}
      <section className="py-16 bg-white border-y border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-10">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-gray-400">
            Wir arbeiten mit führenden Tools
          </p>
        </div>

        {/* Marquee Container */}
        <div className="relative">
          {/* Gradient Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />

          {/* Scrolling Logos */}
          <div className="flex animate-marquee">
            {allTools.map((tool, index) => (
              <div key={`${tool.name}-${index}`} className="flex-shrink-0 mx-12 flex items-center justify-center">
                <img
                  src={tool.logo}
                  alt={tool.name}
                  className="h-8 w-auto object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* METRICS */}
      {/* ============================================ */}
      <section className="py-24 bg-[#fafbfc]">
        <div className="max-w-7xl mx-auto px-6">
          <StaggeredContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4" staggerDelay={100}>
            {trustMetrics.metrics.map((metric, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl p-8 border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-600/5 transition-all duration-300 hover:-translate-y-1"
              >
                <p className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  {metric.value}
                </p>
                <p className="text-gray-600 font-medium">{metric.label}</p>
              </div>
            ))}
          </StaggeredContainer>
        </div>
      </section>

      {/* ============================================ */}
      {/* PROBLEMS */}
      {/* ============================================ */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-red-50 text-red-600 rounded-full text-sm font-semibold mb-4">
              Das Problem
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              {problemSection.headline}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {problemSection.subheadline}
            </p>
          </AnimatedSection>

          <StaggeredContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={100}>
            {problemSection.problems.map((problem, index) => (
              <div
                key={index}
                className="group bg-white p-8 rounded-3xl border border-gray-100 hover:border-red-200 transition-all duration-300 hover:shadow-xl hover:shadow-red-600/5 hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                  <AlertTriangle className="w-7 h-7 text-red-500" />
                </div>
                <span className="text-xs font-bold text-red-500 uppercase tracking-wider">
                  {problem.label}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mt-2 mb-3">{problem.title}</h3>
                <p className="text-gray-600 leading-relaxed">{problem.description}</p>
              </div>
            ))}
          </StaggeredContainer>
        </div>
      </section>

      {/* ============================================ */}
      {/* SOLUTION */}
      {/* ============================================ */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-20">
            <span className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold mb-4">
              Die Lösung
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              {solutionPreview.headline}
            </h2>
          </AnimatedSection>

          <div className="space-y-32">
            {solutionPreview.benefits.map((benefit, index) => (
              <AnimatedSection key={index}>
                <div className={`grid lg:grid-cols-2 gap-16 items-center`}>
                  <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full text-blue-600 text-sm font-semibold mb-6">
                      <Sparkles className="w-4 h-4" />
                      Feature {index + 1}
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                      {benefit.title}
                    </h3>
                    <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                      {benefit.description}
                    </p>
                    <ul className="space-y-4 mb-8">
                      {['Automatische Ausführung', 'Echtzeit-Monitoring', 'Skalierbar'].map((point, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Check className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-gray-700 font-medium">{point}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to="/kostenlose-beratung"
                      className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all group"
                    >
                      Jetzt starten
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                  <div className={`relative ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                    {/* Use Animated Workflow for the second benefit (index 1) */}
                    {index === 1 ? (
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-[2.5rem] blur-2xl opacity-60 scale-95" />
                        <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-[2rem] p-6 md:p-8 border border-gray-100 shadow-xl overflow-hidden">
                          <AnimatedWorkflow />
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-[2.5rem] blur-2xl opacity-60 scale-95" />
                        <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-[2rem] p-8 border border-gray-100 shadow-xl">
                          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
                            <div className="flex items-center gap-4 mb-6">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                {index === 0 ? <Bot className="w-6 h-6 text-white" /> :
                                 <LineChart className="w-6 h-6 text-white" />}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">Automation Active</p>
                                <p className="text-sm text-gray-500">Running smoothly</p>
                              </div>
                              <div className="ml-auto w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                            </div>
                            <div className="space-y-4">
                              {[85, 92, 78].map((progress, i) => (
                                <div key={i}>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Task {i + 1}</span>
                                    <span className="font-medium text-gray-900">{progress}%</span>
                                  </div>
                                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000"
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SYSTEM STEPS */}
      {/* ============================================ */}
      <section id="system" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-20">
            <span className="inline-block px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-sm font-semibold mb-4">
              Der Prozess
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              In 4 Schritten zur Automation
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {flowstackSystem.subheadline}
            </p>
          </AnimatedSection>

          <StaggeredContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={150}>
            {flowstackSystem.stages.map((stage, index) => (
              <div key={index} className="relative group">
                {index < flowstackSystem.stages.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-blue-300 to-blue-100" />
                )}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-600/5 transition-all duration-300 hover:-translate-y-2 h-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                    {stage.number}
                  </div>
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full mb-4">
                    {stage.duration}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{stage.subtitle}</h3>
                  <p className="text-gray-600 mb-6">{stage.description}</p>
                  <ul className="space-y-3">
                    {stage.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  {stage.result && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <p className="text-sm text-blue-600 font-semibold">{stage.result}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </StaggeredContainer>
        </div>
      </section>

      {/* ============================================ */}
      {/* CTA */}
      {/* ============================================ */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>
        <AnimatedSection className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {ctaInline.primary.headline}
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            {ctaInline.primary.text}
          </p>
          <Link
            to="/kostenlose-beratung"
            className="inline-flex items-center gap-3 bg-white text-blue-600 px-10 py-5 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-white/20 transition-all hover:-translate-y-1"
          >
            {ctaInline.primary.cta}
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-6 text-white/60 text-sm">{ctaInline.primary.subtext}</p>
        </AnimatedSection>
      </section>

      {/* ============================================ */}
      {/* COMPARISON */}
      {/* ============================================ */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-sm font-semibold mb-4">
              Der Unterschied
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              {outcomes.headline}
            </h2>
          </AnimatedSection>

          <AnimatedSection>
            <div className="bg-gray-50 rounded-3xl overflow-hidden border border-gray-100">
              <div className="grid grid-cols-3 bg-white border-b border-gray-100">
                <div className="p-6"></div>
                <div className="p-6 text-center border-x border-gray-100">
                  <span className="text-gray-500 font-semibold">Manuell</span>
                </div>
                <div className="p-6 text-center bg-gradient-to-r from-blue-50 to-indigo-50">
                  <span className="text-blue-600 font-semibold">Mit Flowstack</span>
                </div>
              </div>
              {outcomes.comparison.map((row, index) => (
                <div key={index} className="grid grid-cols-3 border-b border-gray-100 last:border-0 hover:bg-white transition-colors">
                  <div className="p-6 font-medium text-gray-900">
                    {row.left.title || row.right.title}
                  </div>
                  <div className="p-6 text-center border-x border-gray-100">
                    <span className="text-red-500 font-semibold">{row.right.highlight}</span>
                  </div>
                  <div className="p-6 text-center bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                    <span className="text-blue-600 font-bold">{row.left.highlight}</span>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================ */}
      {/* TESTIMONIALS - Bento Grid */}
      {/* ============================================ */}
      <section id="referenzen" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-amber-50 text-amber-600 rounded-full text-sm font-semibold mb-4">
              Kundenstimmen
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Was unsere Kunden sagen
            </h2>
          </AnimatedSection>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto">
            {testimonials.map((testimonial, index) => (
              <AnimatedSection
                key={index}
                delay={index * 100}
                className={`${
                  testimonial.featured ? 'md:row-span-2' : ''
                }`}
              >
                <div className={`bg-white rounded-3xl border border-gray-100 hover:shadow-xl hover:shadow-gray-900/5 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col ${
                  testimonial.featured ? 'p-10' : 'p-8'
                }`}>
                  {/* Quote Icon for Featured */}
                  {testimonial.featured && (
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl flex items-center justify-center mb-6">
                      <Quote className="w-6 h-6 text-amber-500" />
                    </div>
                  )}

                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} className={`${testimonial.featured ? 'w-6 h-6' : 'w-5 h-5'} fill-amber-400 text-amber-400`} />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className={`text-gray-600 mb-6 leading-relaxed flex-grow ${
                    testimonial.featured ? 'text-xl' : ''
                  }`}>
                    "{testimonial.quote}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4 mt-auto">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className={`rounded-full object-cover ring-2 ring-gray-100 ${
                        testimonial.featured ? 'w-14 h-14' : 'w-12 h-12'
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`font-semibold text-gray-900 ${testimonial.featured ? 'text-lg' : ''}`}>
                          {testimonial.name}
                        </p>
                        <BadgeCheck className="w-4 h-4 text-blue-500" />
                      </div>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SERVICES */}
      {/* ============================================ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-violet-50 text-violet-600 rounded-full text-sm font-semibold mb-4">
              Leistungen
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              {services.headline}
            </h2>
          </AnimatedSection>

          <StaggeredContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={100}>
            {services.items.map((service, index) => (
              <div key={index} className="group bg-gray-50 p-8 rounded-3xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 border border-transparent hover:border-blue-100">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all">
                  <Zap className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{service.title}</h3>
                <ul className="space-y-3">
                  {service.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-600">
                      <Check className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </StaggeredContainer>
        </div>
      </section>

      {/* ============================================ */}
      {/* FAQ */}
      {/* ============================================ */}
      <section id="faq" className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-semibold mb-4">
              FAQ
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Häufig gestellte Fragen
            </h2>
          </AnimatedSection>

          <AnimatedSection>
            <div className="space-y-4">
              {faqItems.map((faq, index) => (
                <div key={index} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:shadow-gray-900/5 transition-all">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left"
                  >
                    <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                    <div className={`w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${openFaq === index ? 'bg-blue-100 rotate-180' : ''}`}>
                      <ChevronDown className={`w-5 h-5 transition-colors ${openFaq === index ? 'text-blue-600' : 'text-gray-400'}`} />
                    </div>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-96' : 'max-h-0'}`}>
                    <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================ */}
      {/* FINAL CTA */}
      {/* ============================================ */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl" />
        </div>
        <AnimatedSection className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            {finalCta.headline}
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            {finalCta.subheadline}
          </p>
          <Link
            to="/kostenlose-beratung"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-10 py-5 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-blue-600/30 transition-all hover:-translate-y-1"
          >
            {finalCta.cta.text}
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div className="mt-10 flex flex-wrap justify-center gap-8 text-gray-500 text-sm">
            {finalCta.trustElements.map((element, index) => (
              <span key={index}>{element}</span>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* ============================================ */}
      {/* FOOTER */}
      {/* ============================================ */}
      <footer className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">{siteConfig.name}</span>
              </div>
              <p className="text-gray-400 mb-8 max-w-sm leading-relaxed">
                Wir automatisieren operative Prozesse in B2B-Unternehmen und Agenturen mit KI-gestützten Systemen.
              </p>
              <div className="inline-flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-sm font-medium">4.9/5 Rating</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-6">Produkt</h4>
              <ul className="space-y-4 text-gray-400">
                <li><a href="#system" className="hover:text-white transition-colors">System</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#referenzen" className="hover:text-white transition-colors">Referenzen</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6">Unternehmen</h4>
              <ul className="space-y-4 text-gray-400">
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><Link to="/impressum" className="hover:text-white transition-colors">Impressum</Link></li>
                <li><Link to="/datenschutz" className="hover:text-white transition-colors">Datenschutz</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6">Kontakt</h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>Claudio Di Franco<br />Falkenweg 2<br />76327 Pfinztal</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:claudio@flowstack-system.de" className="hover:text-white transition-colors">claudio@flowstack-system.de</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} {siteConfig.name}. Alle Rechte vorbehalten.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://linkedin.com" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.02); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 4s ease-in-out infinite;
          animation-delay: 2s;
        }
        .animate-float-slow {
          animation: float-slow 5s ease-in-out infinite;
          animation-delay: 1s;
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
        .animate-pulse-slower {
          animation: pulse-slower 10s ease-in-out infinite;
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        .animation-delay-300 {
          animation-delay: 300ms;
        }
        .animation-delay-400 {
          animation-delay: 400ms;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
};

export default HomePageV2;
