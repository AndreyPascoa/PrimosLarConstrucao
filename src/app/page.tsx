import Carousel from "@/components/carousel/_page";
import Contato from "@/components/contato/_page";
import Navbar from "@/components/navbar/_page";
import Novidade from "@/components/novidade/_page";
import Produtos from "@/components/produto/_page";
import SobreNos from "@/components/sobrenos/_page";
import FloatingWhatsApp from "@/components/whatsapp/_page";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Navbar />
      <div id="home" className="w-full"><Carousel/></div>
      <Novidade />
      <div id="sobre" className="w-full"><SobreNos /></div>
      <div id="produtos" className="w-full"><Produtos /></div>
      <div id="contato" className="w-full"><Contato /></div>
      <FloatingWhatsApp />
    </div>
  );
}