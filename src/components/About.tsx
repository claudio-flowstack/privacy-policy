import { aboutContent } from "@/config/content";

export const About = () => {
  return (
    <section id="about" className="container py-24 sm:py-32">
      {/* Section Header */}
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-elegant mb-4">
          {aboutContent.title}{" "}
          <span className="font-display italic text-primary">Us</span>
        </h2>
      </div>

      {/* Content Grid */}
      <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
        {/* Description */}
        <div className="space-y-6">
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed whitespace-pre-line">
            {aboutContent.description}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-6">
          {aboutContent.stats.map((stat, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-card border border-border/50 text-center"
            >
              <div className="text-3xl md:text-4xl font-light text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground tracking-wide uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
