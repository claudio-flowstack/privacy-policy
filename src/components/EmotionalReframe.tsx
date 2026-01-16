import { emotionalReframe } from "@/config/content";

export const EmotionalReframe = () => {
  return (
    <section className="container py-20 md:py-28">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-elegant mb-4">
          <span className="font-display italic text-primary">
            {emotionalReframe.headline}
          </span>
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          {emotionalReframe.subheadline}
        </p>
        <div className="text-left md:text-center">
          {emotionalReframe.content.split("\n\n").map((paragraph, index) => (
            <p
              key={index}
              className="text-base md:text-lg text-foreground/80 mb-4 leading-relaxed"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
};
