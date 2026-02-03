import { tools, trustMetrics } from "@/config/content";

export const Sponsors = () => {
  // Duplicate tools for seamless infinite scroll
  const allTools = [...tools, ...tools];

  return (
    <section id="sponsors" className="pt-4 pb-12 overflow-hidden">
      {/* Trust Metrics Strip - 4 Metriken */}
      <div className="container mb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto">
          {trustMetrics.metrics.map((metric, index) => (
            <div key={index} className="text-center p-4 md:p-6 bg-card/50 rounded-xl border border-border/30">
              <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-1">
                {metric.value}
              </p>
              <p className="text-sm md:text-base text-muted-foreground">
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tools strip */}
      <div className="container">
        <p className="text-center text-sm md:text-base uppercase tracking-widest text-muted-foreground mb-6">
          Tools, mit denen wir arbeiten
        </p>
      </div>

      {/* Marquee container */}
      <div className="relative">
        {/* Gradient overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />

        {/* Scrolling tools */}
        <div className="flex animate-marquee">
          {allTools.map((tool, index) => (
            <div
              key={`${tool.name}-${index}`}
              className="flex-shrink-0 mx-6 flex items-center justify-center"
            >
              <img
                src={tool.logo}
                alt={tool.name}
                className={`h-8 md:h-10 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity ${
                  tool.name === "OpenAI" ? "brightness-0 invert" : ""
                }`}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
