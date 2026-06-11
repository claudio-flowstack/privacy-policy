import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { X, Cookie, Shield, Megaphone, BarChart3 } from 'lucide-react';

interface CookieSettings {
  notwendig: boolean;
  analytics: boolean;
  marketing: boolean;
}

// Push consent update to GTM dataLayer
const updateConsent = (settings: CookieSettings) => {
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  }

  gtag('consent', 'update', {
    'ad_storage': settings.marketing ? 'granted' : 'denied',
    'ad_user_data': settings.marketing ? 'granted' : 'denied',
    'ad_personalization': settings.marketing ? 'granted' : 'denied',
    'analytics_storage': settings.analytics ? 'granted' : 'denied',
  });

  // Fire custom event so GTM can react
  window.dataLayer.push({
    event: 'consent_update',
    consent_analytics: settings.analytics,
    consent_marketing: settings.marketing,
  });
};

// Check stored consent on page load
const getStoredConsent = (): CookieSettings | null => {
  try {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) return null;
    return JSON.parse(consent);
  } catch {
    return null;
  }
};

// Declare dataLayer on window
declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
  }
}

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [cookieSettings, setCookieSettings] = useState<CookieSettings>({
    notwendig: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const existing = getStoredConsent();
    if (!existing) {
      setVisible(true);
    } else {
      // Restore consent state to GTM
      updateConsent(existing);
      setCookieSettings(existing);
    }
  }, []);

  useEffect(() => {
    const handleResetConsent = () => {
      localStorage.removeItem("cookieConsent");
      setVisible(true);
    };
    window.addEventListener('resetCookieConsent', handleResetConsent);
    return () => window.removeEventListener('resetCookieConsent', handleResetConsent);
  }, []);

  useEffect(() => {
    const handleOpenSettings = () => {
      setShowSettings(true);
      setVisible(true);
    };
    window.addEventListener('openCookieSettings', handleOpenSettings);
    return () => window.removeEventListener('openCookieSettings', handleOpenSettings);
  }, []);

  const saveConsent = (settings: CookieSettings) => {
    localStorage.setItem("cookieConsent", JSON.stringify(settings));
    updateConsent(settings);
    setVisible(false);
    setShowSettings(false);
  };

  const handleAcceptAll = () => {
    saveConsent({ notwendig: true, analytics: true, marketing: true });
  };

  const handleRejectAll = () => {
    saveConsent({ notwendig: true, analytics: false, marketing: false });
  };

  if (!visible) return null;

  return createPortal(
    <>
      {/* Cookie Banner */}
      {!showSettings && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-full sm:max-w-2xl z-50">
          <div className="bg-[#0a0a0e]/95 backdrop-blur-xl border border-gray-800/50 shadow-2xl rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Cookie className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold text-lg">
                Cookie-Einstellungen
              </h3>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed">
              Wir verwenden notwendige Cookies für den Betrieb der Website, Analytics-Cookies zur Verbesserung
              unseres Angebots und Marketing-Cookies für personalisierte Werbung.
              Weitere Infos findest du in unserer{" "}
              <Link to="/datenschutz" className="text-purple-400 hover:underline">
                Datenschutzerklärung
              </Link>.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAcceptAll}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:shadow-lg hover:shadow-purple-500/25 text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-all"
              >
                Alle akzeptieren
              </button>
              <button
                onClick={handleRejectAll}
                className="flex-1 bg-gray-900/80 hover:bg-gray-800/80 border border-gray-700/50 text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors"
              >
                Nur notwendige
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="text-sm text-gray-500 hover:text-white underline transition-colors px-2 py-1"
              >
                Einstellungen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0e] border border-gray-800/50 rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Cookie className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  Cookie-Einstellungen
                </h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-gray-400 text-sm">
                Wähle aus, welche Arten von Cookies du zulassen möchtest.
              </p>

              <div className="space-y-3">
                {/* Notwendig - immer aktiv */}
                <div className="flex items-center justify-between p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-purple-400" />
                    <div>
                      <h4 className="font-medium text-white">Notwendig</h4>
                      <p className="text-xs text-gray-500">Erforderlich für den Betrieb der Website</p>
                    </div>
                  </div>
                  <div className="w-11 h-6 bg-purple-500 rounded-full flex items-center justify-end px-1">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>

                {/* Analytics */}
                <div className="flex items-center justify-between p-4 border border-gray-800/50 rounded-xl hover:bg-gray-900/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-gray-500" />
                    <div>
                      <h4 className="font-medium text-white">Analytics</h4>
                      <p className="text-xs text-gray-500">Google Analytics zur Verbesserung der Website</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCookieSettings(prev => ({ ...prev, analytics: !prev.analytics }))}
                    className={`w-11 h-6 rounded-full flex items-center transition-colors duration-300 ${
                      cookieSettings.analytics ? 'bg-purple-500 justify-end' : 'bg-gray-700 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full mx-1 shadow-sm"></div>
                  </button>
                </div>

                {/* Marketing */}
                <div className="flex items-center justify-between p-4 border border-gray-800/50 rounded-xl hover:bg-gray-900/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Megaphone className="w-5 h-5 text-gray-500" />
                    <div>
                      <h4 className="font-medium text-white">Marketing</h4>
                      <p className="text-xs text-gray-500">Google Ads & Facebook Pixel für personalisierte Werbung</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCookieSettings(prev => ({ ...prev, marketing: !prev.marketing }))}
                    className={`w-11 h-6 rounded-full flex items-center transition-colors duration-300 ${
                      cookieSettings.marketing ? 'bg-purple-500 justify-end' : 'bg-gray-700 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full mx-1 shadow-sm"></div>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => saveConsent(cookieSettings)}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:shadow-lg hover:shadow-purple-500/25 text-white rounded-xl px-5 py-3 text-sm font-semibold transition-all"
              >
                Auswahl speichern
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 bg-gray-900/80 hover:bg-gray-800/80 border border-gray-700/50 text-white rounded-xl px-5 py-3 text-sm font-semibold transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
};

export default CookieBanner;
