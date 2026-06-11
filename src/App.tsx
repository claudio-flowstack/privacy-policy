/**
 * Flowstack Systems Landing Page
 * React Router configuration with lazy-loaded pages
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import CookieBanner from "./components/CookieBanner";
import "./App.css";

// Lazy-loaded pages for code splitting
const HomePage = lazy(() => import("./pages/HomePage"));
const HomePageV2 = lazy(() => import("./pages/HomePageV2"));
const HomePageV3 = lazy(() => import("./pages/HomePageV3"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const ApplePage = lazy(() => import("./pages/ApplePage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const LinkedInDashboardPage = lazy(() => import("./pages/LinkedInDashboardPage"));
const FormularPage = lazy(() => import("./pages/FormularPage"));
const DankePage = lazy(() => import("./pages/DankePage"));
const ImpressumPage = lazy(() => import("./pages/ImpressumPage"));
const DatenschutzPage = lazy(() => import("./pages/DatenschutzPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const AutomationDashboardPage = lazy(() => import("./pages/AutomationDashboardPage"));
const ContentDashboardPage = lazy(() => import("./pages/ContentDashboardPage"));
const ColdMailDashboardPage = lazy(() => import("./pages/ColdMailDashboardPage"));
const HubDashboardPage = lazy(() => import("./pages/HubDashboardPage"));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const NodeLabPage = lazy(() => import("./pages/NodeLabPage"));

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      // Hash-Navigation: Zum Element scrollen
      const el = document.getElementById(hash.replace("#", ""));
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<div className="min-h-screen bg-[#0a0a0e]" />}>
        <Routes>
          <Route path="/" element={<HomePageV3 />} />
          <Route path="/v1" element={<HomePage />} />
          <Route path="/v2" element={<HomePageV2 />} />
          <Route path="/lp" element={<LandingPage />} />
          <Route path="/ap" element={<ApplePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/linkedin" element={<LinkedInDashboardPage />} />
          <Route path="/systems" element={<AutomationDashboardPage />} />
          <Route path="/content" element={<ContentDashboardPage />} />
          <Route path="/coldmail" element={<ColdMailDashboardPage />} />
          <Route path="/hub" element={<HubDashboardPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/node-lab" element={<NodeLabPage />} />
          <Route path="/kostenlose-beratung" element={<FormularPage />} />
          <Route path="/danke" element={<DankePage />} />
          <Route path="/impressum" element={<ImpressumPage />} />
          <Route path="/datenschutz" element={<DatenschutzPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <CookieBanner />
    </Router>
  );
}

export default App;
