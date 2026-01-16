import { siteConfig, footerLinks } from "@/config/content";
import { Linkedin, Twitter, Youtube } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Linkedin,
  Twitter,
  Youtube,
};

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="footer" className="border-t border-border/50">
      <div className="container py-12 md:py-16">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Logo / Name */}
          <div className="text-center md:text-left">
            <a
              href="/"
              className="text-xl font-light tracking-elegant hover:text-primary transition-colors"
            >
              {siteConfig.name}
            </a>
            <p className="text-sm text-muted-foreground mt-2">
              {siteConfig.title}{" "}
              <span className="font-display italic">{siteConfig.titleAccent}</span>
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            {footerLinks.social.map((link) => {
              const Icon = iconMap[link.icon];
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={link.label}
                >
                  {Icon && <Icon className="h-5 w-5" />}
                </a>
              );
            })}
          </div>

          {/* Legal Links */}
          <div className="flex items-center gap-6 text-sm">
            {footerLinks.legal.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border/30 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
