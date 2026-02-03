import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const NotFoundPage = () => {
  useEffect(() => {
    document.title = "Seite nicht gefunden - Flowstack Systems";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="text-center">
          <h1 className="text-8xl md:text-9xl font-black bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-light tracking-elegant text-foreground mt-4 mb-4">
            Seite nicht{" "}
            <span className="font-display italic text-primary">gefunden</span>
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Die gesuchte Seite existiert leider nicht oder wurde verschoben.
          </p>
          <Link
            to="/"
            className="inline-block px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Zurück zur Startseite
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFoundPage;
