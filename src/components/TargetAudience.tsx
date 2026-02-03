import { Link } from "react-router-dom";
import { targetAudience } from "@/config/content";
import { Check, X, Sparkles, ShieldX } from "lucide-react";
import { Button } from "./ui/button";

export const TargetAudience = () => {
  return (
    <section className="container py-16 md:py-24 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-elegant mb-4">
            {targetAudience.headline}
          </h2>
        </div>

        {/* Side by Side Comparison */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Left: For You (Green/Primary) */}
          <div className="group relative">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative p-8 md:p-10 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 h-full">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/30 text-primary text-sm font-semibold rounded-full mb-6">
                <Sparkles className="w-4 h-4" />
                Für dich geeignet
              </div>

              <p className="text-muted-foreground mb-8">
                {targetAudience.subheadline}
              </p>

              <ul className="space-y-5">
                {targetAudience.requirements.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-4 opacity-0 animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
                  >
                    <div className="p-1.5 rounded-lg bg-primary/20 border border-primary/30 mt-0.5 flex-shrink-0">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-base text-foreground/90 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: Not For You (Red) */}
          <div className="group relative">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500/10 via-red-500/20 to-red-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative p-8 md:p-10 rounded-2xl border border-red-400/20 bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent backdrop-blur-sm hover:border-red-400/40 transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/10 h-full">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-400/30 text-red-400 text-sm font-semibold rounded-full mb-6">
                <ShieldX className="w-4 h-4" />
                Nicht für dich geeignet
              </div>

              <p className="text-muted-foreground mb-8">
                Das Flowstack-System ist nicht das Richtige, wenn:
              </p>

              <ul className="space-y-5">
                {targetAudience.notFor.items.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-4 opacity-0 animate-fade-in-up"
                    style={{ animationDelay: `${(index * 100) + 200}ms`, animationFillMode: 'forwards' }}
                  >
                    <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-400/30 mt-0.5 flex-shrink-0">
                      <X className="w-4 h-4 text-red-400" />
                    </div>
                    <span className="text-base text-foreground leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-lg text-foreground/80 mb-6">
            {targetAudience.cta.text}
          </p>
          <Button asChild size="lg" className="px-8 py-6 text-base font-semibold group">
            <Link to="/kostenlose-beratung" className="flex items-center gap-2">
              {targetAudience.cta.button}
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out;
        }
      `}</style>
    </section>
  );
};
