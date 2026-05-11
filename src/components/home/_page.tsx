import Image from "next/image";

export default function SobreNos() {
  return (
    <section className="w-full max-w-6xl mx-auto py-16 px-4">
      <div className="flex flex-col items-center text-center mb-12">
        <span className="text-4xl md:text-5xl font-bold text-(--primarycolor) leading-none">
          NOVIDADES NA
        </span>
        <div className="mt-2">
          <Image
            src="/logo2.png"
            alt="Primos Logo"
            width={350}
            height={120}
            className="object-contain"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-12">
        
        <div className="w-full md:w-1/2 flex justify-center">
          <Image
            src="/caixa-ferramentas.png"
            alt="Promoção Copa do Mundo Primos"
            width={550}
            height={400}
            className="rounded-lg object-contain"
          />
        </div>

        <div className="w-full md:w-1/2 flex flex-col items-start text-left">
          <h2 className="text-3xl md:text-4xl font-bold text-[#b91c1c] mb-4">
            COPA DO MUNDO 2026
          </h2>

          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            Não perca! A partir de 15/05 começa a Promoção da Copa do Mundo 2026 
            aqui na PRIMOS. Serão ofertas exclusivas, preços especiais e o melhor: 
            prêmios imperdíveis que você só encontra nessa campanha.
          </p>

          <p className="font-semibold text-(--primarycolor) mb-8 text-xl">
            Quer mais? Economia de verdade e ainda com brindes!
          </p>

          <button className="px-12 py-3 border-2 border-(--primarycolor) text-(--primarycolor) rounded-full font-bold text-xl hover:bg-(--primarycolor) hover:text-white transition-all duration-300 cursor-pointer shadow-sm">
            Saiba mais
          </button>
        </div>
        
      </div>
    </section>
  );
}