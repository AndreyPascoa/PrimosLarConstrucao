"use client";
import { useSiteSettings } from "@/features/home/components/public-content";

import Image from "next/image";
import { CheckCircle2, MapPin, Clock, ShieldCheck } from "lucide-react";

export default function SobreNos() {
  const siteConfig = useSiteSettings();


  return (
    <section className="w-full bg-slate-50 py-20 px-6" id="sobre">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-bold tracking-[0.2em] text-(--primarycolor) uppercase mb-3">
            Desde 1981 em Sorocaba
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Especialistas em{" "}
            <span className="text-(--primarycolor)">
              Materiais de Construção
            </span>
          </h2>
          <div className="h-1.5 w-24 bg-(--primarycolor) mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-16 mb-24">
          <div className="w-full lg:w-1/2 relative h-112.5 rounded-[2.5rem] overflow-hidden shadow-2xl group">
            <Image
              src={siteConfig.aboutImage}
              alt="Fachada Primos Lar e Construção em Sorocaba - Av. Armando Pannunzio"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1023px) 100vw, 640px"
            />
            <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 to-transparent"></div>
            <div className="absolute bottom-8 left-8 text-white">
              <p className="text-sm font-bold uppercase tracking-widest opacity-80">
                Sua obra em boas mãos
              </p>
              <p className="text-2xl font-bold">
                Tradição que constrói confiança.
              </p>
            </div>
          </div>

          <div className="w-full lg:w-1/2 space-y-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-slate-900">
                {siteConfig.aboutTitle}
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                {siteConfig.aboutText}
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Trabalhamos com as marcas líderes do setor para garantir que sua
                obra tenha{" "}
                <strong>
                  durabilidade, segurança e o melhor custo-benefício da região
                </strong>
                .
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {[
                "Entrega Rápida em Sorocaba",
                "Melhores Marcas do Mercado",
                "Orçamento Ágil via WhatsApp",
                "Suporte Técnico Especializado",
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 text-slate-800 font-semibold"
                >
                  <CheckCircle2 className="text-(--primarycolor)" size={22} />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-12 pt-6 border-t border-gray-200">
              <div>
                <p className="text-4xl font-black text-(--primarycolor)">45</p>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-tighter">
                  Anos de História
                </p>
              </div>
              <div className="h-12 w-px bg-gray-200"></div>
              <div>
                <p className="text-4xl font-black text-(--primarycolor)">1k+</p>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-tighter">
                  Itens em Estoque
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full bg-white p-6 md:p-10 rounded-[3rem] shadow-xl border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-1 space-y-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900 mb-6 italic">
                  Onde <span className="text-(--primarycolor)">Estamos</span>
                </h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <MapPin
                      className="text-(--primarycolor) shrink-0"
                      size={24}
                    />
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">
                        Nossa Localização
                      </p>
                      <p className="text-gray-600 text-sm">
                        {siteConfig.address}
                      </p>
                      <p className="text-(--primarycolor) text-xs font-bold mt-1">
                        Ao lado do Burger King
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Clock
                      className="text-(--primarycolor) shrink-0"
                      size={24}
                    />
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">
                        Horário de Atendimento
                      </p>
                      <p className="text-gray-600 text-sm">
                        Segunda a Sexta: {siteConfig.hours.weekdays}
                        <br />
                        Sábado: {siteConfig.hours.saturday}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <ShieldCheck
                      className="text-(--primarycolor) shrink-0"
                      size={24}
                    />
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">
                        Compra Segura
                      </p>
                      <p className="text-gray-600 text-sm">
                        Aceitamos cartões, PIX e faturamento para empresas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 w-full h-100 rounded-4/1 overflow-hidden shadow-inner border border-gray-100 relative">
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(siteConfig.address)}&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                title="Localização Primos Lar e Construção Sorocaba"
                className="filter grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
