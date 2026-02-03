import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Sponsors } from "@/components/Sponsors";
import { EmpathyOpening } from "@/components/EmpathyOpening";
import { ProblemMirror } from "@/components/ProblemMirror";
import { SolutionPreview } from "@/components/SolutionPreview";
import { FlowstackSystem } from "@/components/FlowstackSystem";
// import { CaseStudies } from "@/components/CaseStudies"; // TEMPORÄR AUSGEBLENDET
import { CtaInline } from "@/components/CtaInline";
import { Outcomes } from "@/components/Outcomes";
import { TargetAudience } from "@/components/TargetAudience";
import { Services } from "@/components/Services";
import { Timeline } from "@/components/Timeline";
import { TeamSection } from "@/components/TeamSection";
import { CtaFinal } from "@/components/CtaFinal";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AvailableIndicator } from "@/components/AvailableIndicator";

export const HomePage = () => {
  return (
    <>
      <Navbar />

      {/* 1. HERO */}
      <Hero />

      {/* 2. TRUST STRIP */}
      <Sponsors />

      {/* 3. EMPATHIE-OPENING */}
      <EmpathyOpening />

      {/* 4. PROBLEM MIRROR */}
      <ProblemMirror />

      {/* 5. LÖSUNG-PREVIEW */}
      <SolutionPreview />

      {/* 6. DAS FLOWSTACK-SYSTEM */}
      <FlowstackSystem />

      {/* 7. FALLSTUDIEN - TEMPORÄR AUSGEBLENDET (keine Kunden noch)
         Um wieder zu aktivieren: Kommentar entfernen
      <CaseStudies />
      */}

      {/* 8. CTA INLINE #1 */}
      <CtaInline />

      {/* 9. OUTCOMES */}
      <Outcomes />

      {/* 10. FÜR WEN */}
      <TargetAudience />

      {/* 11. LEISTUNGEN */}
      <Services />

      {/* 12. ABLAUF */}
      <Timeline />

      {/* 13. CTA INLINE #2 */}
      <CtaInline variant="secondary" />

      {/* 14. TEAM */}
      <TeamSection />

      {/* 15. FAQ */}
      <FAQ />

      {/* 16. FINALER CTA */}
      <CtaFinal />

      {/* 17. FOOTER */}
      <Footer />

      <ScrollToTop />
      <AvailableIndicator />
    </>
  );
};

export default HomePage;
