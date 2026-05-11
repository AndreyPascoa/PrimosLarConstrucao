import { Users, Target, Eye, ShieldCheck } from "lucide-react";
import Image from "next/image";

const Cards = [
    {
        title: "Quem Somos",
        content: "Com anos de tradição no setor de ferragens e construção, a Primos nasceu para consolidar a confiança entre quem constrói e quem fornece, unindo tradição e inovação.",
        icon: <Users size={32} strokeWidth={1.5} />
    },
    {
        title: "Nossa Missão",
        content: "Prover soluções completas em ferramentas e acabamentos, garantindo que cada obra, do pequeno reparo ao grande empreendimento, tenha o selo de qualidade Primos.",
        icon: <Target size={32} strokeWidth={1.5} />
    },
    {
        title: "Nossa Visão",
        content: "Ser a principal referência regional em soluções para o lar e construção, reconhecida pela excelência no atendimento e pela curadoria rigorosa de nossos produtos.",
        icon: <Eye size={32} strokeWidth={1.5} />
    },
    {
        title: "Nossos Valores",
        content: "Pautamos nossa atuação na transparência comercial, no respeito técnico às normas de segurança e no compromisso inegociável com a satisfação do cliente.",
        icon: <ShieldCheck size={32} strokeWidth={1.5} />
    }
];

export default function SobreNos() {
    return (
        <section className="w-full bg-slate-50 py-20 px-6">
            <div className="max-w-7xl mx-auto">

                <div className="text-center mb-16">
                    <h2 className="text-sm font-bold tracking-widest text-[#b91c1c] uppercase mb-3">
                        Nossa História
                    </h2>
                    <p className="text-4xl md:text-5xl font-extrabold text-(--primarycolor)">
                        Sobre Nós
                    </p>
                    <div className="h-1.5 w-20 bg-[#b91c1c] mx-auto mt-4 rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {Cards.map((card, index) => (
                        <div
                            key={index}
                            className="group bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                        >
                            <div className="w-16 h-16 bg-red-50 text-[#b91c1c] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#b91c1c] group-hover:text-white transition-all duration-500 rotate-3 group-hover:rotate-0">
                                {card.icon}
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">
                                {card.title}
                            </h3>

                            <p className="text-gray-600 leading-relaxed text-sm">
                                {card.content}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 mt-15">

                <div className="w-full md:w-1/2 relative h-100 rounded-2xl overflow-hidden shadow-xl">
                    <Image
                        src="/fachada_primos.png" 
                        alt="Fachada da Loja Primos Ferragens e Construção" 
                        fill
                        className="object-cover"
                    />
                </div>

                <div className="w-full md:w-1/2 space-y-6">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-(--primarycolor) leading-tight">
                        Tradição e Qualidade em <span className="text-[#b91c1c]">Ferragens e Construção</span>
                    </h2>

                    <p className="text-gray-700 text-lg leading-relaxed">
                        Desde a nossa fundação, a <strong>Primos</strong> tem sido o braço direito de profissionais e proprietários que buscam o que há de melhor em <strong>materiais de construção e ferramentas</strong>. Localizada estrategicamente para atender nossa região, oferecemos um catálogo completo que vai desde o alicerce ao acabamento.
                    </p>

                    <p className="text-gray-700 text-lg leading-relaxed">
                        Nosso compromisso é com a durabilidade de sua obra. Por isso, trabalhamos apenas com marcas renomadas e uma curadoria técnica rigorosa, garantindo que você tenha em mãos ferramentas que proporcionam <strong>segurança, eficiência e o melhor custo-benefício</strong>.
                    </p>

                    <div className="flex gap-4 pt-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-[#b91c1c]">+40 anos</p>
                            <p className="text-sm text-gray-500 uppercase">De Mercado</p>
                        </div>
                        <div className="h-10 w-pw bg-gray-200"></div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-[#b91c1c]">1k+</p>
                            <p className="text-sm text-gray-500 uppercase">Produtos</p>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}