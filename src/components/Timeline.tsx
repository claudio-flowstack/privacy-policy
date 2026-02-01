import { timeline } from "@/config/content";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";
import { ArrowDown } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Phone: Icons.Phone,
  Target: Icons.Target,
  FileText: Icons.FileText,
  Rocket: Icons.Rocket,
  TrendingUp: Icons.TrendingUp,
};

export const Timeline = () => {
  return (
    <section id="process" className="container py-16 md:py-24">
      {/* Section Header */}
      <div className="text-center mb-12 md:mb-16">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-elegant">
          {timeline.headline}
        </h2>
      </div>

      {/* Timeline Steps */}
      <div className="max-w-3xl mx-auto">
        <div className="space-y-6">
          {timeline.steps.map((step, index) => {
            const Icon = iconMap[step.icon] || Icons.Circle;
            const isLast = index === timeline.steps.length - 1;

            return (
              <div key={index} className="relative">
                {/* Step Card */}
                <div className="bg-card border border-border/50 rounded-xl p-6 hover:border-primary/30 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Step Number & Icon */}
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <span className="text-xs font-semibold text-primary mt-2">
                        SCHRITT {index + 1}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground text-base">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Arrow (except for last step) */}
                {!isLast && (
                  <div className="flex justify-center py-2">
                    <ArrowDown className="w-5 h-5 text-primary/50" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
