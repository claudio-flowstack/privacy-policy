import { useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const DankePage = () => {
  useEffect(() => {
    document.title = "Vielen Dank - Flowstack Systems";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar hideCta />

      <main className="container flex items-center justify-center min-h-[80vh] px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-10 h-10 text-primary-foreground" />
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-elegant text-foreground mb-4">
            Vielen Dank für deine{" "}
            <span className="font-display italic text-primary">Anfrage!</span>
          </h1>

          <p className="text-lg text-muted-foreground mb-10 max-w-lg mx-auto">
            Deine Anfrage ist bei uns eingegangen. Wir melden uns innerhalb von
            48 Stunden bei dir.
          </p>

          {/* Process Steps */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card rounded-xl p-6 border border-border/50">
              <div className="w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-semibold">
                1
              </div>
              <h3 className="text-foreground font-semibold mb-2">
                Anfrage eingegangen
              </h3>
              <p className="text-muted-foreground text-sm">
                Deine Daten sind sicher bei uns.
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border/50">
              <div className="w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-semibold">
                2
              </div>
              <h3 className="text-foreground font-semibold mb-2">Prüfung</h3>
              <p className="text-muted-foreground text-sm">
                Wir prüfen, ob wir dir helfen können.
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border/50">
              <div className="w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-semibold">
                3
              </div>
              <h3 className="text-foreground font-semibold mb-2">
                Terminvorschlag
              </h3>
              <p className="text-muted-foreground text-sm">
                Du erhältst einen Terminvorschlag per E-Mail.
              </p>
            </div>
          </div>

          {/* Back Button */}
          <Link
            to="/"
            className="inline-block px-8 py-3 bg-card border border-border text-foreground rounded-lg hover:bg-accent transition-colors"
          >
            Zurück zur Startseite
          </Link>
        </div>
      </main>

      <Footer hideCta />
    </div>
  );
};

export default DankePage;
