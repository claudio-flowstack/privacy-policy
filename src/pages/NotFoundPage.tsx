import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Zap, ArrowRight } from "lucide-react";
import { siteConfig } from "@/config/content";

const NotFoundPage = () => {
  useEffect(() => {
    document.title = "Seite nicht gefunden - Flowstack Systems";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0e] text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-4 mt-4">
          <div className="max-w-7xl mx-auto bg-gray-900/70 backdrop-blur-xl rounded-2xl border border-gray-800/50 shadow-2xl px-6 py-3">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">{siteConfig.name}</span>
              </Link>

              <div className="hidden md:flex items-center gap-1">
                <Link to="/" className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all font-medium text-sm">
                  Startseite
                </Link>
              </div>

              <Link to="/kostenlose-beratung" className="group bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all hover:-translate-y-0.5 flex items-center gap-2">
                Prozess-Analyse
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex items-center justify-center min-h-[80vh] px-6 pt-28 pb-16">
        <div className="text-center">
          <h1 className="text-8xl md:text-9xl font-black bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-white mt-4 mb-4">
            Seite nicht <span className="text-purple-400">gefunden</span>
          </h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Die gesuchte Seite existiert leider nicht oder wurde verschoben.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-purple-500/20 transition-all"
          >
            Zur&uuml;ck zur Startseite
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </main>

      {/* Footer */}
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

export default NotFoundPage;
