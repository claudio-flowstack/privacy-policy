/**
 * HomePageV3 - Dark Premium Design
 * Combines best sections from all pages with LP purple color scheme
 */

import { Link } from "react-router-dom";
import {
  siteConfig,
  trustMetrics,
  tools,
  problemSection,
  solutionPreview,
  flowstackSystem,
  outcomes,
  targetAudience,
  services,
  timeline,
  teamContent,
  faqItems,
  finalCta,
} from "@/config/content";
import {
  Check,
  X,
  ArrowRight,
  ArrowUpRight,
  ArrowDown,
  Star,
  Mail,
  MapPin,
  ChevronDown,
  Sparkles,
  Zap,
  TrendingUp,
  TrendingDown,
  Shield,
  Clock,
  Users,
  AlertTriangle,
  Linkedin,
  MousePointer,
  Bot,
  Workflow,
  Search,
  PenTool,
  Rocket,
  Code,
  Headphones,
  Target,
  FileText,
  Eye,
  Flame,
  RefreshCw,
  Layers,
  XCircle,
  User,
  DollarSign,
  Phone,
  AlertCircle,
  ShieldX,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

// ============================================
// SCROLL ANIMATION HOOKS
// ============================================
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

// ============================================
// ANIMATED COUNT UP HOOK
// ============================================
const useCountUp = (end: number, duration: number = 2000, isVisible: boolean = true) => {
  const [count, setCount] = useState(0);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!isVisible || hasStartedRef.current) return;

    hasStartedRef.current = true;
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, isVisible]);

  return count;
};

// ============================================
// ANIMATED PROGRESS BAR
// ============================================
const AnimatedProgressBar = ({
  value,
  color = "bg-gradient-to-r from-purple-500 to-purple-400",
  delay = 0,
  isVisible = true
}: {
  value: number;
  color?: string;
  delay?: number;
  isVisible?: boolean;
}) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      setWidth(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay, isVisible]);

  return (
    <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} rounded-full transition-all duration-1500 ease-out`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
};

// ============================================
// ANIMATED BAR CHART
// ============================================
const AnimatedBarChart = ({ isVisible = true }: { isVisible?: boolean }) => {
  const [heights, setHeights] = useState<number[]>(Array(12).fill(0));
  const targetHeights = [30, 45, 25, 60, 40, 75, 55, 85, 70, 90, 80, 95];

  useEffect(() => {
    if (!isVisible) return;

    targetHeights.forEach((height, index) => {
      setTimeout(() => {
        setHeights(prev => {
          const newHeights = [...prev];
          newHeights[index] = height;
          return newHeights;
        });
      }, index * 100);
    });
  }, [isVisible]);

  return (
    <div className="flex items-end gap-1 h-24">
      {heights.map((h, i) => (
        <div
          key={i}
          className="flex-1 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t transition-all duration-700 ease-out hover:from-purple-500"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
};

// ============================================
// ANIMATED STAT CARD
// ============================================
const AnimatedStatCard = ({
  value,
  suffix = "",
  label,
  color = "text-purple-400",
  isVisible = true
}: {
  value: number;
  suffix?: string;
  label: string;
  color?: string;
  isVisible?: boolean;
}) => {
  const count = useCountUp(value, 2000, isVisible);

  return (
    <div className="bg-gray-700/50 rounded-xl p-4 text-center">
      <p className={`text-3xl font-bold ${color}`}>{count}{suffix}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
};

// ============================================
// SOLUTION PREVIEW GRAPHIC - Animated
// ============================================
const SolutionPreviewGraphic = ({ index }: { index: number }) => {
  const { ref, isVisible } = useScrollAnimation();
  const vorherCount = useCountUp(20, 1500, isVisible);
  const nachherCount = useCountUp(45, 2000, isVisible);

  return (
    <div ref={ref} className="space-y-4">
      {index === 0 && (
        <>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Vorher</span>
            <span className="text-red-400 font-semibold">{vorherCount}%</span>
          </div>
          <AnimatedProgressBar value={20} color="bg-red-500/50" delay={0} isVisible={isVisible} />
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Nachher</span>
            <span className="text-purple-400 font-semibold">{nachherCount}%+</span>
          </div>
          <AnimatedProgressBar value={45} delay={300} isVisible={isVisible} />
        </>
      )}
      {index === 1 && (
        <AnimatedBarChart isVisible={isVisible} />
      )}
      {index === 2 && (
        <div className="grid grid-cols-2 gap-4">
          <AnimatedStatCard value={5} suffix="x" label="Mehr Kunden" color="text-purple-400" isVisible={isVisible} />
          <AnimatedStatCard value={0} label="Neue Mitarbeiter" color="text-emerald-400" isVisible={isVisible} />
        </div>
      )}
    </div>
  );
};

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

// ============================================
// ANIMATED WORKFLOW VISUALIZATION
// ============================================
const AnimatedWorkflow = () => {
  const { ref, isVisible } = useScrollAnimation();

  const nodes = [
    { id: 'trigger', label: 'Trigger', x: 60, y: 100, icon: 'trigger', color: 'from-purple-500 to-purple-600' },
    { id: 'make', label: 'Make', x: 200, y: 50, icon: 'make', color: 'from-pink-500 to-rose-600' },
    { id: 'ai', label: 'KI', x: 200, y: 150, icon: 'ai', color: 'from-emerald-500 to-teal-600' },
    { id: 'airtable', label: 'Airtable', x: 340, y: 100, icon: 'airtable', color: 'from-purple-500 to-violet-600' },
    { id: 'slack', label: 'Slack', x: 480, y: 50, icon: 'slack', color: 'from-amber-500 to-orange-600' },
    { id: 'output', label: 'Output', x: 480, y: 150, icon: 'output', color: 'from-green-500 to-emerald-600' },
  ];

  const connections = [
    { from: 'trigger', to: 'make', delay: 0 },
    { from: 'trigger', to: 'ai', delay: 0.3 },
    { from: 'make', to: 'airtable', delay: 0.8 },
    { from: 'ai', to: 'airtable', delay: 1.1 },
    { from: 'airtable', to: 'slack', delay: 1.8 },
    { from: 'airtable', to: 'output', delay: 2.1 },
  ];

  const getNodeById = (id: string) => nodes.find(n => n.id === id);

  return (
    <div ref={ref} className="relative w-full h-[350px]">
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slower" />
      </div>

      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 540 200" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="lineGradientDark" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#a855f7" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.3" />
          </linearGradient>
          <filter id="glowDark" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {connections.map((conn, index) => {
          const fromNode = getNodeById(conn.from);
          const toNode = getNodeById(conn.to);
          if (!fromNode || !toNode) return null;

          const midX = (fromNode.x + toNode.x) / 2;
          const midY = (fromNode.y + toNode.y) / 2;
          const curveOffset = Math.abs(fromNode.y - toNode.y) > 20 ? 0 : 15;

          return (
            <g key={index}>
              <path
                d={`M ${fromNode.x} ${fromNode.y} Q ${midX} ${midY - curveOffset} ${toNode.x} ${toNode.y}`}
                fill="none"
                stroke="url(#lineGradientDark)"
                strokeWidth="2"
                strokeLinecap="round"
                className={`transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                style={{ transitionDelay: `${conn.delay * 500}ms` }}
              />
              <circle r="4" fill="#c084fc" filter="url(#glowDark)">
                <animateMotion
                  dur="2s"
                  repeatCount="indefinite"
                  begin={`${conn.delay}s`}
                  path={`M ${fromNode.x} ${fromNode.y} Q ${midX} ${midY - curveOffset} ${toNode.x} ${toNode.y}`}
                />
                <animate attributeName="opacity" values="0;1;1;0" dur="2s" repeatCount="indefinite" begin={`${conn.delay}s`} />
              </circle>
            </g>
          );
        })}
      </svg>

      {nodes.map((node, index) => (
        <div
          key={node.id}
          className={`absolute transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
          style={{
            left: `${(node.x / 540) * 100}%`,
            top: `${(node.y / 200) * 100}%`,
            transform: 'translate(-50%, -50%)',
            transitionDelay: `${index * 150}ms`,
          }}
        >
          <div className="group relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${node.color} rounded-xl blur-md opacity-40 group-hover:opacity-60 animate-pulse`} />
            <div className={`relative w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br ${node.color} rounded-xl shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform cursor-pointer`}>
              {node.icon === 'trigger' && <Zap className="w-6 h-6 text-white" />}
              {node.icon === 'make' && <Workflow className="w-6 h-6 text-white" />}
              {node.icon === 'ai' && <Bot className="w-6 h-6 text-white" />}
              {node.icon === 'airtable' && <Layers className="w-6 h-6 text-white" />}
              {node.icon === 'slack' && <Mail className="w-6 h-6 text-white" />}
              {node.icon === 'output' && <Check className="w-6 h-6 text-white" />}
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="text-xs font-semibold text-gray-400 bg-gray-900/80 backdrop-blur-sm px-2 py-0.5 rounded-full">
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
// AGENCY AUTOMATION FLOW - For Final CTA
// ============================================
const AgencyAutomationFlow = () => {
  const { ref, isVisible } = useScrollAnimation();

  // Platform icons as SVG components
  const LinkedInIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );

  const UpworkIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.702-2.704 2.702zm0-8.14c-2.539 0-4.51 1.649-5.31 4.366-1.22-1.834-2.148-4.036-2.687-5.892H7.828v7.112c-.002 1.406-1.141 2.546-2.547 2.548-1.405-.002-2.543-1.143-2.545-2.548V3.492H0v7.112c0 2.914 2.37 5.303 5.281 5.303 2.913 0 5.283-2.389 5.283-5.303v-1.19c.529 1.107 1.182 2.229 1.974 3.221l-1.673 7.873h2.797l1.213-5.71c1.063.679 2.285 1.109 3.686 1.109 3 0 5.439-2.452 5.439-5.45 0-3-2.439-5.439-5.439-5.439z"/>
    </svg>
  );

  const HubSpotIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.164 7.93V5.084a2.198 2.198 0 001.267-1.984v-.066A2.2 2.2 0 0017.235.838h-.066a2.2 2.2 0 00-2.196 2.196v.066c0 .873.52 1.626 1.267 1.984V7.93a6.154 6.154 0 00-3.024 1.465l-8.02-6.239a2.078 2.078 0 00.069-.509A2.118 2.118 0 103.118 4.77c0 .593.25 1.128.65 1.51L3.14 7.142a6.103 6.103 0 00-1.854 4.38c0 1.685.683 3.21 1.787 4.32l-.64.84a2.105 2.105 0 00-.84-.178A2.118 2.118 0 00.477 18.62a2.118 2.118 0 002.116 2.117c.737 0 1.399-.38 1.78-.96l.74-.01a6.17 6.17 0 003.606 1.168 6.17 6.17 0 006.168-6.168 6.126 6.126 0 00-1.36-3.85l5.06 3.92a2.08 2.08 0 00-.07.532 2.118 2.118 0 102.117-2.117 2.09 2.09 0 00-.69.118l-4.827-3.75a6.126 6.126 0 003.046-1.702zm-9.225 7.383a3.064 3.064 0 01-3.06-3.061 3.064 3.064 0 013.06-3.06 3.064 3.064 0 013.06 3.06 3.064 3.064 0 01-3.06 3.06z"/>
    </svg>
  );

  const SlackIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
    </svg>
  );

  return (
    <div ref={ref} className="relative">
      {/* Container with soft gradient background */}
      <div className="relative bg-gradient-to-br from-[#12121a] via-[#0f0f16] to-[#0a0a10] rounded-2xl border border-white/[0.06] p-6 md:p-10 overflow-hidden">

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="w-full h-full" style={{
            backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Soft glow spots */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl" />


        {/* Workflow Diagram - Horizontal Flow */}
        <div className="relative overflow-x-auto pb-4">
          <div className="flex items-center justify-center gap-2 md:gap-4 min-w-max px-4">

            {/* Step 1: Anfrage */}
            <div
              className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
              style={{ transitionDelay: '0ms' }}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="relative group">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl scale-125 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-400/30 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <span className="text-xs text-gray-400 font-medium">Anfrage</span>
              </div>
            </div>

            {/* Arrow */}
            <div
              className={`transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
              style={{ transitionDelay: '200ms' }}
            >
              <ArrowRight className="w-5 h-5 text-gray-600" />
            </div>

            {/* Step 2: KI-Analyse */}
            <div
              className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
              style={{ transitionDelay: '300ms' }}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="relative group">
                  <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl scale-125 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-400/30 rounded-full flex items-center justify-center">
                    <Bot className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
                <span className="text-xs text-gray-400 font-medium">KI-Analyse</span>
              </div>
            </div>

            {/* Arrow */}
            <div
              className={`transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
              style={{ transitionDelay: '500ms' }}
            >
              <ArrowRight className="w-5 h-5 text-gray-600" />
            </div>

            {/* Step 3: Onboarding */}
            <div
              className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
              style={{ transitionDelay: '600ms' }}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="relative group">
                  <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl scale-125 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-400/30 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>
                <span className="text-xs text-gray-400 font-medium">Onboarding</span>
              </div>
            </div>

            {/* Arrow */}
            <div
              className={`transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
              style={{ transitionDelay: '800ms' }}
            >
              <ArrowRight className="w-5 h-5 text-gray-600" />
            </div>

            {/* Step 4: Projekt */}
            <div
              className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
              style={{ transitionDelay: '900ms' }}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="relative group">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl scale-125 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-400/30 rounded-full flex items-center justify-center">
                    <Layers className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>
                <span className="text-xs text-gray-400 font-medium">Projekt</span>
              </div>
            </div>

            {/* Arrow */}
            <div
              className={`transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
              style={{ transitionDelay: '1100ms' }}
            >
              <ArrowRight className="w-5 h-5 text-gray-600" />
            </div>

            {/* Step 5: Reporting */}
            <div
              className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
              style={{ transitionDelay: '1200ms' }}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="relative group">
                  <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl scale-125 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-400/30 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
                <span className="text-xs text-gray-400 font-medium">Reporting</span>
              </div>
            </div>

            {/* Arrow */}
            <div
              className={`transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
              style={{ transitionDelay: '1400ms' }}
            >
              <ArrowRight className="w-5 h-5 text-gray-600" />
            </div>

            {/* Step 6: Rechnung */}
            <div
              className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
              style={{ transitionDelay: '1500ms' }}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="relative group">
                  <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl scale-125 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-400/30 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-400" />
                  </div>
                </div>
                <span className="text-xs text-gray-400 font-medium">Rechnung</span>
              </div>
            </div>
          </div>

          {/* Tool Icons below - showing connected tools */}
          <div
            className={`flex justify-center gap-3 mt-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: '1700ms' }}
          >
            {[
              { icon: <HubSpotIcon className="w-4 h-4" />, color: "text-orange-400" },
              { icon: <SlackIcon className="w-4 h-4" />, color: "text-pink-400" },
              { icon: <LinkedInIcon className="w-4 h-4" />, color: "text-blue-400" },
              { icon: <UpworkIcon className="w-4 h-4" />, color: "text-green-400" },
            ].map((tool, i) => (
              <div key={i} className={`w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center ${tool.color}`}>
                {tool.icon}
              </div>
            ))}
            <span className="text-[10px] text-gray-500 self-center ml-2">+12 weitere Tools</span>
          </div>
        </div>

      </div>
    </div>
  );
};

// ============================================
// ICON MAPPER
// ============================================
const getIcon = (iconName: string, className: string = "w-6 h-6") => {
  const icons: Record<string, React.ReactNode> = {
    TrendingDown: <TrendingDown className={className} />,
    TrendingUp: <TrendingUp className={className} />,
    User: <User className={className} />,
    Clock: <Clock className={className} />,
    Layers: <Layers className={className} />,
    AlertTriangle: <AlertTriangle className={className} />,
    XCircle: <XCircle className={className} />,
    DollarSign: <DollarSign className={className} />,
    Zap: <Zap className={className} />,
    Search: <Search className={className} />,
    PenTool: <PenTool className={className} />,
    Rocket: <Rocket className={className} />,
    Code: <Code className={className} />,
    Headphones: <Headphones className={className} />,
    Phone: <Phone className={className} />,
    Target: <Target className={className} />,
    FileText: <FileText className={className} />,
    Shield: <Shield className={className} />,
    Eye: <Eye className={className} />,
    Flame: <Flame className={className} />,
    RefreshCw: <RefreshCw className={className} />,
    Users: <Users className={className} />,
  };
  return icons[iconName] || <Zap className={className} />;
};

// ============================================
// MAIN COMPONENT
// ============================================
export const HomePageV3 = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeServiceTab, setActiveServiceTab] = useState(0);
  const allTools = [...tools, ...tools];

  return (
    <div className="bg-[#0a0a0e] text-gray-100 min-h-screen overflow-x-hidden antialiased">
      {/* ============================================ */}
      {/* NAVBAR */}
      {/* ============================================ */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-4 mt-4">
          <div className="max-w-7xl mx-auto bg-gray-900/70 backdrop-blur-xl rounded-2xl border border-gray-800/50 shadow-2xl px-6 py-3">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">{siteConfig.name}</span>
              </Link>

              <div className="hidden md:flex items-center gap-1">
                {['System', 'Leistungen', 'Team', 'FAQ'].map((item) => (
                  <a key={item} href={`#${item.toLowerCase()}`} className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all font-medium text-sm">
                    {item}
                  </a>
                ))}
              </div>

              <Link to="/kostenlose-beratung" className="group bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all hover:-translate-y-0.5 flex items-center gap-2">
                Prozess-Analyse
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
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-purple-600/20 via-purple-600/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-purple-600/15 via-purple-600/5 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-full text-sm font-medium mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                </span>
                <span className="text-gray-300">{siteConfig.eyebrow}</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-8 tracking-tight">
                <span className="text-white">{siteConfig.title.split(' ').slice(0, 2).join(' ')}</span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-purple-400 to-purple-500 bg-clip-text text-transparent">
                  {siteConfig.title.split(' ').slice(2).join(' ')}
                </span>
              </h1>

              <p className="text-lg md:text-xl text-white leading-relaxed mb-8 max-w-xl">{siteConfig.tagline}</p>

              <ul className="space-y-4 mb-10">
                {siteConfig.bulletPoints.slice(0, 3).map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Check className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-white md:text-base">{point}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-4 mb-10">
                <Link to="/kostenlose-beratung" className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg overflow-hidden transition-all hover:shadow-2xl hover:shadow-purple-500/30 hover:-translate-y-1">
                  <span className="relative z-10">{siteConfig.cta.text}</span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-gray-900" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-400"><span className="font-semibold text-white">47+</span> Agenturen</span>
                </div>
                <div className="h-6 w-px bg-gray-700" />
                <div className="flex items-center gap-1.5">
                  {[1,2,3,4,5].map((i) => (<Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />))}
                  <span className="text-sm text-gray-400 ml-1"><span className="font-semibold text-white">4.9</span>/5</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-800/50 overflow-hidden p-6">
                <AnimatedWorkflow />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <MousePointer className="w-5 h-5 text-gray-600 animate-bounce" />
          <span className="text-xs text-gray-600 uppercase tracking-widest">Scroll</span>
        </div>
      </section>

      {/* ============================================ */}
      {/* LOGOS MARQUEE */}
      {/* ============================================ */}
      <section className="py-16 border-y border-gray-800/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-10">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-gray-500">Wir arbeiten mit führenden Tools</p>
        </div>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a0a0e] to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a0a0e] to-transparent z-10" />
          <div className="flex animate-marquee">
            {allTools.map((tool, index) => (
              <div key={`${tool.name}-${index}`} className="flex-shrink-0 mx-12 flex items-center justify-center">
                <img src={tool.logo} alt={tool.name} className="h-8 w-auto object-contain opacity-40 hover:opacity-80 transition-all duration-300 brightness-0 invert" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* METRICS */}
      {/* ============================================ */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <StaggeredContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4" staggerDelay={100}>
            {trustMetrics.metrics.map((metric, index) => (
              <div key={index} className="group bg-gray-900/50 rounded-3xl p-8 border border-gray-800/50 hover:border-purple-500/30 hover:bg-gray-900/80 transition-all duration-300 hover:-translate-y-1">
                <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-purple-400 bg-clip-text text-transparent mb-2">{metric.value}</p>
                <p className="text-gray-400 font-medium text-sm">{metric.label}</p>
              </div>
            ))}
          </StaggeredContainer>
        </div>
      </section>

      {/* ============================================ */}
      {/* EMPATHY OPENING - Von Hauptseite */}
      {/* ============================================ */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <AnimatedSection className="text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-12 leading-tight">
              Du arbeitest härter als je zuvor. Und trotzdem bleibt am Monatsende nicht mehr übrig?
            </h2>

            {/* Das Grundproblem - Flow Diagramm */}
            <div className="relative mb-12">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-red-500/10 to-red-500/5 rounded-2xl blur-xl" />
              <div className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 md:p-10">
                <p className="text-sm font-semibold text-red-400 uppercase tracking-widest mb-6 text-center">Das Grundproblem</p>

                <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 mb-8">
                  {["Mehr Kunden", "Mehr Arbeit", "Mehr Kosten", "Weniger Umsatzrendite"].map((step, index) => (
                    <div key={index} className="flex items-center gap-3 md:gap-4">
                      <div className={`px-4 py-3 rounded-lg font-medium text-center min-w-[140px] ${index === 3 ? "bg-red-500/20 border-2 border-red-500/50 text-red-400" : "bg-gray-800/50 border border-gray-700/50 text-gray-300"}`}>
                        {step}
                      </div>
                      {index < 3 && <ArrowRight className="w-5 h-5 text-gray-600 hidden md:block" />}
                      {index < 3 && <span className="text-gray-600 md:hidden">→</span>}
                    </div>
                  ))}
                </div>

                <div className="text-center space-y-4 mb-6">
                  <p className="text-lg md:text-xl text-gray-400 leading-relaxed">Fressen deine Kosten alles auf, sodass am Ende kaum mehr übrig bleibt als vorher?</p>
                  <p className="text-lg md:text-xl text-gray-400 leading-relaxed">Hast du mit jedem neuen Kunden mehr Stress statt mehr Freiheit?</p>
                </div>

                <div className="text-center">
                  <p className="text-lg md:text-xl text-white">Das ist kein Fleiß-Problem. Das ist ein <span className="text-purple-400 font-semibold">System-Problem</span>. Und es lässt sich lösen.</p>
                </div>
              </div>
            </div>

            {/* Die Lösung */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-purple-500/20 to-purple-500/10 rounded-2xl blur-xl" />
              <div className="relative bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/30 rounded-2xl p-6 md:p-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/20 mb-4">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <p className="text-2xl md:text-3xl font-semibold text-white mb-4">KI-Automation durchbricht diesen Kreislauf.</p>
                <div className="text-gray-400 text-lg space-y-1">
                  <p>Ohne zusätzliche Mitarbeiter.</p>
                  <p>Ohne monatelange Einrichtung.</p>
                  <p>Ohne dass du deine Prozesse komplett umstellen musst.</p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Gradient Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
      </div>

      {/* ============================================ */}
      {/* PROBLEM MIRROR */}
      {/* ============================================ */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-red-500/10 text-red-400 rounded-full text-sm font-semibold mb-4 border border-red-500/20">Das Problem</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">{problemSection.headline}</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">{problemSection.subheadline}</p>
          </AnimatedSection>

          <StaggeredContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={100}>
            {problemSection.problems.map((problem, index) => (
              <div key={index} className="group bg-gray-900/50 p-8 rounded-3xl border border-gray-800/50 hover:border-red-500/30 transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {getIcon(problem.icon, "w-7 h-7 text-red-400")}
                </div>
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">{problem.label}</span>
                <h3 className="text-xl font-bold text-white mt-2 mb-3">{problem.title}</h3>
                <p className="text-gray-400 leading-relaxed">{problem.description}</p>
              </div>
            ))}
          </StaggeredContainer>
        </div>
      </section>

      {/* ============================================ */}
      {/* SOLUTION PREVIEW - V2 Style mit Grafiken */}
      {/* ============================================ */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-20">
            <span className="inline-block px-4 py-2 bg-purple-500/10 text-purple-400 rounded-full text-sm font-semibold mb-4 border border-purple-500/20">Die Lösung</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">{solutionPreview.headline}</h2>
          </AnimatedSection>

          <div className="space-y-32">
            {solutionPreview.benefits.map((benefit, index) => (
              <AnimatedSection key={index}>
                <div className={`grid lg:grid-cols-2 gap-16 items-center`}>
                  <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 rounded-full text-purple-400 text-sm font-semibold mb-6 border border-purple-500/20">
                      <Sparkles className="w-4 h-4" />
                      Vorteil {index + 1}
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">{benefit.title}</h3>
                    <p className="text-lg text-gray-400 mb-8 leading-relaxed">{benefit.description}</p>
                  </div>
                  <div className={`relative ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-[2.5rem] blur-2xl opacity-60 scale-95" />
                    <div className="relative bg-gradient-to-br from-gray-900 to-gray-900/80 rounded-[2rem] p-8 border border-gray-800/50">
                      <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                        <SolutionPreviewGraphic index={index} />
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

        </div>
      </section>

      {/* ============================================ */}
      {/* FLOWSTACK SYSTEM */}
      {/* ============================================ */}
      <section id="system" className="py-24 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-purple-500/10 text-purple-400 rounded-full text-sm font-semibold mb-4 border border-purple-500/20">Der Prozess</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">{flowstackSystem.headline}</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">{flowstackSystem.subheadline}</p>
          </AnimatedSection>

          <StaggeredContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={150}>
            {flowstackSystem.stages.map((stage, index) => (
              <div key={index} className="relative group">
                {index < flowstackSystem.stages.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-purple-500/50 to-purple-500/10" />
                )}
                <div className="bg-gray-900/50 p-8 rounded-3xl border border-gray-800/50 hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-2 h-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">{stage.number}</div>
                  <span className="inline-block px-3 py-1 bg-gray-800 text-gray-400 text-xs font-semibold rounded-full mb-4">{stage.duration}</span>
                  <h3 className="text-xl font-bold text-white mb-2">{stage.subtitle}</h3>
                  <p className="text-gray-400 mb-6 text-sm">{stage.description}</p>
                  <ul className="space-y-3">
                    {stage.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                        <Check className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  {stage.result && (
                    <div className="mt-6 pt-6 border-t border-gray-800">
                      <p className="text-sm text-purple-400 font-semibold">{stage.result}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </StaggeredContainer>
        </div>
      </section>

      {/* ============================================ */}
      {/* CTA INLINE #1 */}
      {/* ============================================ */}
      <section className="py-24 bg-gradient-to-b from-purple-950/30 via-[#0a0a0e] to-[#0a0a0e] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px]" />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Content */}
              <div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                  Der beste Zeitpunkt war gestern.
                </h2>
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-purple-400 mb-8">
                  Der zweitbeste ist jetzt.
                </h3>
                <p className="text-xl text-gray-400 mb-8">In 15-20 Minuten weißt du:</p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Check className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-white text-lg">Welche 3 Prozesse du zuerst automatisieren solltest</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Check className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-white text-lg">Wie viel Umsatzrendite realistisch drin ist</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Check className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-white text-lg">Ob wir die Richtigen für dich sind</span>
                  </li>
                </ul>
              </div>

              {/* Right: CTA Card */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-[2rem] blur-xl" />
                <div className="relative bg-gray-900/80 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 md:p-10">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full text-purple-400 text-sm font-semibold mb-6 border border-purple-500/20">
                      <Clock className="w-4 h-4" />
                      Nur wenige Plätze pro Monat
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-4">Kostenlose Prozess-Analyse</h4>
                    <p className="text-gray-400 mb-8">Finde heraus, wie viel Potenzial in deiner Agentur steckt.</p>
                    <Link to="/kostenlose-beratung" className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-5 rounded-xl font-semibold text-lg transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/30">
                      Jetzt Termin wählen
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                    <p className="mt-6 text-gray-500 text-sm">Kostenlos und unverbindlich</p>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================ */}
      {/* OUTCOMES - Von Hauptseite */}
      {/* ============================================ */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-full text-sm font-semibold mb-4 border border-emerald-500/20">Der Unterschied</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">{outcomes.headline}</h2>
          </AnimatedSection>

          <AnimatedSection>
            <div className="rounded-2xl border border-gray-800/50 overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-[1fr_auto_1fr] bg-gray-900/80">
                <div className="p-5">
                  <div className="flex items-center gap-2 justify-center">
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                    <span className="font-medium text-gray-400">Manueller Betrieb</span>
                  </div>
                </div>
                <div className="flex items-center justify-center px-4">
                  <div className="bg-gray-800 border border-purple-500/30 rounded-full p-2">
                    <ArrowRight className="w-5 h-5 text-purple-400" />
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 justify-center">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <span className="font-medium text-purple-400">Mit Flowstack</span>
                  </div>
                </div>
              </div>

              {/* Rows */}
              {outcomes.comparison.map((row, index) => (
                <div key={index} className="grid grid-cols-2 border-t border-gray-800/50">
                  <div className="p-5 lg:p-6 border-r border-gray-800/50 bg-amber-950/10 hover:bg-amber-950/20 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 rounded-xl bg-amber-900/30 flex-shrink-0">
                        {getIcon(row.right.icon, "w-5 h-5 text-amber-400")}
                      </div>
                      <div>
                        <p className="font-medium text-gray-300">{row.right.title} <span className="text-amber-400">{row.right.highlight}</span></p>
                        <p className="text-sm text-gray-500 mt-1">{row.right.subtitle}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 lg:p-6 bg-purple-500/5 hover:bg-purple-500/10 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 rounded-xl bg-purple-500/20 flex-shrink-0">
                        {getIcon(row.left.icon, "w-5 h-5 text-purple-400")}
                      </div>
                      <div>
                        <p className="font-medium text-white">{row.left.title} <span className="text-purple-400">{row.left.highlight}</span></p>
                        <p className="text-sm text-gray-500 mt-1">{row.left.subtitle}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Section */}
            <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-8 md:p-10 mt-8">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-semibold text-white">{outcomes.stats.headline}</h3>
              </div>
              <ul className="grid md:grid-cols-2 gap-4">
                {outcomes.stats.items.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-purple-400 font-bold">→</span>
                    <span className="text-gray-400">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================ */}
      {/* TARGET AUDIENCE - 2-Spalten Layout */}
      {/* ============================================ */}
      <section className="py-24 bg-gray-900/30">
        <div className="max-w-5xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">{targetAudience.headline}</h2>
          </AnimatedSection>

          <AnimatedSection>
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Links: Für dich geeignet (Grün/Purple) */}
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-purple-500/30 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative p-8 md:p-10 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 h-full">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-400 text-sm font-semibold rounded-full mb-6">
                    <Sparkles className="w-4 h-4" />
                    Für dich geeignet
                  </div>
                  <p className="text-gray-400 mb-8">{targetAudience.subheadline}</p>
                  <ul className="space-y-5">
                    {targetAudience.requirements.map((item, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className="p-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30 mt-0.5 flex-shrink-0">
                          <Check className="w-4 h-4 text-purple-400" />
                        </div>
                        <span className="text-gray-300 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Rechts: Nicht für dich geeignet (Rot) */}
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-500/10 via-red-500/20 to-red-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative p-8 md:p-10 rounded-2xl border border-red-400/20 bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent backdrop-blur-sm hover:border-red-400/40 transition-all duration-300 h-full">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-400/30 text-red-400 text-sm font-semibold rounded-full mb-6">
                    <ShieldX className="w-4 h-4" />
                    Nicht für dich geeignet
                  </div>
                  <p className="text-gray-400 mb-8">Das Flowstack-System ist nicht das Richtige, wenn:</p>
                  <ul className="space-y-5">
                    {targetAudience.notFor.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-400/30 mt-0.5 flex-shrink-0">
                          <X className="w-4 h-4 text-red-400" />
                        </div>
                        <span className="text-gray-400 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <p className="text-lg text-gray-400 mb-6">{targetAudience.cta.text}</p>
              <Link to="/kostenlose-beratung" className="inline-flex items-center gap-3 bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/20">
                {targetAudience.cta.button}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================ */}
      {/* SERVICES - Hochwertig mit Tabs und Icons */}
      {/* ============================================ */}
      <section id="leistungen" className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <AnimatedSection className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-purple-500/10 text-purple-400 rounded-full text-sm font-semibold mb-4 border border-purple-500/20">Leistungen</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">{services.headline}</h2>
          </AnimatedSection>

          <AnimatedSection>
            {/* Tab Navigation */}
            <div className="flex overflow-x-auto pb-2 gap-2 md:gap-3 px-2 md:px-0 md:flex-wrap md:justify-center mb-8">
              {services.items.map((service, index) => (
                <button
                  key={service.title}
                  onClick={() => setActiveServiceTab(index)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                    activeServiceTab === index
                      ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                      : "bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white"
                  }`}
                >
                  {getIcon(service.icon, "w-4 h-4")}
                  <span className="hidden sm:inline">{service.title}</span>
                  <span className="sm:hidden">{service.title.split(" ")[0]}</span>
                </button>
              ))}
            </div>

            {/* Active Tab Content */}
            <div className="rounded-2xl border border-gray-800/50 bg-gray-900/50 p-6 md:p-10">
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6">
                    {getIcon(services.items[activeServiceTab]?.icon, "w-7 h-7 text-purple-400")}
                  </div>
                  <h3 className="text-xl md:text-2xl font-medium text-white mb-3">{services.items[activeServiceTab]?.title}</h3>
                  <Link to="/kostenlose-beratung" className="group inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold mt-4 transition-all">
                    Mehr erfahren
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                <div className="bg-gray-800/30 rounded-xl p-5 md:p-6">
                  <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Was enthalten ist</p>
                  <ul className="space-y-3">
                    {services.items[activeServiceTab]?.items?.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="p-1 rounded-full bg-purple-500/20 mt-0.5">
                          <Check className="w-3.5 h-3.5 text-purple-400" />
                        </div>
                        <span className="text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================ */}
      {/* TIMELINE - Hochwertig */}
      {/* ============================================ */}
      <section className="py-24 bg-gray-900/30">
        <div className="max-w-3xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white">{timeline.headline}</h2>
          </AnimatedSection>

          <div className="space-y-6">
            {timeline.steps.map((step, index) => {
              const isLast = index === timeline.steps.length - 1;
              return (
                <AnimatedSection key={index} delay={index * 100}>
                  <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-6 hover:border-purple-500/30 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                          {getIcon(step.icon, "w-6 h-6 text-white")}
                        </div>
                        <span className="text-xs font-semibold text-purple-400 mt-2">SCHRITT {index + 1}</span>
                      </div>
                      <div className="flex-1 pt-1">
                        <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                        <p className="text-gray-400">{step.description}</p>
                      </div>
                    </div>
                  </div>
                  {!isLast && (
                    <div className="flex justify-center py-2">
                      <ArrowDown className="w-5 h-5 text-purple-500/50" />
                    </div>
                  )}
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* ABOUT / TEAM - LP Style */}
      {/* ============================================ */}
      <section id="team" className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text + Stats */}
            <AnimatedSection>
              <h2 className="text-2xl md:text-4xl font-bold mb-6 leading-tight text-white">WER SIND WIR, UM SO ETWAS ANZUBIETEN?</h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-10">
                Wir sind keine Theoretiker. Wir sind Praktiker, die selbst Agenturen aufgebaut und die typischen Wachstumsschmerzen am eigenen Leib erfahren haben. Diese Systeme nutzen wir selbst jeden Tag — und jetzt bauen wir sie für dich.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="group bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all">
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent mb-1">80%</div>
                  <div className="text-gray-400 text-sm">weniger Routinearbeit möglich</div>
                </div>
                <div className="group bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all">
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent mb-1">2-4</div>
                  <div className="text-gray-400 text-sm">Wochen bis dein System live ist</div>
                </div>
                <div className="group bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all">
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent mb-1">30-50%</div>
                  <div className="text-gray-400 text-sm">mehr Umsatzrendite durch Automation</div>
                </div>
                <div className="group bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all">
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent mb-1">0</div>
                  <div className="text-gray-400 text-sm">zusätzliche Mitarbeiter nötig</div>
                </div>
              </div>
            </AnimatedSection>

            {/* Right: Team Photos */}
            <AnimatedSection delay={200}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-2xl blur-xl" />
                <div className="relative bg-gradient-to-br from-purple-900/30 to-gray-900 rounded-2xl border border-gray-800/50 p-6 md:p-8">
                  <div className="space-y-6">
                    {teamContent.members.map((member, index) => (
                      <div key={index} className="flex gap-4 md:gap-5">
                        {/* Photo */}
                        <div className="flex-shrink-0">
                          <img
                            src={member.image}
                            alt={member.name}
                            className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover object-top ring-2 ring-purple-500/30"
                          />
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white text-sm md:text-base">{member.name}</h3>
                          <p className="text-purple-400 text-xs md:text-sm mb-2">{member.role}</p>
                          <p className="text-gray-500 text-xs leading-relaxed whitespace-pre-line line-clamp-3 md:line-clamp-4">
                            {member.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FAQ */}
      {/* ============================================ */}
      <section id="faq" className="py-24 bg-gray-900/30">
        <div className="max-w-3xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-gray-800 text-gray-400 rounded-full text-sm font-semibold mb-4">FAQ</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Häufig gestellte Fragen</h2>
          </AnimatedSection>

          <AnimatedSection>
            <div className="space-y-4">
              {faqItems.map((faq, index) => (
                <div key={index} className="bg-gray-900/50 rounded-2xl border border-gray-800/50 overflow-hidden hover:border-gray-700 transition-all">
                  <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="w-full flex items-center justify-between p-6 text-left">
                    <span className="font-semibold text-white pr-4">{faq.question}</span>
                    <div className={`w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${openFaq === index ? 'bg-purple-500/20 rotate-180' : ''}`}>
                      <ChevronDown className={`w-5 h-5 transition-colors ${openFaq === index ? 'text-purple-400' : 'text-gray-500'}`} />
                    </div>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-96' : 'max-h-0'}`}>
                    <div className="px-6 pb-6 text-gray-400 leading-relaxed">{faq.answer}</div>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================ */}
      {/* FINAL CTA - Premium Style */}
      {/* ============================================ */}
      <section className="py-24 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0e] via-purple-950/20 to-[#0a0a0e]" />
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          {/* Header */}
          <AnimatedSection className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-purple-500/10 text-purple-400 rounded-full text-sm font-semibold mb-6 border border-purple-500/20">
              Limitierte Plätze
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Bereit herauszufinden, wie viel
            </h2>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-purple-400 mb-6">
              Potenzial in deiner Agentur steckt?
            </h3>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {finalCta.subheadline}
            </p>
          </AnimatedSection>

          {/* Two Column Layout */}
          <AnimatedSection>
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Left: Agency Automation Flow */}
              <div className="order-2 lg:order-1">
                <AgencyAutomationFlow />
              </div>

              {/* Right: Content + CTA */}
              <div className="order-1 lg:order-2">
                <div className="bg-gray-900/50 rounded-3xl p-8 lg:p-10 border border-gray-800/50 backdrop-blur-sm">
                  <h4 className="text-xl font-bold text-white mb-6">Das erwartet dich:</h4>
                  <ul className="space-y-4 mb-8">
                    {finalCta.bullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                          <Check className="w-3 h-3 text-purple-400" />
                        </div>
                        <span className="text-gray-300">{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/kostenlose-beratung"
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-5 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-purple-500/30 transition-all hover:-translate-y-1"
                  >
                    {finalCta.cta.text}
                    <ArrowRight className="w-5 h-5" />
                  </Link>

                  <div className="mt-6 pt-6 border-t border-gray-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div className="text-gray-500 text-sm">
                      <span className="block text-lg mb-1">🔒</span>
                      100% kostenlos
                    </div>
                    <div className="text-gray-500 text-sm">
                      <span className="block text-lg mb-1">📞</span>
                      Persönlicher Call
                    </div>
                    <div className="text-gray-500 text-sm">
                      <span className="block text-lg mb-1">⏱️</span>
                      3-4 Plätze/Woche
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================ */}
      {/* FOOTER */}
      {/* ============================================ */}
      <footer className="bg-[#050508] text-white py-20 border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">{siteConfig.name}</span>
              </div>
              <p className="text-gray-400 mb-8 max-w-sm leading-relaxed">Wir automatisieren operative Prozesse in B2B-Unternehmen und Agenturen mit KI-gestützten Systemen.</p>
              <div className="inline-flex items-center gap-3 bg-gray-900/50 rounded-xl px-4 py-3 border border-gray-800">
                <div className="flex gap-0.5">{[1,2,3,4,5].map((i) => (<Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />))}</div>
                <span className="text-sm font-medium text-gray-300">4.9/5 Rating</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-6">Produkt</h4>
              <ul className="space-y-4 text-gray-400">
                <li><a href="#system" className="hover:text-white transition-colors">System</a></li>
                <li><a href="#leistungen" className="hover:text-white transition-colors">Leistungen</a></li>
                <li><a href="#team" className="hover:text-white transition-colors">Team</a></li>
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
            <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} {siteConfig.name}. Alle Rechte vorbehalten.</p>
            <div className="flex items-center gap-4">
              <a href="https://linkedin.com" className="w-10 h-10 bg-gray-800/50 rounded-xl flex items-center justify-center hover:bg-gray-700 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Animations */}
      <style>{`
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
        .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
        .animate-pulse-slower { animation: pulse-slower 10s ease-in-out infinite; }
        .animate-marquee { animation: marquee 30s linear infinite; }
      `}</style>
    </div>
  );
};

export default HomePageV3;
