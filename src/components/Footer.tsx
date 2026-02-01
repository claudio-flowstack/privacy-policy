import { Link } from "react-router-dom";
import { siteConfig } from "@/config/content";
import { Linkedin, Mail, MapPin, Phone, Clock } from "lucide-react";

interface FooterProps {
  hideCta?: boolean;
}

export const Footer = ({ hideCta = false }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="footer" className="border-t border-border/50 bg-card/30">
      <div className="container py-16 md:py-20">
        {/* Pre-Footer CTA */}
        {!hideCta && (
          <div className="text-center mb-16 pb-16 border-b border-border/30">
            <p className="text-muted-foreground mb-4">
              Bereit für effizientere Prozesse?
            </p>
            <Link
              to="/kostenlose-beratung"
              className="inline-block px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Kostenlose Prozess-Analyse sichern
            </Link>
          </div>
        )}

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div>
            <Link
              to="/"
              className="text-xl font-display italic text-primary hover:text-primary/80 transition-colors"
            >
              {siteConfig.name}
            </Link>
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
              Wir automatisieren operative Prozesse in B2B-Unternehmen und Agenturen mit KI-gestützten Systemen.
            </p>

          </div>

          {/* Leistungen */}
          <div>
            <h4 className="font-medium text-foreground mb-4">Leistungen</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#services" className="text-muted-foreground hover:text-primary transition-colors">
                  Prozessautomatisierung
                </a>
              </li>
              <li>
                <a href="#services" className="text-muted-foreground hover:text-primary transition-colors">
                  KI-Integration
                </a>
              </li>
              <li>
                <a href="#services" className="text-muted-foreground hover:text-primary transition-colors">
                  Workflow-Optimierung
                </a>
              </li>
              <li>
                <a href="#services" className="text-muted-foreground hover:text-primary transition-colors">
                  System-Architektur
                </a>
              </li>
              <li>
                <a href="#services" className="text-muted-foreground hover:text-primary transition-colors">
                  Consulting & Beratung
                </a>
              </li>
            </ul>
          </div>

          {/* Unternehmen */}
          <div>
            <h4 className="font-medium text-foreground mb-4">Unternehmen</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#testimonials" className="text-muted-foreground hover:text-primary transition-colors">
                  Referenzen
                </a>
              </li>
              <li>
                <a href="#process" className="text-muted-foreground hover:text-primary transition-colors">
                  Ablauf
                </a>
              </li>
              <li>
                <a href="#faq" className="text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <Link to="/kostenlose-beratung" className="text-muted-foreground hover:text-primary transition-colors">
                  Kontakt
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Karriere
                </a>
              </li>
            </ul>
          </div>

          {/* Kontakt */}
          <div>
            <h4 className="font-medium text-foreground mb-4">Kontakt</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">
                  Flowstack Systems<br />
                  [ADRESSE]<br />
                  [PLZ ORT]
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">
                  [TELEFON]
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <a href="mailto:info@flowstack-system.de" className="text-muted-foreground hover:text-primary transition-colors">
                  info@flowstack-system.de
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">
                  Mo–Fr: 09:00–18:00 Uhr
                </span>
              </li>
            </ul>

            {/* Social Links */}
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer noopener"
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/30">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-sm text-muted-foreground">
              &copy; {currentYear} {siteConfig.name}. Alle Rechte vorbehalten.
            </p>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <Link
                to="/impressum"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Impressum
              </Link>
              <Link
                to="/datenschutz"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Datenschutz
              </Link>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                AGB
              </a>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('openCookieSettings'))}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Cookie-Einstellungen
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
