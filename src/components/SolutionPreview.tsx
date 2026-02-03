import { solutionPreview } from "@/config/content";
import { DollarSign, Zap, TrendingUp } from "lucide-react";

const iconMap: { [key: string]: React.ElementType } = {
  DollarSign,
  Zap,
  TrendingUp,
};

export const SolutionPreview = () => {
  return (
    <section className="py-20 md:py-28 bg-primary/5">
      <div className="container">
        {/* Headline */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-elegant">
            {solutionPreview.headline}
          </h2>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {solutionPreview.benefits.map((benefit, index) => {
            const Icon = iconMap[benefit.icon] || DollarSign;
            return (
              <div
                key={index}
                className="bg-card border border-border/50 rounded-xl p-8 hover:border-primary/30 transition-colors"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-4">
                  {benefit.title}
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Closing Statement */}
        <div className="text-center mt-12">
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {solutionPreview.closing}
          </p>
        </div>
      </div>
    </section>
  );
};

export default SolutionPreview;
