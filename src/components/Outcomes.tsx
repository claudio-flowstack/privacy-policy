import { outcomes } from "@/config/content";
import * as Icons from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  TrendingUp: Icons.TrendingUp,
  CheckCircle: Icons.CheckCircle,
  PiggyBank: Icons.PiggyBank,
  Clock: Icons.Clock,
};

export const Outcomes = () => {
  return (
    <section className="container py-20 md:py-28">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-light tracking-elegant">
            {outcomes.headline}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {outcomes.items.map((item, index) => {
            const Icon = iconMap[item.icon] || Icons.CheckCircle;
            return (
              <div
                key={index}
                className="p-6 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-md bg-primary/20">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
