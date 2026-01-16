import { Button } from "./ui/button";
import { siteConfig } from "@/config/content";
import { ArrowDown } from "lucide-react";

export const Hero = () => {
  return (
    <section className="container flex flex-col items-center justify-center min-h-[90vh] py-20 md:py-32">
      {/* Headshot */}
      <div className="relative mb-8">
        <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-2 border-primary/20 bg-muted">
          {/* Replace with your actual photo */}
          <img
            src="https://via.placeholder.com/200x200?text=Photo"
            alt={siteConfig.name}
            className="w-full h-full object-cover"
          />
        </div>
        {/* Decorative ring */}
        <div className="absolute inset-0 rounded-full border border-primary/10 scale-110" />
      </div>

      {/* Title */}
      <div className="text-center space-y-4 max-w-3xl">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-elegant">
          <span className="text-foreground">{siteConfig.title}</span>
          <br />
          <span className="font-display italic text-primary">
            {siteConfig.titleAccent}
          </span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {siteConfig.tagline}
        </p>
      </div>

      {/* CTA Button */}
      <div className="mt-10">
        <Button
          asChild
          size="lg"
          className="px-8 py-6 text-base font-medium tracking-wide"
        >
          <a href={siteConfig.cta.href} target="_blank" rel="noreferrer">
            {siteConfig.cta.text}
          </a>
        </Button>
      </div>

      {/* Scroll Indicator */}
      <div className="mt-16 md:mt-24 flex flex-col items-center gap-2 text-muted-foreground">
        <ArrowDown className="w-4 h-4 animate-bounce" />
        <span className="text-xs tracking-widest uppercase">My Services</span>
      </div>

      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10" />
    </section>
  );
};
