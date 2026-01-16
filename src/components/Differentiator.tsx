import { differentiator } from "@/config/content";
import { ArrowRight } from "lucide-react";

export const Differentiator = () => {
  return (
    <section className="container py-20 md:py-28">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-light tracking-elegant">
            {differentiator.headline}
          </h2>
        </div>

        {/* Comparison boxes */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Automation */}
          <div className="p-8 rounded-lg border border-border/50 bg-card/30 text-center">
            <h3 className="text-2xl font-light text-muted-foreground mb-3">
              {differentiator.insight.left.title}
            </h3>
            <p className="text-foreground/70">
              {differentiator.insight.left.description}
            </p>
          </div>

          {/* Architecture */}
          <div className="p-8 rounded-lg border border-primary/50 bg-primary/5 text-center relative">
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 hidden md:block">
              <ArrowRight className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-2xl font-light text-primary mb-3">
              {differentiator.insight.right.title}
            </h3>
            <p className="text-foreground/80">
              {differentiator.insight.right.description}
            </p>
          </div>
        </div>

        {/* Conclusion */}
        <div className="text-center space-y-6">
          {differentiator.conclusion.split("\n\n").map((paragraph, index) => (
            <p
              key={index}
              className="text-lg text-foreground/80 leading-relaxed"
            >
              {paragraph}
            </p>
          ))}
          <p className="text-base text-primary font-display italic">
            {differentiator.keyInsight}
          </p>
        </div>
      </div>
    </section>
  );
};
