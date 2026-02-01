import { outcomes } from "@/config/content";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";
import { TrendingUp, Sparkles, AlertCircle, ArrowRight } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  TrendingUp: Icons.TrendingUp,
  TrendingDown: Icons.TrendingDown,
  Sparkles: Icons.Sparkles,
  RefreshCw: Icons.RefreshCw,
  Eye: Icons.Eye,
  Flame: Icons.Flame,
  Users: Icons.Users,
  Coins: Icons.Coins,
  Banknote: Icons.Banknote,
  Shield: Icons.Shield,
  AlertTriangle: Icons.AlertTriangle,
  Rocket: Icons.Rocket,
  AlertCircle: Icons.AlertCircle,
  Check: Icons.Check,
  X: Icons.X,
};

export const Outcomes = () => {
  return (
    <section className="container py-16 md:py-24">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-elegant mb-4">
            {outcomes.headline}
          </h2>
        </div>

        {/* Mobile: Stacked Cards */}
        <div className="block md:hidden space-y-4 px-2 mb-12">
          {outcomes.comparison.map((row, index) => {
            const LeftIcon = iconMap[row.left.icon] || Icons.Check;
            const RightIcon = iconMap[row.right.icon] || Icons.X;
            return (
              <div key={index} className="rounded-xl border border-border overflow-hidden">
                {/* Positive (Left/After) */}
                <div className="p-4 bg-primary/5 border-b border-border">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <LeftIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">
                        {row.left.title}{" "}
                        <span className="text-primary">{row.left.highlight}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {row.left.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Negative (Right/Before) */}
                <div className="p-4 bg-amber-950/20">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-900/30">
                      <RightIcon className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground/80">
                        {row.right.title}{" "}
                        <span className="text-amber-400">{row.right.highlight}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {row.right.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop: Side-by-Side Table */}
        <div className="hidden md:block relative rounded-2xl border border-border overflow-hidden shadow-sm mb-12">
          {/* Table Header */}
          <div className="relative grid grid-cols-[1fr_auto_1fr] bg-muted/50">
            <div className="p-5">
              <div className="flex items-center gap-2 justify-center">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <span className="font-medium text-muted-foreground">Manueller Betrieb</span>
              </div>
            </div>
            {/* Arrow in center */}
            <div className="flex items-center justify-center px-4">
              <div className="bg-background border border-primary/30 rounded-full p-2 shadow-md">
                <ArrowRight className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="font-medium text-primary">Mit Flowstack</span>
              </div>
            </div>
          </div>

          {/* Table Rows */}
          {outcomes.comparison.map((row, index) => {
            const LeftIcon = iconMap[row.left.icon] || Icons.Check;
            const RightIcon = iconMap[row.right.icon] || Icons.X;
            return (
              <div key={index} className="grid grid-cols-2 border-t border-border">
                {/* Left - Negative (Manueller Betrieb) */}
                <div className="p-5 lg:p-6 border-r border-border bg-amber-950/20 hover:bg-amber-950/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-amber-900/30 flex-shrink-0">
                      <RightIcon className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground/80">
                        {row.right.title}{" "}
                        <span className="text-amber-400">{row.right.highlight}</span>
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {row.right.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Right - Positive (Mit Flowstack) */}
                <div className="p-5 lg:p-6 bg-primary/5 hover:bg-primary/10 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-primary/10 flex-shrink-0">
                      <LeftIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {row.left.title}{" "}
                        <span className="text-primary">{row.left.highlight}</span>
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {row.left.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="bg-card border border-border/50 rounded-xl p-8 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-semibold">{outcomes.stats.headline}</h3>
          </div>
          <ul className="grid md:grid-cols-2 gap-4">
            {outcomes.stats.items.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-primary font-bold">→</span>
                <span className="text-foreground/80">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
