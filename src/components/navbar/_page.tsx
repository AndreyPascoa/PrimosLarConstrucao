"use client";

import { ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const style = `
        relative 
        text-[var(--primarycolor)] 
        hover:text-[var(--secoundcolor)] 
        transition-colors duration-300 
        font-medium text-[20px] 
        font-[family-name:var(--font-titillium-web)]
    `;

    return (
        <div className="w-full h-25 bg-white text-black flex items-center justify-center px-4 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] sticky top-0 z-50">
            <nav className="flex justify-between md:justify-center items-center w-full max-w-6xl md:gap-8">

                <Image 
                    src={"/logo.png"} 
                    alt="Logo" 
                    width={137} 
                    height={65} 
                    priority 
                    className="cursor-pointer"
                    onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
                />

                <div className="hidden md:flex space-x-6 items-center">
                    <a href="#home" className={style}>HOME</a>
                    <a href="#sobre" className={style}>SOBRE NÓS</a>
                    <a href="#produtos" className={style}>PRODUTOS</a>
                    <a href="#contato" className={style}>CONTATO</a>
                </div>

                <div className="md:hidden flex items-center gap-8">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-[var(--primarycolor)] transition-all"
                    >
                        {isOpen ? <X size={30} /> : <Menu size={30} />}
                    </button>
                </div>

                {isOpen && (
                    <div className="absolute top-25 left-0 w-full bg-white border-b shadow-lg flex flex-col items-center py-6 gap-4 md:hidden z-40 animate-in fade-in slide-in-from-top-5">
                        <a href="#home" className={style} onClick={() => setIsOpen(false)}>HOME</a>
                        <a href="#sobre" className={style} onClick={() => setIsOpen(false)}>SOBRE NÓS</a>
                        <a href="#produtos" className={style} onClick={() => setIsOpen(false)}>PRODUTOS</a>
                        <a href="#contato" className={style} onClick={() => setIsOpen(false)}>CONTATO</a>
                    </div>
                )}
            </nav>
        </div>
    );
}