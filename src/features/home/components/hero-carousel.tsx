"use client";

import { useState, useEffect, useCallback } from "react";
import { usePublicContent } from "./public-content";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CarouselAnimated() {
  const { banners } = usePublicContent();
  const images = banners.map((b) => ({
    src: b.imageUrl,
    alt: b.title,
    link: b.linkUrl,
    id: b.id,
  }));
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, images.length]);

  const activeIndex = Math.min(currentIndex, Math.max(0, images.length - 1));
  if (!images.length) return null;

  return (
    <section className="group relative w-full aspect-1920/800 max-w-480 mx-auto overflow-hidden bg-gray-200">
      <div
        className="flex w-full h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={index} className="w-full h-full shrink-0 relative">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
              preload={index === 0}
              sizes="(max-width: 1920px) 100vw, 1920px"
            />
            {image.link && (
              <a
                href={image.link}
                aria-label={image.alt}
                tabIndex={index === activeIndex ? 0 : -1}
                className="absolute inset-0"
              />
            )}
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Banner anterior"
            onClick={prevSlide}
            className="absolute top-1/2 -translate-y-1/2 left-4 z-30 flex items-center justify-center w-12 h-12 rounded-full bg-white/30 backdrop-blur-md text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100 transition-all hover:bg-(--primarycolor)"
          >
            <ChevronLeft size={30} />
          </button>

          <button
            type="button"
            aria-label="Próximo banner"
            onClick={nextSlide}
            className="absolute top-1/2 -translate-y-1/2 right-4 z-30 flex items-center justify-center w-12 h-12 rounded-full bg-white/30 backdrop-blur-md text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100 transition-all hover:bg-(--primarycolor)"
          >
            <ChevronRight size={30} />
          </button>
        </>
      )}
    </section>
  );
}
