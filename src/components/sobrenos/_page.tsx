'use client';

import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle2, MapPin, Clock, ShieldCheck } from "lucide-react";

export default function SobreNos() {
    return (
        <section className="w-full bg-slate-50 py-20 px-6" id="sobre-nos">
            <div className="max-w-7xl mx-auto">

                <div className="text-center mb-16">
                    <h1 className="text-sm font-bold tracking-[0.2em] text-[#b91c1c] uppercase mb-3">
                        Desde 1981 em Sorocaba
                    </h1>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                        Especialistas em <span className="text-[#b91c1c]">Materiais de Construção</span>
                    </h2>
                    <div className="h-1.5 w-24 bg-[#b91c1c] mx-auto mt-6 rounded-full"></div>
                </div>

                <div className="flex flex-col lg:flex-row items-center gap-16 mb-24">
                    <div className="w-full lg:w-1/2 relative h-112.5 rounded-[2.5rem] overflow-hidden shadow-2xl group">
                        <Image
                            src="/fachada_primos.png"
                            alt="Fachada Primos Ferragens e Construção em Sorocaba - Av. Armando Pannunzio"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            priority
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 to-transparent"></div>
                        <div className="absolute bottom-8 left-8 text-white">
                            <p className="text-sm font-bold uppercase tracking-widest opacity-80">Sua obra em boas mãos</p>
                            <p className="text-2xl font-bold">Tradição que constrói confiança.</p>
                        </div>
                    </div>

                    <div className="w-full lg:w-1/2 space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-slate-900">
                                O parceiro ideal para sua reforma ou construção no Cerrado.
                            </h3>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                A <strong>Primos Lar e Construção</strong> é referência em Sorocaba por oferecer soluções completas do alicerce ao acabamento. Com de 45 anos de mercado, nossa missão é fornecer <strong>materiais de construção de alta qualidade</strong> com um atendimento técnico que entende a necessidade do seu projeto.
                            </p>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                Trabalhamos com as marcas líderes do setor para garantir que sua obra tenha <strong>durabilidade, segurança e o melhor custo-benefício da região</strong>.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                            {[
                                "Entrega Rápida em Sorocaba",
                                "Melhores Marcas do Mercado",
                                "Orçamento Ágil via WhatsApp",
                                "Suporte Técnico Especializado"
                            ].map((item, index) => (
                                <div key={index} className="flex items-center gap-3 text-slate-800 font-semibold">
                                    <CheckCircle2 className="text-[#b91c1c]" size={22} />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-12 pt-6 border-t border-gray-200">
                            <div>
                                <p className="text-4xl font-black text-[#b91c1c]">40+</p>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-tighter">Anos de História</p>
                            </div>
                            <div className="h-12 w-px bg-gray-200"></div>
                            <div>
                                <p className="text-4xl font-black text-[#b91c1c]">1k+</p>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-tighter">Itens em Estoque</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full bg-white p-6 md:p-10 rounded-[3rem] shadow-xl border border-gray-100">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        
                        <div className="lg:col-span-1 space-y-8">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 mb-6 italic">Onde <span className="text-[#b91c1c]">Estamos</span></h3>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <MapPin className="text-[#b91c1c] shrink-0" size={24} />
                                        <div>
                                            <p className="font-bold text-slate-900 leading-tight">Nossa Localização</p>
                                            <p className="text-gray-600 text-sm">Av. Dr. Armando Pannunzio, 90<br/>Cerrado, Sorocaba - SP</p>
                                            <p className="text-[#b91c1c] text-xs font-bold mt-1">Ao lado do Burger King</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <Clock className="text-[#b91c1c] shrink-0" size={24} />
                                        <div>
                                            <p className="font-bold text-slate-900 leading-tight">Horário de Atendimento</p>
                                            <p className="text-gray-600 text-sm">Segunda a Sexta: 08:00 às 18:00<br/>Sábado: 08:00 às 13:00</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <ShieldCheck className="text-[#b91c1c] shrink-0" size={24} />
                                        <div>
                                            <p className="font-bold text-slate-900 leading-tight">Compra Segura</p>
                                            <p className="text-gray-600 text-sm">Aceitamos cartões, PIX e faturamento para empresas.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 w-full h-100 rounded-4/1 overflow-hidden shadow-inner border border-gray-100 relative">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3658.5205578617943!2d-47.4892833!3d-23.513772499999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94c58b1ff6184c1b%3A0xc7639d8d4b76d3b3!2sPrimos%20Lar%20e%20Constru%C3%A7%C3%A3o!5e0!3m2!1spt-BR!2sbr!4v1778682572409!5m2!1spt-BR!2sbr"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen={true}
                                loading="lazy"
                                title="Localização Primos Ferragens Sorocaba"
                                className="filter grayscale hover:grayscale-0 transition-all duration-700"
                            />
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}