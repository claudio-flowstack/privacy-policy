import { siteConfig } from "@/config/content";

export const AvailableIndicator = () => {
  if (!siteConfig.available) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border/50">
        {/* Pulsing green dot */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span className="text-xs font-medium tracking-widest uppercase text-foreground">
          Available
        </span>
      </div>
    </div>
  );
};
