import { Features } from "@/components/marketing/Features";
import { Footer } from "@/components/marketing/Footer";
import { Hero } from "@/components/marketing/Hero";
import { Pricing } from "@/components/marketing/Pricing";

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <Hero />
      <Features />
      <Pricing />
      <Footer />
    </main>
  );
}
