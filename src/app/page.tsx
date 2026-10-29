import HeroCarousel from "@/features/home/components/hero-carousel";
import NewsSection from "@/features/home/components/news-section";
import ProductsSection from "@/features/home/components/products-section";
import AboutSection from "@/features/home/components/about-section";
import SiteHeader from "@/components/layout/site-header";
import SiteFooter from "@/components/layout/site-footer";
import FloatingWhatsApp from "@/components/layout/floating-whatsapp";
import ShopSection from "@/features/home/components/shop-section";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <SiteHeader />
      <main>
        <h1 className="sr-only">Primos Lar e Construção — Materiais de construção em Sorocaba</h1>
        <div id="home" className="w-full"><HeroCarousel /></div>
        <NewsSection />
        <AboutSection />
        <ShopSection />
      </main>
      <SiteFooter />
      <FloatingWhatsApp />
    </div>
  );
}
