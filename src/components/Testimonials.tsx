import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { testimonials } from "@/config/content";

export const Testimonials = () => {
  return (
    <section id="testimonials" className="container py-24 sm:py-32">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-light tracking-elegant">
          What our
          <br />
          <span className="font-display italic text-primary">clients say</span>
        </h2>
        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
          See what our clients have to say about working with us and the results
          we helped them achieve.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {testimonials.map((testimonial, index) => (
          <Card
            key={index}
            className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors"
          >
            <CardHeader className="pb-4">
              {/* Company Logo */}
              <div className="h-10 mb-4">
                <img
                  src={testimonial.companyLogo}
                  alt="Company logo"
                  className="h-full w-auto object-contain opacity-70"
                />
              </div>

              {/* Quote */}
              <blockquote className="text-lg md:text-xl font-light text-foreground leading-relaxed">
                "{testimonial.quote}"
              </blockquote>
            </CardHeader>

            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                {testimonial.description}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border border-border">
                  <AvatarImage
                    alt={testimonial.author.name}
                    src={testimonial.author.image}
                  />
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    {testimonial.author.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <p className="font-medium text-sm text-foreground tracking-wide uppercase">
                    {testimonial.author.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.author.title}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
