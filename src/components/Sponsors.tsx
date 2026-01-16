import { clientLogos, trustMetrics } from "@/config/content";

export const Sponsors = () => {
  // Duplicate logos for seamless infinite scroll
  const allLogos = [...clientLogos, ...clientLogos];

  return (
    <section id="sponsors" className="py-16 overflow-hidden">
      {/* Trust Metrics - Section 2 */}
      <div className="container mb-12">
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
          {trustMetrics.metrics.map((metric, index) => (
            <div key={index} className="text-center">
              <p className="text-3xl md:text-4xl font-light text-primary mb-1">
                {metric.value}
              </p>
              <p className="text-sm text-muted-foreground">
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Logo strip */}
      <div className="container">
        <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-8">
          Vertraut von führenden Unternehmen
        </p>
      </div>

      {/* Marquee container */}
      <div className="relative">
        {/* Gradient overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />

        {/* Scrolling logos */}
        <div className="flex animate-marquee">
          {allLogos.map((logo, index) => (
            <div
              key={`${logo.name}-${index}`}
              className="flex-shrink-0 mx-8 flex items-center justify-center"
            >
              <img
                src={logo.logo}
                alt={logo.name}
                className="h-8 md:h-10 w-auto object-contain opacity-50 hover:opacity-80 transition-opacity grayscale"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
