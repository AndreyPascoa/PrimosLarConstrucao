import { ShoppingCart, Hammer, Zap, Paintbrush, Nut, Droplets, HardHat, Layers } from "lucide-react";
import { productCategories } from "../data/products";
import { getWhatsAppUrl } from "@/lib/whatsapp";

const categoryIcons = { Hammer, Zap, Paintbrush, Nut, Droplets, HardHat, Layers };

export default function Produtos() {
    return (
        <section className="w-full py-20 px-6 bg-white" id="produtos">
            <div className="max-w-7xl mx-auto">

                <div className="text-center mb-16">
                    <h2 className="text-sm font-bold tracking-widest text-(--primarycolor) uppercase mb-3">
                        Depósito de Material de Construção em Sorocaba
                    </h2>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
                        Soluções Completas para sua <span className="text-(--primarycolor)">Obra</span>
                    </h2>
                    <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
                        Na <strong>Primos Lar e Construção</strong>, você encontra do material bruto às ferramentas de precisão.
                        Atendemos Sorocaba e região com logística própria e as marcas líderes como
                        <em> Quartzolit, Amanco, Votorantim, Gerdau e Bosch.</em>
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-center">
                    {productCategories.map((produto) => {
                        const Icon = categoryIcons[produto.icon];
                        return (
                        <div
                            key={produto.id}
                            className="group bg-slate-50 rounded-[2.5rem] p-8 border border-gray-100 hover:border-(--primarycolor) hover:shadow-2xl transition-all duration-500 flex flex-col items-center text-center"
                        >
                            <div className="w-24 h-24 bg-white text-(--primarycolor) rounded-3xl flex items-center justify-center shadow-md mb-6 group-hover:scale-110 group-hover:bg-(--primarycolor) group-hover:text-white transition-all duration-500">
                                <Icon size={64} />
                            </div>

                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-(--primarycolor) mb-2">
                                {produto.categoria}
                            </span>

                            <h3 className="text-xl font-black text-slate-900 mb-2">
                                {produto.nome}
                            </h3>

                            <p className="text-sm text-gray-500 mb-8 leading-snug min-h-10">
                                {produto.descricao}
                            </p>

                            <a
                                href={getWhatsAppUrl(`Olá! Vi no site e gostaria de um orçamento de ${produto.nome}`)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center mt-auto justify-center gap-3 w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-(--primarycolor) transition-all duration-300 shadow-lg transform group-hover:-translate-y-1"
                            >
                                <ShoppingCart size={18} />
                                Orçar Agora
                            </a>
                        </div>
                    );
                    })}
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