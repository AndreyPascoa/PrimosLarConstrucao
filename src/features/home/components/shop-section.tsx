'use client'

import Image from "next/image";
import { ShopItens } from "../data/shop";
import { CategoriaCores, CategoriaFiltro, CategoriaProduto, coresCategorias, ProductType } from "../types/product-type";
import { useState } from "react";

export default function Vendas() {

    const [useFilter, setUseFilter] = useState<CategoriaProduto | "Todos">("Todos");

    const produtosFiltrados = ShopItens.filter((item) => {
        return (
            useFilter === "Todos" || item.categoria === useFilter
        );
    });

    const categorias: CategoriaFiltro[] = [
        "Todos",
        ...(Object.keys(coresCategorias) as CategoriaProduto[])
    ];

    const coresFiltro: Record<CategoriaFiltro, CategoriaCores> = {
        ...coresCategorias,

        Todos: {
            primaria: "#BA2018",
            secundaria: "#FEE2E2"
        }
    }

    return (
        <section className="w-full py-20 px-6 bg-white" id="shop">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-sm font-bold tracking-widest text-(--primarycolor) uppercase mb-3">
                        Depósito de Material de Construção em Sorocaba
                    </h2>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
                        Catalogo de  <span className="text-(--primarycolor)">Materiais</span>
                    </h2>
                    <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
                        Pode ser que nem todos os nossos produtos estejam aqui, entre em contato no nosso <strong>whatsapp</strong> para caso de dúvidas.
                    </p>
                </div>

                <div className="flex flex-wrap w-full gap-3 mb-8">
                    {categorias.map((item) => {
                        const cores = coresFiltro[item];
                        const selecionado = useFilter === item;

                        return (
                            <button
                                key={item}
                                type="button"
                                onClick={() => setUseFilter(item)}
                                style={{
                                    backgroundColor: selecionado
                                        ? cores.primaria
                                        : cores.secundaria,

                                    color: selecionado
                                        ? "#FFFFFF"
                                        : cores.primaria
                                }}
                                className="rounded-full px-5 py-3 font-semibold shadow-md cursor-pointer transition-all hover:scale-105"
                            >
                                {item}
                            </button>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-center">
                    {
                        produtosFiltrados.map((item) => {
                            const cores = coresCategorias[item.categoria];

                            return (
                                <div key={item.id} className="group bg-slate-50 rounded-[2.5rem] p-4 border border-gray-100 hover:shadow-2xl transition-all duration-500 flex flex-col items-center text-center cursor-pointer" >

                                    <div className="relative w-full h-64">
                                        <Image
                                            src={item.image}
                                            alt={item.nome}
                                            fill
                                            className="object-contain"
                                            sizes="(max-width: 640px) 100vw, 400px"
                                        />
                                    </div>

                                    <div className="flex gap-4 mb-2 text-center justify-center items-center">
                                        <div style={{ background: cores.secundaria, }} className="flex gap-2 mb-2 rounded-3xl p-2 shadow-md text-center justify-center items-center">
                                            <item.icon color={cores.primaria} size={14} />

                                            <span style={{ color: cores.primaria }} className="text-[9px] font-bold uppercase tracking-[0.2em]">
                                                {item.categoria}
                                            </span>
                                        </div>

                                        <h3 className="text-l font-black text-(--primarycolor) mb-2">
                                            {item.nome}
                                        </h3>
                                    </div>

                                    <p className="text-sm text-gray-500 leading-snug min-h-10">
                                        {item.descricao}
                                    </p>

                                    <button className="bg-(--primarycolor) p-3 w-full rounded-3xl">
                                        <span className="text-white">Adicionar ao carrinho</span>
                                    </button>

                                </div>
                            )
                        })
                    }
                </div>

                <div className="mt-16 text-center border-t border-gray-100 pt-10">
                    <p className="text-gray-500 italic text-sm">
                        Atendimento técnico especializado e <strong>entrega rápida de materiais de construção em Sorocaba e região</strong>.
                    </p>
                </div>
            </div>
        </section>
    )
}