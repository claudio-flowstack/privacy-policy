import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { ctaInline } from "@/config/content";
import { Check, ArrowRight } from "lucide-react";

interface CtaInlineProps {
  variant?: "primary" | "secondary";
}

export const CtaInline = ({ variant = "primary" }: CtaInlineProps) => {
  const content = variant === "primary" ? ctaInline.primary : ctaInline.secondary;

  return (
    <section className="py-16 md:py-20">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border border-border/50 rounded-2xl p-8 md:p-12 shadow-sm relative overflow-hidden">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />

            <div className="relative z-10">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Left: Text Content */}
                <div>
                  <h2 className="text-2xl md:text-3xl font-light tracking-elegant text-foreground mb-4">
                    {content.headline}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {content.text}
                  </p>

                  {/* Bullets */}
                  <ul className="space-y-3 mb-6">
                    {content.bullets.map((bullet, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="p-1 rounded-full bg-primary/10 mt-0.5">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-foreground/80 text-base">{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Closing (only for primary) */}
                  {variant === "primary" && "closing" in content && (
                    <p className="text-muted-foreground text-sm italic">
                      {(content as typeof ctaInline.primary).closing}
                    </p>
                  )}
                </div>

                {/* Right: CTA */}
                <div className="text-center md:text-right">
                  <Button
                    asChild
                    size="lg"
                    className="px-8 py-6 text-base font-semibold group"
                  >
                    <Link to="/kostenlose-beratung">
                      {content.cta}
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <p className="text-muted-foreground text-xs mt-3">
                    {content.subtext}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaInline;
