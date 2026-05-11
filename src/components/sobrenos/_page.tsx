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

                {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
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
                </div> */}

                <div className="flex flex-col md:flex-row items-center gap-12 mb-24">
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

                        <div className="flex gap-8 pt-4">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-[#b91c1c]">+40 anos</p>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">De Mercado</p>
                            </div>
                            <div className="h-12 w-pw bg-gray-200"></div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-[#b91c1c]">1k+</p>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Produtos</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-extrabold text-(--primarycolor)">
                            Onde <span className="text-[#b91c1c]">Estamos</span>
                        </h2>
                        <p className="text-gray-500 mt-2">Venha nos visitar e conhecer nossa loja física</p>
                    </div>

                    <div className="w-full h-112.5 rounded-3xl overflow-hidden shadow-inner border border-gray-100">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3658.5205578617943!2d-47.4892833!3d-23.513772499999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94c58b1ff6184c1b%3A0xc7639d8d4b76d3b3!2sPrimos%20Lar%20e%20Constru%C3%A7%C3%A3o!5e0!3m2!1spt-BR!2sbr!4v1778510143956!5m2!1spt-BR!2sbr"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen={true}
                            loading="lazy"
                            title="Localização Primos Ferragens"
                        />
                    </div>

                    <div className="mt-8 text-center text-gray-600 italic border-t pt-6">
                        <p className="font-medium">Av. Dr. Armando Pannunzio, 90 - Cerrado, Sorocaba - SP, 18050-000</p>
                        <p className="text-sm text-gray-400">Próximo ao Burger King</p>
                    </div>
                </div>

            </div>
        </section>
    );
}