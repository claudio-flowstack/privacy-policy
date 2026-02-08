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
  Menu,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

// ============================================
// SCROLL ANIMATION HOOKS
// ============================================
const useScrollAnimation = (disableOnMobile = true) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && disableOnMobile) {
        setIsVisible(true); // Show immediately on mobile
      }
    };
    checkMobile();

    if (isMobile && disableOnMobile) return;

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
  }, [isMobile, disableOnMobile]);

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
        <div className="relative">
          {/* Donut Chart - 80% Automated */}
          <div className="relative w-32 h-32 mx-auto">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              {/* Background circle */}
              <circle cx="18" cy="18" r="14" fill="none" stroke="#374151" strokeWidth="4" />
              {/* Animated progress circle - 80% */}
              <circle
                cx="18" cy="18" r="14"
                fill="none"
                stroke="url(#donutGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={isVisible ? "70.4, 100" : "0, 100"}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="donutGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white">80%</span>
              <span className="text-[10px] text-gray-400">automatisiert</span>
            </div>
          </div>
          {/* Legend */}
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400">KI übernimmt</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-gray-400">Dein Fokus</span>
            </div>
          </div>
        </div>
      )}
      {index === 2 && (
        <div className="grid grid-cols-2 gap-4">
          <AnimatedStatCard value={5} suffix="x" label="Mehr Kunden" color="text-purple-400" isVisible={isVisible} />
          <AnimatedStatCard value={0} label="Neueinstellungen" color="text-emerald-400" isVisible={isVisible} />
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

  // Tool Icons - Real Brand Logos
  const N8nIcon = () => (
    <svg viewBox="0 0 48 48" className="w-6 h-6" fill="#FF6D5A">
      <circle cx="10" cy="24" r="6"/>
      <circle cx="38" cy="12" r="6"/>
      <circle cx="38" cy="36" r="6"/>
      <path d="M14 22 L32 14" stroke="#FF6D5A" strokeWidth="4" strokeLinecap="round"/>
      <path d="M14 26 L32 34" stroke="#FF6D5A" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  );

  const OpenAIIcon = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6">
      <path fill="#fff" d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
    </svg>
  );

  const AirtableIcon = () => (
    <svg viewBox="0 0 200 170" className="w-6 h-6">
      <path fill="#FCB400" d="M90.039 12.368L24.079 39.66c-3.667 1.519-3.63 6.729.062 8.192l66.235 26.266a24.58 24.58 0 0 0 18.12-.001l66.235-26.265c3.691-1.463 3.729-6.673.062-8.192l-65.96-27.293a24.58 24.58 0 0 0-18.794 0z"/>
      <path fill="#18BFFF" d="M105.312 88.46v65.617c0 3.12 3.147 5.258 6.048 4.108l73.806-28.648a4.42 4.42 0 0 0 2.79-4.108V59.813c0-3.121-3.147-5.258-6.048-4.108l-73.806 28.648a4.42 4.42 0 0 0-2.79 4.108z"/>
      <path fill="#F82B60" d="M88.078 91.846l-21.904 10.576-2.224 1.075-46.238 22.155c-2.93 1.414-6.672-.722-6.672-3.978V60.088c0-1.178.604-2.195 1.414-2.96a5.09 5.09 0 0 1 1.469-.915c1.96-.904 4.478-.384 6.107.967l68.048 32.837z"/>
      <path fill="#BA0F44" fillOpacity=".25" d="M88.078 91.846l-21.904 10.576-53.72-45.295a5.09 5.09 0 0 1 1.469-.915c1.96-.904 4.478-.384 6.107.967l68.048 34.667z"/>
    </svg>
  );

  const SlackIconSmall = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6">
      <path fill="#E01E5A" d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z"/>
      <path fill="#36C5F0" d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z"/>
      <path fill="#2EB67D" d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z"/>
      <path fill="#ECB22E" d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
    </svg>
  );

  const nodes = [
    { id: 'trigger', label: 'Trigger', x: 60, y: 140, icon: 'trigger', color: 'from-purple-500 to-purple-600' },
    { id: 'n8n', label: 'n8n', x: 200, y: 50, icon: 'n8n', color: 'from-slate-800 to-slate-900' },
    { id: 'ai', label: 'KI', x: 200, y: 230, icon: 'ai', color: 'from-emerald-500 to-teal-600' },
    { id: 'airtable', label: 'Airtable', x: 340, y: 140, icon: 'airtable', color: 'from-purple-500 to-violet-600' },
    { id: 'slack', label: 'Slack', x: 480, y: 50, icon: 'slack', color: 'from-gray-700 to-gray-800' },
    { id: 'output', label: 'Output', x: 480, y: 230, icon: 'output', color: 'from-green-500 to-emerald-600' },
  ];

  const connections = [
    { from: 'trigger', to: 'n8n', delay: 0 },
    { from: 'trigger', to: 'ai', delay: 0.3 },
    { from: 'n8n', to: 'airtable', delay: 0.8 },
    { from: 'ai', to: 'airtable', delay: 1.1 },
    { from: 'airtable', to: 'slack', delay: 1.8 },
    { from: 'airtable', to: 'output', delay: 2.1 },
  ];

  const getNodeById = (id: string) => nodes.find(n => n.id === id);

  return (
    <div ref={ref} className="relative w-full" style={{ aspectRatio: '540 / 280' }}>
      {/* Soft centered glow - no overflow-hidden to avoid sharp edges */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 bg-purple-500/20 rounded-full blur-[80px]" />
      </div>

      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 540 280" preserveAspectRatio="none">
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
            top: `${(node.y / 280) * 100}%`,
            transform: 'translate(-50%, -50%)',
            transitionDelay: `${index * 150}ms`,
          }}
        >
          <div className="group relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${node.color} rounded-xl blur-md opacity-40 group-hover:opacity-60 animate-pulse`} />
            <div className={`relative w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br ${node.color} rounded-xl shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform cursor-pointer`}>
              {node.icon === 'trigger' && <Zap className="w-6 h-6 text-white" />}
              {node.icon === 'n8n' && <N8nIcon />}
              {node.icon === 'ai' && <OpenAIIcon />}
              {node.icon === 'airtable' && <AirtableIcon />}
              {node.icon === 'slack' && <SlackIconSmall />}
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
// AGENCY AUTOMATION FLOW - Node-based System Diagram
// ============================================
const AgencyAutomationFlow = () => {
  const { ref, isVisible } = useScrollAnimation();

  // Tool Node Component with brand colors
  const ToolNode = ({
    icon,
    label,
    brandColor,
    delay = 0
  }: {
    icon: React.ReactNode;
    label: string;
    brandColor: string;
    delay?: number;
  }) => (
    <div
      className={`flex flex-col items-center gap-1.5 transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={`w-11 h-11 md:w-12 md:h-12 rounded-xl bg-gray-900/80 border border-gray-700/50 flex items-center justify-center hover:border-gray-600 transition-all cursor-pointer shadow-lg ${brandColor}`}>
        {icon}
      </div>
      <span className="text-[10px] text-gray-400 font-medium">{label}</span>
    </div>
  );

  // Central Hub Node
  const CentralHub = ({ delay = 0 }: { delay?: number }) => (
    <div
      className={`flex flex-col items-center transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-purple-500/40 rounded-full blur-2xl scale-150 animate-pulse" />
        <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 border-2 border-purple-400/50 flex flex-col items-center justify-center shadow-2xl shadow-purple-500/30">
          <Zap className="w-7 h-7 md:w-8 md:h-8 text-white mb-0.5" />
          <span className="text-[10px] md:text-xs text-purple-200 font-bold">Flowstack</span>
        </div>
      </div>
    </div>
  );

  // Real Tool Icons
  const LinkedInIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#0A66C2">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );

  const GmailIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path fill="#EA4335" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
    </svg>
  );

  const TypeformIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#262627">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16a.477.477 0 0 1-.073.079l-6.51 5.56-.002.002a.472.472 0 0 1-.326.112.476.476 0 0 1-.334-.15l-3.903-4.073a.476.476 0 0 1 .688-.659l3.561 3.716 6.168-5.27a.476.476 0 1 1 .731.683z" fill="#fff"/>
    </svg>
  );

  const CalendlyIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path fill="#006BFF" d="M19.655 14.262c0 2.312-1.888 4.201-4.201 4.201h-1.086c-.323 0-.585.262-.585.585v1.086c0 2.312-1.888 4.201-4.201 4.201-2.312 0-4.201-1.888-4.201-4.201v-1.086c0-.323-.262-.585-.585-.585H3.71c-2.312 0-4.201-1.888-4.201-4.201 0-2.312 1.888-4.201 4.201-4.201h1.086c.323 0 .585-.262.585-.585V8.39c0-2.312 1.888-4.201 4.201-4.201 2.312 0 4.201 1.888 4.201 4.201v1.086c0 .323.262.585.585.585h1.086c2.312 0 4.201 1.888 4.201 4.201z"/>
    </svg>
  );

  const SlackIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path fill="#E01E5A" d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52z"/>
      <path fill="#36C5F0" d="M6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z"/>
      <path fill="#2EB67D" d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834z"/>
      <path fill="#ECB22E" d="M8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z"/>
    </svg>
  );

  const HubSpotIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#FF7A59">
      <path d="M18.164 7.93V5.084a2.198 2.198 0 001.267-1.984v-.066A2.2 2.2 0 0017.235.838h-.066a2.2 2.2 0 00-2.196 2.196v.066c0 .873.52 1.626 1.267 1.984V7.93a6.154 6.154 0 00-3.024 1.465l-8.02-6.239a2.078 2.078 0 00.069-.509A2.118 2.118 0 103.118 4.77c0 .593.25 1.128.65 1.51L3.14 7.142a6.103 6.103 0 00-1.854 4.38c0 1.685.683 3.21 1.787 4.32l-.64.84a2.105 2.105 0 00-.84-.178A2.118 2.118 0 00.477 18.62a2.118 2.118 0 002.116 2.117c.737 0 1.399-.38 1.78-.96l.74-.01a6.17 6.17 0 003.606 1.168 6.17 6.17 0 006.168-6.168 6.126 6.126 0 00-1.36-3.85l5.06 3.92a2.08 2.08 0 00-.07.532 2.118 2.118 0 102.117-2.117 2.09 2.09 0 00-.69.118l-4.827-3.75a6.126 6.126 0 003.046-1.702z"/>
    </svg>
  );

  const NotionIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#fff">
      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.98-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.886l-15.177.887c-.56.047-.747.327-.747.933z"/>
    </svg>
  );

  const GoogleCalIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path fill="#4285F4" d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12s4.48 10 10 10 10-4.48 10-10z"/>
      <path fill="#fff" d="M12 6v6l4 2"/>
      <rect fill="#fff" x="7" y="7" width="10" height="10" rx="1"/>
      <text x="12" y="14" textAnchor="middle" fill="#4285F4" fontSize="6" fontWeight="bold">31</text>
    </svg>
  );

  return (
    <div ref={ref} className="relative">
      {/* Container */}
      <div className="relative p-4 md:p-8 overflow-hidden">

        {/* Soft Glows - hidden on mobile for performance */}
        <div className="hidden md:block absolute top-1/3 left-1/4 w-48 h-48 bg-purple-500/15 rounded-full blur-[100px]" />
        <div className="hidden md:block absolute bottom-1/3 right-1/4 w-48 h-48 bg-blue-500/15 rounded-full blur-[100px]" />

        {/* ========== MOBILE VERSION ========== */}
        <div className="md:hidden">
          {/* Input Sources - 4 columns */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <ToolNode icon={<LinkedInIcon />} label="LinkedIn" brandColor="" delay={0} />
            <ToolNode icon={<GmailIcon />} label="Gmail" brandColor="" delay={100} />
            <ToolNode icon={<TypeformIcon />} label="Typeform" brandColor="bg-gray-800" delay={200} />
            <ToolNode icon={<CalendlyIcon />} label="Calendly" brandColor="" delay={300} />
          </div>

          {/* Animated Data Flow Down */}
          <div className={`flex justify-center mb-2 transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{transitionDelay: '400ms'}}>
            <div className="relative flex flex-col items-center">
              <div className="w-0.5 h-12 bg-gradient-to-b from-purple-500/60 to-purple-500/20 rounded-full" />
              {/* Animated flowing dots */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-purple-500 rounded-full animate-flow-down" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-purple-500 rounded-full animate-flow-down" style={{animationDelay: '0.8s'}} />
            </div>
          </div>

          {/* Center - Flowstack Hub */}
          <div className="flex justify-center mb-2">
            <CentralHub delay={500} />
          </div>

          {/* Animated Data Flow Down */}
          <div className={`flex justify-center mb-4 transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{transitionDelay: '700ms'}}>
            <div className="relative flex flex-col items-center">
              <div className="w-0.5 h-12 bg-gradient-to-b from-blue-500/60 to-blue-500/20 rounded-full" />
              {/* Animated flowing dots */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full animate-flow-down" style={{animationDelay: '0.3s'}} />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full animate-flow-down" style={{animationDelay: '1.1s'}} />
            </div>
          </div>

          {/* Output Actions - 4 columns */}
          <div className="grid grid-cols-4 gap-2">
            <ToolNode icon={<HubSpotIcon />} label="HubSpot" brandColor="" delay={900} />
            <ToolNode icon={<GoogleCalIcon />} label="Calendar" brandColor="" delay={1000} />
            <ToolNode icon={<SlackIcon />} label="Slack" brandColor="" delay={1100} />
            <ToolNode icon={<NotionIcon />} label="Notion" brandColor="bg-gray-800" delay={1200} />
          </div>
        </div>

        {/* ========== DESKTOP VERSION ========== */}
        <div className="hidden md:block relative min-h-[360px]">

          {/* SVG Connection Lines with animated data flow */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lineGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="lineGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
              </linearGradient>
            </defs>

            {/* Input paths - from top tools to center */}
            <path id="path-in-0" d="M 12 8 L 50 42" fill="none" stroke="url(#lineGrad1)" strokeWidth="0.4" strokeLinecap="round" className={`transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} />
            <path id="path-in-1" d="M 37 8 L 50 42" fill="none" stroke="url(#lineGrad1)" strokeWidth="0.4" strokeLinecap="round" className={`transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{transitionDelay: '150ms'}} />
            <path id="path-in-2" d="M 63 8 L 50 42" fill="none" stroke="url(#lineGrad1)" strokeWidth="0.4" strokeLinecap="round" className={`transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{transitionDelay: '300ms'}} />
            <path id="path-in-3" d="M 88 8 L 50 42" fill="none" stroke="url(#lineGrad1)" strokeWidth="0.4" strokeLinecap="round" className={`transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{transitionDelay: '450ms'}} />

            {/* Output paths - from center to bottom tools */}
            <path id="path-out-0" d="M 50 58 L 12 92" fill="none" stroke="url(#lineGrad2)" strokeWidth="0.4" strokeLinecap="round" className={`transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{transitionDelay: '800ms'}} />
            <path id="path-out-1" d="M 50 58 L 37 92" fill="none" stroke="url(#lineGrad2)" strokeWidth="0.4" strokeLinecap="round" className={`transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{transitionDelay: '950ms'}} />
            <path id="path-out-2" d="M 50 58 L 63 92" fill="none" stroke="url(#lineGrad2)" strokeWidth="0.4" strokeLinecap="round" className={`transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{transitionDelay: '1100ms'}} />
            <path id="path-out-3" d="M 50 58 L 88 92" fill="none" stroke="url(#lineGrad2)" strokeWidth="0.4" strokeLinecap="round" className={`transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{transitionDelay: '1250ms'}} />

            {/* Animated dots flowing along input paths */}
            <circle r="1" fill="#a855f7" opacity="0.9">
              <animateMotion dur="2.5s" repeatCount="indefinite" begin="0s">
                <mpath href="#path-in-0" />
              </animateMotion>
            </circle>
            <circle r="1" fill="#a855f7" opacity="0.9">
              <animateMotion dur="2.5s" repeatCount="indefinite" begin="0.4s">
                <mpath href="#path-in-1" />
              </animateMotion>
            </circle>
            <circle r="1" fill="#a855f7" opacity="0.9">
              <animateMotion dur="2.5s" repeatCount="indefinite" begin="0.8s">
                <mpath href="#path-in-2" />
              </animateMotion>
            </circle>
            <circle r="1" fill="#a855f7" opacity="0.9">
              <animateMotion dur="2.5s" repeatCount="indefinite" begin="1.2s">
                <mpath href="#path-in-3" />
              </animateMotion>
            </circle>

            {/* Animated dots flowing along output paths */}
            <circle r="1" fill="#3b82f6" opacity="0.9">
              <animateMotion dur="2.5s" repeatCount="indefinite" begin="1.5s">
                <mpath href="#path-out-0" />
              </animateMotion>
            </circle>
            <circle r="1" fill="#3b82f6" opacity="0.9">
              <animateMotion dur="2.5s" repeatCount="indefinite" begin="1.9s">
                <mpath href="#path-out-1" />
              </animateMotion>
            </circle>
            <circle r="1" fill="#3b82f6" opacity="0.9">
              <animateMotion dur="2.5s" repeatCount="indefinite" begin="2.3s">
                <mpath href="#path-out-2" />
              </animateMotion>
            </circle>
            <circle r="1" fill="#3b82f6" opacity="0.9">
              <animateMotion dur="2.5s" repeatCount="indefinite" begin="2.7s">
                <mpath href="#path-out-3" />
              </animateMotion>
            </circle>
          </svg>

          {/* Input Sources - Top Row */}
          <div className="absolute top-0 left-0 right-0 flex justify-around px-6">
            <ToolNode icon={<LinkedInIcon />} label="LinkedIn" brandColor="" delay={0} />
            <ToolNode icon={<GmailIcon />} label="Gmail" brandColor="" delay={100} />
            <ToolNode icon={<TypeformIcon />} label="Typeform" brandColor="bg-gray-800" delay={200} />
            <ToolNode icon={<CalendlyIcon />} label="Calendly" brandColor="" delay={300} />
          </div>

          {/* Center - Flowstack Hub */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <CentralHub delay={600} />
          </div>

          {/* Output Actions - Bottom Row */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-around px-6">
            <ToolNode icon={<HubSpotIcon />} label="HubSpot" brandColor="" delay={900} />
            <ToolNode icon={<GoogleCalIcon />} label="Calendar" brandColor="" delay={1000} />
            <ToolNode icon={<SlackIcon />} label="Slack" brandColor="" delay={1100} />
            <ToolNode icon={<NotionIcon />} label="Notion" brandColor="bg-gray-800" delay={1200} />
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const allTools = [...tools, ...tools];

  return (
    <div className="bg-[#0a0a0e] text-gray-100 min-h-screen overflow-x-hidden antialiased">
      {/* ============================================ */}
      {/* NAVBAR */}
      {/* ============================================ */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-4 mt-4">
          <div className="max-w-7xl mx-auto bg-gray-900/70 backdrop-blur-xl rounded-2xl border border-gray-800/50 shadow-2xl px-4 md:px-6 py-3">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2 md:gap-3">
                <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Zap className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <span className="text-lg md:text-xl font-bold text-white">{siteConfig.name}</span>
              </Link>

              <div className="hidden md:flex items-center gap-1">
                {['System', 'Leistungen', 'Team', 'FAQ'].map((item) => (
                  <a key={item} href={`#${item.toLowerCase()}`} className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all font-medium text-sm">
                    {item}
                  </a>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Link to="/kostenlose-beratung" className="hidden md:flex group bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all hover:-translate-y-0.5 items-center gap-2">
                  Prozess-Analyse
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all"
                  aria-label={mobileMenuOpen ? "Menü schließen" : "Menü öffnen"}
                  aria-expanded={mobileMenuOpen}
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden mt-4 pt-4 border-t border-gray-800/50">
                <div className="flex flex-col gap-2">
                  {['System', 'Leistungen', 'Team', 'FAQ'].map((item) => (
                    <a
                      key={item}
                      href={`#${item.toLowerCase()}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all font-medium text-base"
                    >
                      {item}
                    </a>
                  ))}
                  <Link
                    to="/kostenlose-beratung"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mt-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 rounded-xl font-semibold text-base text-center flex items-center justify-center gap-2"
                  >
                    Prozess-Analyse
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ============================================ */}
      {/* HERO */}
      {/* ============================================ */}
      <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden">
        {/* Background blurs - hidden on mobile for performance */}
        <div className="absolute inset-0 hidden md:block">
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

              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span>Kostenlose Erstberatung verfügbar</span>
                </div>
              </div>
            </div>

            <div className="relative max-w-[600px]">
              <AnimatedWorkflow />
            </div>
          </div>
        </div>

        <div className="absolute bottom-1 md:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <MousePointer className="w-4 h-4 md:w-5 md:h-5 text-gray-600 animate-bounce" />
          <span className="text-[10px] md:text-xs text-gray-600 uppercase tracking-widest">Scroll</span>
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
                <img src={tool.logo} alt={tool.name} loading="lazy" className="h-8 w-auto object-contain opacity-40 hover:opacity-80 transition-all duration-300 brightness-0 invert" />
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
        {/* Blur hidden on mobile for performance */}
        <div className="absolute inset-0 hidden md:block">
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
            {/* Desktop: Side-by-Side Vergleich */}
            <div className="hidden md:block rounded-2xl border border-gray-800/50 overflow-hidden">
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

            {/* Mobile: Gestapelte Cards */}
            <div className="md:hidden space-y-4">
              {outcomes.comparison.map((row, index) => (
                <div key={index} className="rounded-xl border border-gray-800/50 overflow-hidden">
                  {/* Vorher */}
                  <div className="p-4 bg-amber-950/10 border-b border-gray-800/50">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-medium text-amber-400 uppercase tracking-wide">Vorher</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-amber-900/30 flex-shrink-0">
                        {getIcon(row.right.icon, "w-4 h-4 text-amber-400")}
                      </div>
                      <div>
                        <p className="font-medium text-gray-300 text-sm">{row.right.title} <span className="text-amber-400">{row.right.highlight}</span></p>
                        <p className="text-xs text-gray-500 mt-1">{row.right.subtitle}</p>
                      </div>
                    </div>
                  </div>
                  {/* Nachher */}
                  <div className="p-4 bg-purple-500/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-medium text-purple-400 uppercase tracking-wide">Mit Flowstack</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/20 flex-shrink-0">
                        {getIcon(row.left.icon, "w-4 h-4 text-purple-400")}
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{row.left.title} <span className="text-purple-400">{row.left.highlight}</span></p>
                        <p className="text-xs text-gray-500 mt-1">{row.left.subtitle}</p>
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
      {/* ABOUT / TEAM - Baulig Style */}
      {/* ============================================ */}
      <section id="team" className="py-24 bg-gray-900/30">
        <div className="max-w-5xl mx-auto px-6">
          {/* Header */}
          <AnimatedSection className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-purple-500/10 text-purple-400 rounded-full text-sm font-semibold mb-4 border border-purple-500/20">
              Über uns
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Die Köpfe hinter Flowstack
            </h2>
          </AnimatedSection>

          {/* Team Members - Baulig Style */}
          <div className="space-y-12">
            {teamContent.members.map((member, index) => (
              <AnimatedSection key={index} delay={index * 150}>
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-purple-600/10 rounded-3xl blur-xl opacity-50" />
                  <div className="relative bg-[#0a0a0e] rounded-2xl border border-gray-800/50 p-8 md:p-10">
                    <div className="flex flex-col md:flex-row gap-8">
                      {/* Photo */}
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <div className="absolute -inset-2 bg-gradient-to-br from-purple-500/30 to-purple-600/10 rounded-2xl blur-lg" />
                          <img
                            src={member.image}
                            alt={member.name}
                            loading="lazy"
                            className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover object-top ring-2 ring-purple-500/30"
                          />
                        </div>
                      </div>
                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">{member.name}</h3>
                        <p className="text-purple-400 font-medium mb-6">{member.role}</p>
                        <div className="text-gray-400 leading-relaxed space-y-4">
                          {member.bio?.split('\n\n').map((paragraph, pIndex) => (
                            <p key={pIndex}>{paragraph}</p>
                          ))}
                        </div>
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
        {/* Blur hidden on mobile for performance */}
        <div className="absolute inset-0 hidden md:block">
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
                <li><a href="/impressum" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Impressum</a></li>
                <li><a href="/datenschutz" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Datenschutz</a></li>
                <li><button onClick={() => window.dispatchEvent(new CustomEvent('openCookieSettings'))} className="hover:text-white transition-colors">Cookie-Einstellungen</button></li>
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

      {/* Meta Disclaimer */}
      <div className="bg-[#050508] py-6 border-t border-gray-800/30">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-[11px] text-gray-600 text-center leading-relaxed">
            Diese Website ist kein Teil der Facebook-Website oder von Facebook Inc. Darüber hinaus wird diese Website in keiner Weise von Facebook unterstützt. Facebook ist eine Marke von Facebook, Inc. Wir verwenden auf dieser Website Remarketing-Pixel/Cookies von Google, um erneut mit den Besuchern unserer Website zu kommunizieren und sicherzustellen, dass wir sie in Zukunft mit relevanten Nachrichten und Informationen erreichen können. Google schaltet unsere Anzeigen auf Websites Dritter im Internet, um unsere Botschaft zu kommunizieren und die richtigen Personen zu erreichen, die in der Vergangenheit Interesse an unseren Informationen gezeigt haben.
          </p>
        </div>
      </div>

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
        @keyframes flow-down {
          0% { top: 0; opacity: 0.9; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
        .animate-pulse-slower { animation: pulse-slower 10s ease-in-out infinite; }
        .animate-marquee { animation: marquee 30s linear infinite; }
        .animate-flow-down { animation: flow-down 1.5s ease-in-out infinite; }

        /* Disable heavy blur animations on mobile for performance */
        @media (max-width: 767px) {
          .animate-pulse-slow,
          .animate-pulse-slower { animation: none; }
          .animate-marquee { animation: none; }
        }
      `}</style>
    </div>
  );
};

export default HomePageV3;
