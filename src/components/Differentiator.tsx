import { comparison } from "@/config/content";
import { ArrowRight } from "lucide-react";

export const Differentiator = () => {
  return (
    <section className="container py-12 md:py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-light tracking-elegant">
            {comparison.headline}
          </h2>
        </div>

        {/* Comparison boxes */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Der alte Weg - jetzt links */}
          <div className="p-8 rounded-lg border border-red-400/20 bg-red-500/5 text-left">
            <h3 className="text-2xl font-light text-muted-foreground mb-4">
              {comparison.before.title}
            </h3>
            <ul className="space-y-2">
              {comparison.before.items.map((item, index) => (
                <li key={index} className="text-foreground/70 text-sm">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Mit Flowstack Systems - jetzt rechts */}
          <div className="p-8 rounded-lg border border-primary/50 bg-primary/5 text-left relative">
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 hidden md:block">
              <ArrowRight className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-2xl font-light text-primary mb-4">
              {comparison.after.title}
            </h3>
            <ul className="space-y-2">
              {comparison.after.items.map((item, index) => (
                <li key={index} className="text-foreground/80 text-sm">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Conclusion */}
        <div className="text-center">
          <p className="text-base text-primary font-display italic">
            Skalierung entsteht durch Systematisierung, nicht durch mehr Einsatz.
          </p>
        </div>
      </div>
    </section>
  );
};
