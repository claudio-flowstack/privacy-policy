import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { siteConfig } from "@/config/content";
import { ArrowDown, Check } from "lucide-react";

export const Hero = () => {
  return (
    <section className="container min-h-[90vh] py-16 md:py-24">
      {/* Headline + Subheadline - zentriert */}
      <div className="text-center space-y-4 max-w-4xl mx-auto mb-16">
        {/* Eyebrow / Zielgruppe */}
        <p className="text-sm md:text-base text-primary font-medium uppercase tracking-widest">
          {siteConfig.eyebrow}
        </p>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-elegant">
          <span className="text-foreground">{siteConfig.title}</span>
          <br />
          <span className="font-display italic text-primary text-2xl md:text-3xl lg:text-4xl">
            {siteConfig.titleAccent}
          </span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          {siteConfig.tagline}
        </p>
      </div>

      {/* ABTF Layout: Video/Bild links, Bullet Points + CTA rechts */}
      <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
        {/* Left: Visual */}
        <div className="relative">
          <div className="aspect-video rounded-xl overflow-hidden border border-border/50 bg-muted">
            {/* TODO: Replace with video when available */}
            <img
              src="/claudio-hero.jpg"
              alt="Claudio Di Franco - Prozessautomatisierung"
              className="w-full h-full object-contain"
            />
            {/* Play button overlay - uncomment when video is ready
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center cursor-pointer hover:bg-primary transition-colors">
                <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1" />
              </div>
            </div>
            */}
          </div>
        </div>

        {/* Right: Bullet Points + CTA */}
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground uppercase tracking-widest">
            Kommt dir das bekannt vor?
          </p>

          {/* Bullet Points: Symptome & Frustrationen */}
          <ul className="space-y-4">
            {siteConfig.bulletPoints?.map((point, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground/90 text-lg">{point}</span>
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          <div className="pt-4">
            <Button
              asChild
              size="lg"
              className="px-8 py-6 text-base font-medium tracking-wide w-full md:w-auto"
            >
              <Link to={siteConfig.cta.href}>
                {siteConfig.cta.text}
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground mt-3">
              Kein Verkaufsgespräch. Nur Klarheit.
            </p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="mt-16 md:mt-24 flex flex-col items-center gap-2 text-muted-foreground">
        <ArrowDown className="w-4 h-4 animate-bounce" />
        <span className="text-xs tracking-widest uppercase">Mehr erfahren</span>
      </div>

      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10" />
    </section>
  );
};
