"use client";
import { useSiteSettings } from "@/features/home/components/public-content";
import Image from "next/image";

export default function Novidade() {
  const siteConfig = useSiteSettings();


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
                sizes="(max-width: 382px) calc(100vw - 32px), 350px"
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
              src={siteConfig.newsImage}
              alt={siteConfig.newsTitle}
              sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1152px) 50vw, 552px"
              width={750}
              height={600}
              className="rounded-lg object-contain"
            />
          </div>

          {/* Texto */}
          <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-left">
            <span className="text-sm font-bold tracking-widest text-(--primarycolor) uppercase mb-3">
              {siteConfig.newsLabel}
            </span>

            <h2 className="text-3xl md:text-4xl font-bold text-(--primarycolor) mb-4">
              {siteConfig.newsTitle}
            </h2>

            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              {siteConfig.newsText}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
