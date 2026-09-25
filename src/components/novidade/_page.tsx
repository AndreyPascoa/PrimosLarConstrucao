'use client';

import Image from "next/image";
import { useState } from "react";
import Modal from "../modal/_page";

export default function Novidade() {
  const [isOpen, setIsOpen] = useState(false);
  const [modalText, setModalText] = useState("");

  const handleOpenModal = () => {
    setModalText(
      `Em 2026, a PRIMOS Lar e Construção completa 45 anos de história!

      São 45 anos fazendo parte da construção de Sorocaba e região, acompanhando gerações e ajudando nossos clientes a transformar seus projetos em realidade.

      Para celebrar esse momento tão especial, estamos preparando uma programação comemorativa com novidades, ações especiais e momentos para celebrar essa trajetória junto com nossos clientes, parceiros e toda a família PRIMOS.

      Em breve você poderá conferir todos os detalhes da nossa comemoração.

      Acompanhe nossas redes sociais e fique por dentro de tudo que estamos preparando para os 45 anos da PRIMOS!`
    );

    setIsOpen(true);
  };

  return (
    <>
      <section className="w-full max-w-6xl mx-auto py-16 px-4">
        {/* Título */}
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold tracking-widest text-(--primarycolor) uppercase mb-3">
            Novidades na
          </h2>

          <div className="flex flex-col items-center">
            <div className="mt-2">
              <Image
                src="/logo2.png"
                alt="Primos Lar e Construção"
                width={350}
                height={120}
                className="object-contain"
              />
            </div>
          </div>

          <div className="h-1.5 w-20 bg-(--primarycolor) mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Conteúdo */}
        <div className="flex flex-col md:flex-row items-center gap-12">

          {/* Imagem */}
          <div className="w-full md:w-1/2 flex justify-center">
            <Image
              src="/evento/aniversario.png"
              alt="45 anos da Primos Lar e Construção"
              width={750}
              height={600}
              className="rounded-lg object-contain"
            />
          </div>

          {/* Texto */}
          <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-left">

            <span className="text-sm font-bold tracking-widest text-(--primarycolor) uppercase mb-3">
              Uma história construída com você
            </span>

            <h2 className="text-3xl md:text-4xl font-bold text-(--primarycolor) mb-4">
              45 ANOS DE PRIMOS
            </h2>

            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              Em 2026, a PRIMOS Lar e Construção completa
              <strong> 45 anos de história</strong>, fazendo parte da
              construção de Sorocaba e região.
            </p>

            <p className="text-gray-700 text-lg leading-relaxed mb-8">
              E para comemorar essa trajetória, estamos preparando
              <strong> novidades e ações especiais</strong> para celebrar
              esse momento junto com nossos clientes.
            </p>

            <p className="font-semibold text-(--primarycolor) mb-8 text-xl">
              45 anos construindo histórias. E ainda temos muito pela frente.
            </p>
          </div>
        </div>
      </section>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        text={modalText}
      />
    </>
  );
}