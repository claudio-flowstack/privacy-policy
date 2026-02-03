import { flowstackSystem } from "@/config/content";
import { Check } from "lucide-react";
import { Badge } from "./ui/badge";

export const FlowstackSystem = () => {
  return (
    <section id="flowstack-system" className="py-20 md:py-28">
      <div className="container">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-elegant mb-6">
            {flowstackSystem.headline.split(":")[0]}:
            <br />
            <span className="font-display italic text-primary">
              {flowstackSystem.headline.split(":")[1]}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            {flowstackSystem.subheadline}
          </p>
        </div>

        {/* Desktop: Horizontal Timeline with Circles */}
        <div className="hidden md:block max-w-5xl mx-auto">
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-8 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

            {/* Steps Grid */}
            <div className="grid grid-cols-4 gap-4">
              {flowstackSystem.stages.map((stage, index) => (
                  <div key={index} className="relative">
                    {/* Step Circle */}
                    <div className="flex justify-center mb-6">
                      <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-medium shadow-lg shadow-primary/20 relative z-10">
                        {stage.number.padStart(2, '0')}
                      </div>
                    </div>

                    {/* Step Content Card */}
                    <div className="p-5 rounded-2xl border border-border bg-background hover:shadow-md hover:border-primary/30 transition-all text-center h-full">
                      <Badge variant="outline" className="mb-3 text-sm border-primary/30 text-primary">
                        {stage.duration}
                      </Badge>
                      <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">
                        {stage.title}
                      </p>
                      <h3 className="text-xl font-medium text-foreground mb-3">
                        {stage.subtitle}
                      </h3>
                      <p className="text-base text-muted-foreground mb-4">
                        {stage.description}
                      </p>
                      <ul className="space-y-2 text-left mb-4">
                        {stage.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-base text-muted-foreground">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      {stage.result && (
                        <div className="pt-3 border-t border-border/50">
                          <p className="text-sm text-primary font-medium">{stage.result}</p>
                        </div>
                      )}
                    </div>
                  </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: Vertical Timeline */}
        <div className="md:hidden max-w-sm mx-auto">
          <div className="relative">
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20" />
            <div className="space-y-8">
              {flowstackSystem.stages.map((stage, index) => (
                  <div key={index} className="relative flex gap-5">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium shadow-lg shadow-primary/20 flex-shrink-0 relative z-10">
                      {stage.number.padStart(2, '0')}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm uppercase tracking-widest text-muted-foreground">
                          {stage.title}
                        </p>
                        <Badge variant="outline" className="text-sm border-primary/30 text-primary">
                          {stage.duration}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-medium text-foreground mb-2">
                        {stage.subtitle}
                      </h3>
                      <p className="text-base text-muted-foreground mb-3">
                        {stage.description}
                      </p>
                      <ul className="space-y-2 mb-3">
                        {stage.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-base text-muted-foreground">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      {stage.result && (
                        <p className="text-sm text-primary font-medium">{stage.result}</p>
                      )}
                    </div>
                  </div>
              ))}
            </div>
          </div>
        </div>

        {/* Closing Statement */}
        <div className="text-center mt-12 max-w-3xl mx-auto">
          <p className="text-lg text-muted-foreground italic">
            {flowstackSystem.closing}
          </p>
        </div>
      </div>
    </section>
  );
};

export default FlowstackSystem;
