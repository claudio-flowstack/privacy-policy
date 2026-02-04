import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Check, ArrowRight, Zap, Shield, Clock, Star, Mail, MapPin, Linkedin } from "lucide-react";
import { siteConfig } from "@/config/content";

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
    navigate("/danke");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0e] text-white">
      {/* Simple Header */}
      <header className="py-6 border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">{siteConfig.name}</span>
          </Link>
        </div>
      </header>

      <main className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left: Info */}
            <div>
              <span className="inline-block px-4 py-2 bg-purple-500/10 text-purple-400 rounded-full text-sm font-semibold mb-6 border border-purple-500/20">
                Kostenlose Prozess-Analyse
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Lass uns besprechen, wie viel{" "}
                <span className="text-purple-400">Potenzial</span> in deiner Agentur steckt
              </h1>
              <p className="text-lg text-gray-400 mb-10 leading-relaxed">
                In einem kurzen Gespräch analysieren wir gemeinsam deine aktuellen Prozesse und zeigen dir, welche Automatisierungshebel für dich am meisten Sinn machen.
              </p>

              {/* What to expect */}
              <div className="space-y-4 mb-10">
                <h3 className="font-semibold text-white">Das erwartet dich:</h3>
                <ul className="space-y-3">
                  {[
                    "15-20 Minuten Call mit einem Flowstack-Experten",
                    "Analyse deiner 3 größten Automatisierungs-Hebel",
                    "Konkrete Einschätzung deiner möglichen Umsatzrendite",
                    "Ehrliche Antwort, ob wir dir helfen können"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-purple-500/20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                        <Check className="w-3 h-3 text-purple-400" />
                      </div>
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Trust Elements */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4 text-center">
                  <Shield className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">100% kostenlos</p>
                </div>
                <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4 text-center">
                  <Clock className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Antwort in 48h</p>
                </div>
                <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4 text-center">
                  <Star className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Unverbindlich</p>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-[2rem] blur-xl" />
              <div className="relative bg-gray-900/80 border border-gray-800/50 rounded-2xl p-8 backdrop-blur-sm">
                <h2 className="text-xl font-bold mb-6">Jetzt Erstgespräch anfragen</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Dein vollständiger Name"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder:text-gray-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">E-Mail *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="deine@email.de"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder:text-gray-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Firma</label>
                    <input
                      type="text"
                      name="firma"
                      value={formData.firma}
                      onChange={handleChange}
                      placeholder="Name deines Unternehmens"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder:text-gray-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Nachricht</label>
                    <textarea
                      name="nachricht"
                      rows={4}
                      value={formData.nachricht}
                      onChange={handleChange}
                      placeholder="Beschreibe kurz deine aktuelle Situation..."
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder:text-gray-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      "Wird gesendet..."
                    ) : (
                      <>
                        Anfrage absenden
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    Mit dem Absenden akzeptierst du unsere{" "}
                    <Link to="/datenschutz" className="text-purple-400 hover:underline">
                      Datenschutzerklärung
                    </Link>
                    .
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-8 border-t border-gray-800/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link to="/" className="hover:text-white transition-colors">Startseite</Link>
              <Link to="/impressum" className="hover:text-white transition-colors">Impressum</Link>
              <Link to="/datenschutz" className="hover:text-white transition-colors">Datenschutz</Link>
            </div>
            <p className="text-sm text-gray-600">&copy; {new Date().getFullYear()} {siteConfig.name}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FormularPage;
