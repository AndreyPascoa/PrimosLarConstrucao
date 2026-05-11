import Carousel from "@/components/carousel/_page";
import Navbar from "@/components/navbar/_page";
import Novidade from "@/components/novidade/_page";
import SobreNos from "@/components/sobrenos/_page";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Navbar />
      <Carousel/>
      <Novidade />
      <SobreNos />
    </div>
  );
}
