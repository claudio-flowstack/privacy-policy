import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const FormularPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    firma: "",
    nachricht: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Erstgespräch anfragen - Flowstack Systems";
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // TODO: Add actual form submission logic here
    // Example: await fetch('/api/contact', { method: 'POST', body: JSON.stringify(formData) });

    navigate("/danke");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar hideCta />

      <main className="container max-w-4xl mx-auto px-6 py-20 md:py-32">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-elegant text-foreground mb-4">
            Kostenloses{" "}
            <span className="font-display italic text-primary">
              Erstgespräch
            </span>{" "}
            anfragen
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Lass uns besprechen, wie Flowstack Systems dein Fulfillment
            automatisieren kann.
          </p>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-foreground font-medium mb-2">
                Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Dein vollständiger Name"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-foreground font-medium mb-2">
                E-Mail *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="deine@email.de"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-foreground font-medium mb-2">
                Firma
              </label>
              <input
                type="text"
                name="firma"
                value={formData.firma}
                onChange={handleChange}
                placeholder="Name deines Unternehmens"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-foreground font-medium mb-2">
                Nachricht
              </label>
              <textarea
                name="nachricht"
                rows={4}
                value={formData.nachricht}
                onChange={handleChange}
                placeholder="Beschreibe kurz deine aktuelle Situation und was du dir erhoffst..."
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Wird gesendet..." : "Anfrage absenden"}
            </button>

            <p className="text-sm text-muted-foreground text-center">
              Mit dem Absenden akzeptierst du unsere{" "}
              <Link to="/datenschutz" className="text-primary hover:underline">
                Datenschutzerklärung
              </Link>
              .
            </p>
          </form>
        </div>

        {/* Trust Elements */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">Was dich erwartet:</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full" />
              Antwort innerhalb von 48h
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full" />
              Unverbindlich & kostenlos
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full" />
              100% vertraulich
            </span>
          </div>
        </div>
      </main>

      <Footer hideCta />
    </div>
  );
};

export default FormularPage;
