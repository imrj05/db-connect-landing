import Navbar from "./_components/Navbar";
import HeroSection from "./_components/HeroSection";
import DatabasesSection from "./_components/DatabasesSection";
import FeaturesSection from "./_components/FeaturesSection";
import DXSection from "./_components/DXSection";
import WhySection from "./_components/WhySection";
import RoadmapSection from "./_components/RoadmapSection";
import CTASection from "./_components/CTASection";
import Footer from "./_components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <DatabasesSection />
        <FeaturesSection />
        <DXSection />
        <WhySection />
        <RoadmapSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
