import { ArrowRight, Zap } from "lucide-react";

export const EmpathyOpening = () => {
  return (
    <section className="container py-16 md:py-24">
      <div className="max-w-4xl mx-auto">
        {/* Headline - emotional, direkt */}
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-light tracking-elegant text-center mb-12 leading-tight">
          Du arbeitest härter als je zuvor. Und trotzdem bleibt am Monatsende nicht mehr übrig?
        </h2>

        {/* Das Grundproblem - visuell hervorgehoben */}
        <div className="relative mb-12">
          {/* Subtle glow behind */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-red-500/10 to-red-500/5 rounded-2xl blur-xl" />

          <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 md:p-10">
            {/* Label */}
            <p className="text-sm font-semibold text-red-400 uppercase tracking-widest mb-6 text-center">
              Das Grundproblem
            </p>

            {/* Die Gleichung - visuell als Flow */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 mb-8">
              {[
                "Mehr Kunden",
                "Mehr Arbeit",
                "Mehr Kosten",
                "Weniger Umsatzrendite"
              ].map((step, index) => (
                <div key={index} className="flex items-center gap-3 md:gap-4">
                  <div className={`
                    px-4 py-3 rounded-lg font-medium text-center min-w-[140px]
                    ${index === 3
                      ? "bg-red-500/20 border-2 border-red-500/50 text-red-400"
                      : "bg-muted/50 border border-border/50 text-foreground/80"
                    }
                  `}>
                    {step}
                  </div>
                  {index < 3 && (
                    <ArrowRight className="w-5 h-5 text-muted-foreground hidden md:block" />
                  )}
                  {index < 3 && (
                    <span className="text-muted-foreground md:hidden">→</span>
                  )}
                </div>
              ))}
            </div>

            {/* Fragen */}
            <div className="text-center space-y-4 mb-6">
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Fressen deine Kosten alles auf, sodass am Ende kaum mehr übrig bleibt als vorher?
              </p>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Hast du mit jedem neuen Kunden mehr Stress statt mehr Freiheit?
              </p>
            </div>

            {/* Reframe */}
            <div className="text-center">
              <p className="text-lg md:text-xl text-foreground">
                Das ist kein Fleiß-Problem. Das ist ein <span className="text-foreground font-semibold">System-Problem</span>. Und es lässt sich lösen.
              </p>
            </div>
          </div>
        </div>

        {/* Die Lösung - Kontrastbox */}
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 rounded-2xl blur-xl" />

          <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 rounded-2xl p-6 md:p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>

            <p className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
              KI-Automation durchbricht diesen Kreislauf.
            </p>

            <div className="text-muted-foreground text-lg space-y-1">
              <p>Ohne zusätzliche Mitarbeiter.</p>
              <p>Ohne monatelange Einrichtung.</p>
              <p>Ohne dass du deine Prozesse komplett umstellen musst.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmpathyOpening;
