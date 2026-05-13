import {
    ShoppingCart,
    Hammer,
    Zap,
    Paintbrush,
    Nut,
    Droplets,
    HardHat,
    Layers
} from "lucide-react";

const listaProdutos = [
    {
        id: 1,
        nome: "Ferramentas e Equipamentos",
        categoria: "Profissional",
        icon: <Hammer size={64} />,
        descricao: "Furadeiras, parafusadeiras, discos diamantados, ferramentas manuais e medição a laser."
    },
    {
        id: 2,
        nome: "Elétrica e Iluminação",
        categoria: "Instalação",
        icon: <Zap size={64} />,
        descricao: "Fios e cabos antichama, disjuntores DIN, quadros de luz, lâmpadas LED e conduítes reforçados."
    },
    {
        id: 3,
        nome: "Pintura e Impermeabilização",
        categoria: "Acabamento",
        icon: <Paintbrush size={64} />,
        descricao: "Tintas acrílicas, vernizes, seladores, mantas líquidas e produtos contra umidade e infiltração."
    },
    {
        id: 4,
        nome: "Ferragens e Utilidades",
        categoria: "Organização",
        icon: <Nut size={64} />,
        descricao: "Parafusos sextavados, buchas, dobradiças, fechaduras de segurança e acessórios para marcenaria."
    },
    {
        id: 5,
        nome: "Hidráulica e Metais",
        categoria: "Encanamento",
        icon: <Droplets size={64} />,
        descricao: "Tubos de PVC e cobre, conexões tigre, registros de pressão, caixas d'água e metais sanitários."
    },
    {
        id: 6,
        nome: "Materiais Básicos e Brutos",
        categoria: "Estrutural",
        icon: <Layers size={64} />,
        descricao: "Cimento Votoran, cal hidratada, areia fina/média, pedra brita, blocos de concreto e tijolos."
    },
    {
        id: 7,
        nome: "EPIs e Segurança",
        categoria: "Proteção",
        icon: <HardHat size={64} />,
        descricao: "Botas com biqueira, luvas de proteção, capacetes, óculos de segurança e máscaras PFF2."
    },
];

export default function Produtos() {
    return (
        <section className="w-full py-20 px-6 bg-white" id="produtos">
            <div className="max-w-7xl mx-auto">

                <div className="text-center mb-16">
                    <h2 className="text-sm font-bold tracking-widest text-[#b91c1c] uppercase mb-3">
                        Depósito de Material de Construção em Sorocaba
                    </h2>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
                        Soluções Completas para sua <span className="text-[#b91c1c]">Obra</span>
                    </h1>
                    <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
                        Na <strong>Primos Ferragens</strong>, você encontra do material bruto às ferramentas de precisão.
                        Atendemos Sorocaba e região com logística própria e as marcas líderes como
                        <em> Quartzolit, Amanco, Votorantim, Gerdau e Bosch.</em>
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-center">
                    {listaProdutos.map((produto) => (
                        <div
                            key={produto.id}
                            className="group bg-slate-50 rounded-[2.5rem] p-8 border border-gray-100 hover:border-[#b91c1c] hover:shadow-2xl transition-all duration-500 flex flex-col items-center text-center"
                        >
                            <div className="w-24 h-24 bg-white text-[#b91c1c] rounded-3xl flex items-center justify-center shadow-md mb-6 group-hover:scale-110 group-hover:bg-[#b91c1c] group-hover:text-white transition-all duration-500">
                                {produto.icon}
                            </div>

                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b91c1c] mb-2">
                                {produto.categoria}
                            </span>

                            <h3 className="text-xl font-black text-slate-900 mb-2">
                                {produto.nome}
                            </h3>

                            <p className="text-sm text-gray-500 mb-8 leading-snug min-h-10">
                                {produto.descricao}
                            </p>

                            <a
                                href={`https://wa.me/551532293388?text=Olá! Vi no site e gostaria de um orçamento de ${produto.nome}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center mt-auto justify-center gap-3 w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-[#b91c1c] transition-all duration-300 shadow-lg transform group-hover:-translate-y-1"
                            >
                                <ShoppingCart size={18} />
                                Orçar Agora
                            </a>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center border-t border-gray-100 pt-10">
                    <p className="text-gray-500 italic text-sm">
                        * Atendimento técnico especializado e <strong>entrega rápida de materiais de construção em Sorocaba e região</strong>.
                    </p>
                </div>
            </div>
        </section>
    );
}