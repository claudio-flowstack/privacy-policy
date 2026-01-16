import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { services } from "@/config/content";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";

// Icon mapping for new German services
const iconMap: Record<string, LucideIcon> = {
  Target: Icons.Target,
  FolderKanban: Icons.FolderKanban,
  MessageSquare: Icons.MessageSquare,
  ArrowLeftRight: Icons.ArrowLeftRight,
  BarChart3: Icons.BarChart3,
  Bot: Icons.Bot,
  // Legacy icons
  TrendingUp: Icons.TrendingUp,
  Send: Icons.Send,
  Puzzle: Icons.Puzzle,
};

export const Services = () => {
  return (
    <section id="services" className="container py-24 sm:py-32">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-light tracking-elegant">
          Wo wir
          <span className="font-display italic text-primary"> ansetzen</span>
        </h2>
        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
          Unsere Prozessarchitektur umfasst alle kritischen Bereiche deines Unternehmens.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => {
          const IconComponent = iconMap[service.icon] || Icons.HelpCircle;
          return (
            <Card
              key={service.title}
              className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors group"
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <IconComponent className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg font-medium tracking-wide">
                  {service.title}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                  {service.description}
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </section>
  );
};
