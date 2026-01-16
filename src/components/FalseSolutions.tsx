import { falseSolutions } from "@/config/content";
import * as Icons from "lucide-react";
import { X } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users: Icons.Users,
  Puzzle: Icons.Puzzle,
  Zap: Icons.Zap,
};

export const FalseSolutions = () => {
  return (
    <section className="container py-20 md:py-28">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-light tracking-elegant mb-4">
            {falseSolutions.headline}
          </h2>
          <p className="text-lg text-muted-foreground">
            {falseSolutions.subheadline}
          </p>
        </div>

        <div className="space-y-6 mb-10">
          {falseSolutions.solutions.map((solution, index) => {
            const Icon = iconMap[solution.icon] || Icons.HelpCircle;
            return (
              <div
                key={index}
                className="flex items-start gap-4 p-6 rounded-lg border border-border/50 bg-card/30"
              >
                <div className="relative p-3 rounded-md bg-muted/50">
                  <Icon className="h-6 w-6 text-muted-foreground" />
                  <X className="absolute -top-1 -right-1 h-4 w-4 text-destructive" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">
                    {solution.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {solution.problem}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <p className="text-lg text-foreground/80 font-medium">
            {falseSolutions.conclusion}
          </p>
        </div>
      </div>
    </section>
  );
};
