"use client";

import { ModalProps } from "@/types/modal_type";
import Image from "next/image";

export default function Modal({ isOpen, onClose, text }: ModalProps) {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 animate-in fade-in duration-300"
      onClick={handleOverlayClick}
    >
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-[90%] transform transition-all animate-in zoom-in-95 duration-300">
        <Image
          src="/logo2.png"
          alt="Primos Logo"
          width={175}
          height={60}
          className="object-contain mx-auto mb-4"
        />

        <div className="text-gray-600 leading-relaxed">
          {text}
        </div>

        <button 
          onClick={onClose} 
          className="mt-6 w-full bg-(--primarycolor) hover:opacity-90 text-white font-medium py-3 px-6 rounded-xl transition-all active:scale-95"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}