import { Navigation } from "@/components/navigation";
import { Hero } from "@/components/hero";
import { PortfolioGrid } from "@/components/portfolio-grid";
// import { ProcessingSection } from "@/components/before-after";
import { PriceList } from "@/components/price-list";
import { Contact, Footer } from "@/components/contact";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navigation />
      <Hero />
      <PortfolioGrid />
      {/* <ProcessingSection /> */}
      <PriceList />
      <Contact />
      <Footer />
    </main>
  );
}
