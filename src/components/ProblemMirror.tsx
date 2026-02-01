import { problemSection } from "@/config/content";
import * as Icons from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  TrendingDown: Icons.TrendingDown,
  User: Icons.User,
  Clock: Icons.Clock,
  Layers: Icons.Layers,
  AlertTriangle: Icons.AlertTriangle,
  XCircle: Icons.XCircle,
};

export const ProblemMirror = () => {
  return (
    <section className="container py-16 md:py-24">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-elegant mb-4">
          {problemSection.headline}
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          {problemSection.subheadline}
        </p>
      </div>

      {/* 6 Problems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
        {problemSection.problems.map((problem, index) => {
          const Icon = iconMap[problem.icon] || Icons.AlertCircle;
          return (
            <div
              key={index}
              className="p-6 rounded-xl border border-border/50 bg-card/50 hover:border-red-400/30 transition-colors group"
            >
              {/* Label */}
              <p className="text-xs font-semibold text-red-400/80 uppercase tracking-wider mb-3">
                {problem.label}
              </p>

              {/* Icon + Title */}
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-lg bg-red-500/10 group-hover:bg-red-500/15 transition-colors">
                  <Icon className="h-5 w-5 text-red-400" />
                </div>
                <h3 className="font-semibold text-foreground leading-tight">
                  {problem.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-base text-muted-foreground leading-relaxed">
                {problem.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Conclusion */}
      <div className="text-center">
        <p className="text-lg text-primary font-medium max-w-2xl mx-auto">
          {problemSection.conclusion}
        </p>
      </div>
    </section>
  );
};
