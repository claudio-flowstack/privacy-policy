import { useState } from "react";
import { services } from "@/config/content";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

const iconMap: Record<string, LucideIcon> = {
  Search: Icons.Search,
  PenTool: Icons.PenTool,
  Code: Icons.Code,
  Rocket: Icons.Rocket,
  Headphones: Icons.Headphones,
  Target: Icons.Target,
  Megaphone: Icons.Megaphone,
  Settings: Icons.Settings,
  MessageCircle: Icons.MessageCircle,
  BarChart3: Icons.BarChart3,
  FolderOpen: Icons.FolderOpen,
};

export const Services = () => {
  const [activeTab, setActiveTab] = useState(0);
  const activeService = services.items[activeTab];
  const ActiveIcon = iconMap[activeService?.icon] || Icons.Package;

  return (
    <section id="services" className="container py-16 sm:py-24">
      {/* Section Header */}
      <div className="text-center mb-10 md:mb-14">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-elegant mb-4">
          {services.headline}
        </h2>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Tab Navigation - Scrollable on Mobile */}
        <div className="relative mb-8">
          <div className="flex overflow-x-auto pb-2 gap-2 md:gap-3 px-2 md:px-0 md:flex-wrap md:justify-center scrollbar-hide">
            {services.items.map((service, index) => {
              const Icon = iconMap[service.icon] || Icons.Package;
              return (
                <button
                  key={service.title}
                  onClick={() => setActiveTab(index)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0",
                    activeTab === index
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{service.title}</span>
                  <span className="sm:hidden">{service.title.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Tab Content */}
        <div className="rounded-2xl border border-border bg-card p-6 md:p-10 shadow-sm">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Left: Icon + Title */}
            <div>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <ActiveIcon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl md:text-2xl font-medium text-foreground mb-3">
                {activeService?.title}
              </h3>
              <Button asChild className="group mt-4">
                <Link to="/kostenlose-beratung">
                  Mehr erfahren
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>

            {/* Right: Features */}
            <div className="bg-muted/30 rounded-xl p-5 md:p-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
                Was enthalten ist
              </p>
              <ul className="space-y-3">
                {activeService?.items?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-primary/10 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-base text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Tab Indicators (Mobile) */}
        <div className="flex justify-center gap-1.5 mt-6 md:hidden">
          {services.items.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                activeTab === index ? "bg-primary w-6" : "bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
