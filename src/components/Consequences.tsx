import { consequences } from "@/config/content";
import { AlertCircle } from "lucide-react";

export const Consequences = () => {
  return (
    <section className="container py-20 md:py-28">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-light tracking-elegant mb-4">
            {consequences.headline}
          </h2>
          <p className="text-lg text-primary font-display italic">
            {consequences.subheadline}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Consequences list */}
          <div className="space-y-4">
            {consequences.items.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-foreground/80">{item}</p>
              </div>
            ))}
          </div>

          {/* Cost per day */}
          <div className="p-6 rounded-lg border border-destructive/30 bg-destructive/5">
            <h3 className="text-lg font-medium mb-4 text-foreground">
              {consequences.costPerDay.headline}
            </h3>
            <div className="space-y-4">
              {consequences.costPerDay.items.map((item, index) => (
                <div key={index} className="flex items-baseline gap-3">
                  <span className="text-xl font-semibold text-primary">
                    {item.metric}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {item.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
