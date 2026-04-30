import Header from "../components/sections/Header";
import Hero from "../components/sections/Hero";
import SocialProof from "../components/sections/SocialProof";
import ValueProps from "../components/sections/ValueProps";
import Products from "../components/sections/Products";
import Pricing from "../components/sections/Pricing";
import Features from "../components/sections/Features";
import Integrations from "../components/sections/Integrations";
import Testimonials from "../components/sections/Testimonials";
import FAQ from "../components/sections/FAQ";
import Footer from "../components/sections/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased selection:bg-green-500/30 selection:text-green-200">
      <Header />
      <main>
        <Hero />
        <SocialProof />
        <ValueProps />
        <Products />
        <Pricing />
        <Features />
        <Integrations />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
