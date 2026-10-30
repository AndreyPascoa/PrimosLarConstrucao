"use client";

import Image from "next/image";
import { usePublicContent } from "./public-content";
import { useState } from "react";
import { Package } from "lucide-react";
export default function Vendas({ onAdd }: { onAdd: (id: string) => void }) {
  const { products, categories, settings, catalogAvailable } =
    usePublicContent();
  const [useFilter, setUseFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const produtosFiltrados = products.filter(
    (p) =>
      (useFilter === "Todos" || p.categoryId === useFilter) &&
      `${p.name} ${p.description}`
        .toLocaleLowerCase("pt-BR")
        .includes(search.toLocaleLowerCase("pt-BR")),
  );
  const filtros = [
    {
      id: "Todos",
      name: "Todos",
      primaryColor: settings.primaryColor,
      secondaryColor: "#FEE2E2",
    },
    ...categories,
  ];
  return (
    <section className="w-full py-20 px-6 bg-white" id="shop">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold tracking-widest text-(--primarycolor) uppercase mb-3">
            Depósito de Material de Construção em Sorocaba
          </h2>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            {settings.catalogTitle}
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
            {settings.catalogText}
          </p>
        </div>

        <label className="block mb-6">
          <span className="sr-only">Buscar produtos</span>
          <input
            type="search"
            aria-label="Buscar produtos"
            placeholder="Buscar produtos…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full border border-gray-200 rounded-full bg-slate-50 px-5 py-3"
          />
        </label>
        <div className="flex flex-wrap w-full gap-3 mb-8">
          {filtros.map((item) => {
            const cores = {
              primaria: item.primaryColor,
              secundaria: item.secondaryColor,
            };
            const selecionado = useFilter === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setUseFilter(item.id);
                  setPage(1);
                }}
                aria-pressed={selecionado}
                style={{
                  backgroundColor: selecionado
                    ? cores.primaria
                    : cores.secundaria,

                  color: selecionado ? "#FFFFFF" : cores.primaria,
                }}
                className="rounded-full px-5 py-3 font-semibold shadow-md cursor-pointer transition-all hover:scale-105"
              >
                {item.name}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-center">
          {produtosFiltrados.slice((page - 1) * 12, page * 12).map((item) => {
            const cores = {
              primaria: item.category?.primaryColor,
              secundaria: item.category?.secondaryColor,
            };

            return (
              <div
                key={item.id}
                className="group bg-slate-50 rounded-[2.5rem] p-4 border border-gray-100 hover:shadow-2xl transition-all duration-500 flex flex-col items-center text-center cursor-pointer"
              >
                <div className="relative w-full h-64">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl!}
                      alt={item.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 640px) 100vw, 400px"
                    />
                  ) : (
                    <Package
                      size={64}
                      className="m-auto h-full text-slate-300"
                    />
                  )}
                </div>

                <div className="flex gap-4 mb-2 text-center justify-center items-center">
                  <div
                    style={{ background: cores.secundaria }}
                    className="flex gap-2 mb-2 rounded-3xl p-2 shadow-md text-center justify-center items-center"
                  >
                    <Package color={cores.primaria} size={14} />

                    <span
                      style={{ color: cores.primaria }}
                      className="text-[9px] font-bold uppercase tracking-[0.2em]"
                    >
                      {item.category?.name}
                    </span>
                  </div>

                  <h3 className="text-l font-black text-(--primarycolor) mb-2">
                    {item.name}
                  </h3>
                </div>

                <p className="text-sm text-gray-500 leading-snug min-h-10">
                  {item.description}
                </p>

                <button
                  onClick={() => onAdd(item.id)}
                  className="bg-(--primarycolor) p-3 mt-4 w-full rounded-3xl"
                >
                  <span className="text-white">Adicionar ao orçamento</span>
                </button>
              </div>
            );
          })}
        </div>

        {!catalogAvailable && (
          <p role="status" className="text-center py-10">
            Catálogo temporariamente indisponível. Consulte nossa equipe pelo
            WhatsApp.
          </p>
        )}
        {catalogAvailable && !produtosFiltrados.length && (
          <p role="status" className="text-center py-10">
            Nenhum produto encontrado.
          </p>
        )}
        {produtosFiltrados.length > 12 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              Anterior
            </button>
            <span>
              {page} / {Math.ceil(produtosFiltrados.length / 12)}
            </span>
            <button
              disabled={page * 12 >= produtosFiltrados.length}
              onClick={() => setPage(page + 1)}
            >
              Próxima
            </button>
          </div>
        )}
        <div className="mt-16 text-center border-t border-gray-100 pt-10">
          <p className="text-gray-500 italic text-sm">
            Atendimento técnico especializado e{" "}
            <strong>
              entrega rápida de materiais de construção em Sorocaba e região
            </strong>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
