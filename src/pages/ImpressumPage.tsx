import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const ImpressumPage = () => {
  useEffect(() => {
    document.title = "Impressum - Flowstack Systems";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container max-w-4xl mx-auto px-6 py-20 md:py-32">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-elegant text-foreground mb-12">
          <span className="font-display italic text-primary">Impressum</span>
        </h1>

        <div className="space-y-8 text-muted-foreground">
          {/* Angaben gemäß § 5 TMG */}
          <section className="bg-card border border-border/50 rounded-xl p-6 md:p-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Angaben gemäß § 5 TMG
            </h2>
            <div className="space-y-1">
              <p className="text-foreground font-medium">Claudio Di Franco</p>
              <p>Vertrieb Dienstleistungen im Online Marketing Bereich</p>
              <p>Falkenweg 2</p>
              <p>76327 Pfinztal</p>
            </div>
          </section>

          {/* Kontakt */}
          <section className="bg-card border border-border/50 rounded-xl p-6 md:p-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Kontakt
            </h2>
            <div className="space-y-1">
              <p>
                Telefon:{" "}
                <a
                  href="tel:+4917358379 27"
                  className="text-primary hover:underline"
                >
                  0173 583 79 27
                </a>
              </p>
              <p>
                E-Mail:{" "}
                <a
                  href="mailto:kontakt@flowstack-systems.de"
                  className="text-primary hover:underline"
                >
                  kontakt@flowstack-systems.de
                </a>
              </p>
            </div>
          </section>

          {/* Umsatzsteuer-ID */}
          <section className="bg-card border border-border/50 rounded-xl p-6 md:p-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Umsatzsteuer-ID
            </h2>
            <p>
              Umsatzsteuer-Identifikationsnummer gemäß § 27 a
              Umsatzsteuergesetz:
            </p>
            <p className="text-foreground font-medium mt-2">DE315947038</p>
          </section>

          {/* EU-Streitschlichtung */}
          <section className="bg-card border border-border/50 rounded-xl p-6 md:p-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              EU-Streitschlichtung
            </h2>
            <p>
              Die Europäische Kommission stellt eine Plattform zur
              Online-Streitbeilegung (OS) bereit:{" "}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
            </p>
            <p className="mt-2">
              Unsere E-Mail-Adresse finden Sie oben im Impressum.
            </p>
          </section>

          {/* Verbraucherstreitbeilegung */}
          <section className="bg-card border border-border/50 rounded-xl p-6 md:p-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Verbraucherstreitbeilegung / Universalschlichtungsstelle
            </h2>
            <p>
              Wir sind nicht bereit oder verpflichtet, an
              Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
              teilzunehmen.
            </p>
          </section>

          {/* Haftungsausschluss */}
          <section className="bg-card border border-border/50 rounded-xl p-6 md:p-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Haftung für Inhalte
            </h2>
            <p>
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene
              Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
              verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter
              jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
              Informationen zu überwachen oder nach Umständen zu forschen, die
              auf eine rechtswidrige Tätigkeit hinweisen.
            </p>
            <p className="mt-3">
              Verpflichtungen zur Entfernung oder Sperrung der Nutzung von
              Informationen nach den allgemeinen Gesetzen bleiben hiervon
              unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem
              Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich.
              Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir
              diese Inhalte umgehend entfernen.
            </p>
          </section>

          {/* Haftung für Links */}
          <section className="bg-card border border-border/50 rounded-xl p-6 md:p-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Haftung für Links
            </h2>
            <p>
              Unser Angebot enthält Links zu externen Websites Dritter, auf
              deren Inhalte wir keinen Einfluss haben. Deshalb können wir für
              diese fremden Inhalte auch keine Gewähr übernehmen. Für die
              Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter
              oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten
              wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße
              überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der
              Verlinkung nicht erkennbar.
            </p>
            <p className="mt-3">
              Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist
              jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht
              zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir
              derartige Links umgehend entfernen.
            </p>
          </section>

          {/* Urheberrecht */}
          <section className="bg-card border border-border/50 rounded-xl p-6 md:p-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Urheberrecht
            </h2>
            <p>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
              diesen Seiten unterliegen dem deutschen Urheberrecht. Die
              Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
              Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der
              schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
              Downloads und Kopien dieser Seite sind nur für den privaten, nicht
              kommerziellen Gebrauch gestattet.
            </p>
            <p className="mt-3">
              Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt
              wurden, werden die Urheberrechte Dritter beachtet. Insbesondere
              werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie
              trotzdem auf eine Urheberrechtsverletzung aufmerksam werden,
              bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von
              Rechtsverletzungen werden wir derartige Inhalte umgehend
              entfernen.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ImpressumPage;
