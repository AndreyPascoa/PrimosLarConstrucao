"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const images = [
    { src: "/carousel/4.jpeg", alt: "Copa do Mundo" },
    { src: "/carousel/10.jpeg", alt: "Copa do Mundo" },
];

export default function CarouselAnimated() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, []);

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    useEffect(() => {
        if (images.length <= 1) return;
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, [nextSlide]);

    return (
        <section className="group relative w-full aspect-1920/800 max-w-480 mx-auto overflow-hidden bg-gray-200">
            <div
                className="flex w-full h-full transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {images.map((image, index) => (
                    <div key={index} className="w-full h-full shrink-0 relative">
                        <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            className="object-cover" 
                            priority={index === 0}
                            sizes="(max-width: 1920px) 100vw, 1920px"
                        />
                        <div className="absolute inset-0 bg-black/10"></div>
                    </div>
                ))}
            </div>

            {images.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute top-1/2 -translate-y-1/2 left-4 z-30 flex items-center justify-center w-12 h-12 rounded-full bg-white/30 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-(--primarycolor)"
                    >
                        <ChevronLeft size={30} />
                    </button>

                    <button
                        onClick={nextSlide}
                        className="absolute top-1/2 -translate-y-1/2 right-4 z-30 flex items-center justify-center w-12 h-12 rounded-full bg-white/30 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-(--primarycolor)"
                    >
                        <ChevronRight size={30} />
                    </button>

                    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-30">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`h-3 transition-all duration-300 rounded-full ${
                                    currentIndex === index 
                                    ? "bg-(--primarycolor) w-10" 
                                    : "bg-white/50 w-3 hover:bg-white"
                                }`}
                                aria-label={`Ir para slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}