/**
 * Landing Page - 14-Section Psychological Framework
 * Content: German - B2B Process Architecture
 * Style: jousefmurad.com (dark theme, gold accents)
 */

import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Sponsors } from "./components/Sponsors"; // Section 2: Trust Strip
import { EmotionalReframe } from "./components/EmotionalReframe"; // Section 3
import { ProblemMirror } from "./components/ProblemMirror"; // Section 4
import { Consequences } from "./components/Consequences"; // Section 5
import { FalseSolutions } from "./components/FalseSolutions"; // Section 6
import { Differentiator } from "./components/Differentiator"; // Section 7
import { Outcomes } from "./components/Outcomes"; // Section 8
import { Services } from "./components/Services"; // Section 9: Implementation Areas
import { Timeline } from "./components/Timeline"; // Section 10: Process
import { Testimonials } from "./components/Testimonials"; // Section 11: Social Proof
import { FAQ } from "./components/FAQ"; // Section 13
import { Cta } from "./components/Cta"; // Sections 12 + 14: ROI/Urgency + Final CTA
import { Footer } from "./components/Footer";
import { ScrollToTop } from "./components/ScrollToTop";
import { AvailableIndicator } from "./components/AvailableIndicator";
import "./App.css";

function App() {
  return (
    <>
      <Navbar />
      {/* Section 1: Hero */}
      <Hero />
      {/* Section 2: Trust Strip (Metrics + Logos) */}
      <Sponsors />
      {/* Section 3: Emotional Reframe */}
      <EmotionalReframe />
      {/* Section 4: Problem Mirror */}
      <ProblemMirror />
      {/* Section 5: Consequences */}
      <Consequences />
      {/* Section 6: False Solutions */}
      <FalseSolutions />
      {/* Section 7: Core Differentiator */}
      <Differentiator />
      {/* Section 8: Outcomes */}
      <Outcomes />
      {/* Section 9: Implementation Areas (Services) */}
      <Services />
      {/* Section 10: Process (Timeline) */}
      <Timeline />
      {/* Section 11: Social Proof (Testimonials) */}
      <Testimonials />
      {/* Section 13: FAQ */}
      <FAQ />
      {/* Sections 12 + 14: ROI/Urgency + Final CTA */}
      <Cta />
      <Footer />
      <ScrollToTop />
      <AvailableIndicator />
    </>
  );
}

export default App;
