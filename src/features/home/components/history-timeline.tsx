"use client";

import React, { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Hammer, Store, Rocket, CheckCircle2 } from "lucide-react";

const marcos = [
  {
    ano: "1981",
    titulo: "A Fundação",
    desc: "Início das atividades com foco em ferragens essenciais para a construção civil em Sorocaba.",
    icon: <Hammer className="w-5 h-5" />,
  },
  {
    ano: "1998",
    titulo: "Expansão de Materiais",
    desc: "Passamos a oferecer soluções completas, do alicerce ao acabamento, com logística própria.",
    icon: <Store className="w-5 h-5" />,
  },
  {
    ano: "2015",
    titulo: "Nova Unidade",
    desc: "Mudança para a sede atual na Armando Pannunzio, com showroom moderno e amplo estoque.",
    icon: <Rocket className="w-5 h-5" />,
  },
  {
    ano: "2026",
    titulo: "Futuro Digital",
    desc: "Liderança regional com atendimento omnicanal e processos automatizados para agilizar sua obra.",
    icon: <CheckCircle2 className="w-5 h-5" />,
  }
];

export default function TimelineAlternada() {
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 70%", "end 20%"],
  });

  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <div ref={containerRef} className="hidden md:block relative max-w-6xl mx-auto py-20">
      
      <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 w-1 h-full bg-gray-200 rounded-full" />
      
      <motion.div
        style={{ scaleY }}
        className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 w-1 h-full bg-(--primarycolor) origin-top rounded-full z-10"
      />

      <div className="space-y-20">
        {marcos.map((item, index) => {
          const isEven = index % 2 === 0;

          return (
            <div key={index} className={`relative flex items-center justify-between w-full ${isEven ? "md:flex-row-reverse" : "md:flex-row"}`}>
              
              <motion.div 
                initial={{ opacity: 0, x: isEven ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="w-[calc(100%-3rem)] md:w-[45%] ml-12 md:ml-0"
              >
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-red-100 transition-colors">
                  <div className={`flex items-center gap-3 mb-3 ${isEven ? "md:flex-row-reverse" : ""}`}>
                    <span className="text-2xl font-black text-(--primarycolor)">{item.ano}</span>
                    <div className="p-1.5 bg-red-50 text-(--primarycolor) rounded-lg">
                      {item.icon}
                    </div>
                  </div>
                  <h4 className={`text-lg font-bold text-slate-800 mb-2 ${isEven ? "md:text-right" : ""}`}>
                    {item.titulo}
                  </h4>
                  <p className={`text-gray-600 text-sm leading-relaxed ${isEven ? "md:text-right" : ""}`}>
                    {item.desc}
                  </p>
                </div>
              </motion.div>

              <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 flex items-center justify-center z-20">
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                  className="w-6 h-6 bg-white border-4 border-(--primarycolor) rounded-full shadow-md"
                />
              </div>

              <div className="hidden md:block w-[45%]" />
            </div>
          );
        })}
      </div>
    </div>
  );
}