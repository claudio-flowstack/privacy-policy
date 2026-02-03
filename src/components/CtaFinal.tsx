import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { finalCta } from "@/config/content";
import { ArrowRight, CheckCircle } from "lucide-react";

export const CtaFinal = () => {
  return (
    <section id="cta" className="py-16 sm:py-20">
      <div className="container">
        {/* Final CTA Card */}
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 p-12 md:p-16 lg:p-20 text-center">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-elegant mb-4">
              {finalCta.headline}
            </h2>

            <p className="text-lg text-primary font-medium mb-4">
              {finalCta.subheadline}
            </p>

            {/* Benefits */}
            <ul className="space-y-3 mb-10 max-w-md mx-auto text-left">
              {finalCta.bullets.map((bullet, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-base text-foreground/90">{bullet}</span>
                </li>
              ))}
            </ul>

            {/* Risk Reversals */}
            {finalCta.riskReversals && (
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {finalCta.riskReversals.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}

            <Button
              asChild
              size="lg"
              className="group px-8 py-6 text-base font-medium tracking-wide"
            >
              <Link to={finalCta.cta.href}>
                {finalCta.cta.text}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>

            {/* Trust Elements */}
            <div className="mt-10 pt-8 border-t border-border/30">
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                {finalCta.trustElements.map((element, index) => (
                  <p key={index} className="text-sm text-muted-foreground">
                    {element}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaFinal;
