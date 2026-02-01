import { teamContent } from "@/config/content";

export const TeamSection = () => {
  return (
    <section id="team" className="py-16 md:py-24 bg-card/30">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-elegant mb-6">
            {teamContent.headline}
          </h2>

          {/* Intro Text */}
          <div className="text-muted-foreground text-lg leading-relaxed">
            {teamContent.intro.split("\n\n").map((paragraph, index) => (
              <p key={index} className={index > 0 ? "mt-4" : ""}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Team Members */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {teamContent.members.map((member, index) => (
            <div
              key={index}
              className="p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-colors text-center"
            >
              {/* Image */}
              <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-2 border-primary/20">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Name & Role */}
              <h3 className="text-xl font-medium text-foreground mb-1">
                {member.name}
              </h3>
              <p className="text-sm text-primary uppercase tracking-widest mb-4">
                {member.role}
              </p>

              {/* Description */}
              <p className="text-muted-foreground text-base leading-relaxed">
                {member.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
