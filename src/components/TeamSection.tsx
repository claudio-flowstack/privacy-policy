import { teamContent } from "@/config/content";

export const TeamSection = () => {
  return (
    <section id="team" className="py-16 sm:py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-light tracking-elegant">
            {teamContent.headline}{" "}
            <span className="font-display italic text-primary">
              {teamContent.headlineAccent}
            </span>
          </h2>
        </div>

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
                  className="w-full h-full object-cover object-top"
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
              <p className="text-muted-foreground text-sm leading-relaxed">
                {member.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
