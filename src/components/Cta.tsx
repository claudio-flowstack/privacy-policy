import { Button } from "./ui/button";
import { finalCta, roiSection } from "@/config/content";
import { ArrowRight } from "lucide-react";

export const Cta = () => {
  return (
    <section id="cta" className="py-24 sm:py-32">
      <div className="container">
        {/* ROI Urgency - Section 12 */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h3 className="text-xl md:text-2xl font-light tracking-elegant text-muted-foreground mb-8">
            {roiSection.headline}
          </h3>
          <div className="flex flex-col md:flex-row justify-center gap-6 md:gap-12">
            {roiSection.items.map((item, index) => (
              <div key={index} className="text-center">
                <p className="text-foreground font-medium">{item.metric}</p>
                <p className="text-sm text-primary">{item.cost}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA Card - Section 14 */}
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 p-12 md:p-16 lg:p-20 text-center">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-elegant mb-4">
              {finalCta.headline.split(" ").slice(0, -1).join(" ")}{" "}
              <span className="font-display italic text-primary">
                {finalCta.headline.split(" ").slice(-1)}
              </span>
            </h2>

            <p className="text-lg text-primary font-medium mb-4">
              {finalCta.subheadline}
            </p>

            <p className="text-muted-foreground text-lg md:text-xl mb-10 leading-relaxed">
              {finalCta.description}
            </p>

            <Button
              asChild
              size="lg"
              className="group px-8 py-6 text-base font-medium tracking-wide"
            >
              <a href={finalCta.cta.href}>
                {finalCta.cta.text}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>

            <p className="text-sm text-muted-foreground mt-6">
              {finalCta.trust}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
