"use client";

import { useState } from "react";
import Image from "next/image";

const images = [
    { src: "/carousel/1.png", alt: "Slide 1" },
    { src: "/carousel/2.png", alt: "Slide 2" },
    { src: "/carousel/3.png", alt: "Slide 3" },
    { src: "/carousel/4.png", alt: "Slide 4" },
];

export default function CarouselAnimated() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const prevSlide = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const nextSlide = () => {
        const isLastSlide = currentIndex === images.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    const goToSlide = (slideIndex: number) => {
        setCurrentIndex(slideIndex);
    };

    return (
        <div className="max-w-full h-100 w-full m-auto relative group overflow-hidden">

            <div
                className="flex w-full h-full transition-transform duration-500 ease-out"
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
                        />
                    </div>
                ))}
            </div>

            <button
                onClick={prevSlide}
                className="hidden group-hover:flex absolute top-1/2 -translate-y-1/2 left-5 z-20 items-center justify-center w-8 h-8 rounded-full bg-(--primarycolor) 
                text-white hover:bg-(--secoundcolor) transition-colors text-2xl"
            >
                ❮
            </button>

            <button
                onClick={nextSlide}
                className="hidden group-hover:flex absolute top-1/2 -translate-y-1/2 right-5 z-20 items-center justify-center w-8 h-8 rounded-full bg-(--primarycolor) 
                text-white hover:bg-(--secoundcolor) transition-colors text-2xl cursor-pointer"
            >
                ❯
            </button>

            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                {images.map((_, slideIndex) => (
                    <div
                        key={slideIndex}
                        onClick={() => goToSlide(slideIndex)}
                        className={`cursor-pointer transition-all duration-300 rounded-full h-2 
                        ${currentIndex === slideIndex ? "bg-(--primarycolor) w-8" : "bg-(--secoundcolor) w-2 hover:bg-white"}`}
                    />
                ))}
            </div>
        </div>
    );
}