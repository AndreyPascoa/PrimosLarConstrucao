import { 
  ShoppingCart, 
  Hammer, 
  Zap, 
  Paintbrush, 
  Nut, 
  Droplets, 
  HardHat,
  Layers // Ícone para Material Básico
} from "lucide-react";

const listaProdutos = [
    {
        id: 1,
        nome: "Ferramentas Manuais",
        categoria: "Ferramentas",
        icon: <Hammer size={64} />,
    },
    {
        id: 2,
        nome: "Material Elétrico",
        categoria: "Construção",
        icon: <Zap size={64} />,
    },
    {
        id: 3,
        nome: "Tintas e Acessórios",
        categoria: "Acabamento",
        icon: <Paintbrush size={64} />,
    },
    {
        id: 4,
        nome: "Ferragens em Geral",
        categoria: "Utilidades",
        icon: <Nut size={64} />,
    },
    {
        id: 5,
        nome: "Material Hidráulico",
        categoria: "Construção",
        icon: <Droplets size={64} />,
    },
    {
        id: 6,
        nome: "Materiais Básicos",
        categoria: "Brutos",
        icon: <Layers size={64} />,
        descricao: "Areia, Pedra, Cimento e Blocos"
    },
    {
        id: 7,
        nome: "EPIS e Segurança",
        categoria: "Segurança",
        icon: <HardHat size={64} />,
    },
];

export default function Produtos() {
    return (
        <section className="w-full py-20 px-6 bg-white">
            <div className="max-w-7xl mx-auto">
                
                <div className="text-center mb-16">
                    <h2 className="text-sm font-bold tracking-widest text-[#b91c1c] uppercase mb-3">
                        As Melhores Marcas
                    </h2>
                    <p className="text-4xl md:text-5xl font-extrabold text-(--primarycolor) uppercase">
                        Nossos Produtos
                    </p>
                    <div className="h-1.5 w-20 bg-[#b91c1c] mx-auto mt-4 rounded-full"></div>
                    <p className="text-gray-500 mt-6 max-w-2xl mx-auto text-lg">
                        De materiais brutos como <strong>areia e cimento</strong> até o acabamento final, temos tudo para sua obra.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
                    {listaProdutos.map((produto) => (
                        <div 
                            key={produto.id} 
                            className="group bg-slate-50 rounded-[2.5rem] p-8 border border-gray-100 hover:border-[#b91c1c] hover:shadow-xl transition-all duration-500 flex flex-col items-center text-center"
                        >
                            <div className="w-24 h-24 bg-white text-[#b91c1c] rounded-3xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 group-hover:bg-[#b91c1c] group-hover:text-white transition-all duration-500">
                                {produto.icon}
                            </div>

                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                                {produto.categoria}
                            </span>

                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                {produto.nome}
                            </h3>
                            
                            <p className="text-sm text-gray-500 mb-6 h-5">
                                {produto.descricao || ""}
                            </p>
                            
                            <a 
                                href={`https://wa.me/551532293388?text=Olá! Gostaria de solicitar um orçamento de ${produto.nome}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-4 bg-white border border-gray-200 text-gray-900 font-bold rounded-2xl hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-300 shadow-sm"
                            >
                                <ShoppingCart size={18} />
                                Orçar Agora
                            </a>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <p className="text-gray-400 italic text-sm">
                        *Entregas rápidas de areia e pedra em toda Sorocaba e região.
                    </p>
                </div>
            </div>
        </section>
    );
}