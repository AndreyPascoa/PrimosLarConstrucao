import Carousel from "@/components/carousel/_page";
import SobreNos from "@/components/home/_page";
import Navbar from "@/components/navbar/_page";

export default function Home() {
  return (
    <div>
      <Navbar />
      <Carousel/>
      <SobreNos />
    </div>
  );
}
