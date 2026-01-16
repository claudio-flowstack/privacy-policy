import { processSteps } from "@/config/content";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader } from "./ui/card";

export const Timeline = () => {
  return (
    <section id="process" className="container py-24 sm:py-32">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-light tracking-elegant mb-4">
          Strategies that leave
          <br />
          <span className="font-display italic text-primary">
            a lasting impression!
          </span>
        </h2>
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Vertical line */}
        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-border hidden md:block" />

        {processSteps.map((step, index) => (
          <div
            key={step.step}
            className={`relative flex flex-col md:flex-row gap-8 mb-16 last:mb-0 ${
              index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
            }`}
          >
            {/* Step Number */}
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-16 h-16 items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                <span className="text-primary font-light text-lg">
                  {step.step}
                </span>
              </div>
            </div>

            {/* Content Card */}
            <Card
              className={`flex-1 ${
                index % 2 === 0 ? "md:mr-auto md:pr-16" : "md:ml-auto md:pl-16"
              } md:w-[45%] bg-card/50 border-border/50 hover:border-primary/30 transition-colors`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-4 mb-2">
                  {/* Mobile step number */}
                  <div className="md:hidden w-10 h-10 rounded-full border border-primary flex items-center justify-center">
                    <span className="text-primary font-light text-sm">
                      {step.step}
                    </span>
                  </div>
                  {step.duration && (
                    <Badge
                      variant="outline"
                      className="text-xs tracking-wide border-primary/30 text-primary"
                    >
                      {step.duration}
                    </Badge>
                  )}
                </div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  {step.subtitle}
                </p>
                <h3 className="text-xl font-light tracking-elegant text-foreground">
                  {step.title}
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {step.description}
                </p>
                <ul className="space-y-2">
                  {step.items.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="text-primary mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Spacer for alternating layout */}
            <div className="hidden md:block flex-1 md:w-[45%]" />
          </div>
        ))}
      </div>
    </section>
  );
};
