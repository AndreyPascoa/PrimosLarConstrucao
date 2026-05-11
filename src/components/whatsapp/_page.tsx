import { MessageCircle } from "lucide-react";

export default function FloatingWhatsApp() {
    return (
        <a
            href="https://wa.me/551532293388?text=Olá! Estava navegando no site e gostaria de tirar uma dúvida."
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 bg-(--primarycolor) text-white rounded-full shadow-2xl "
            aria-label="Contato via WhatsApp"
        >
            <MessageCircle size={32} className="relative z-10 fill-current" />

            <span className="absolute left-20 bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                Fale Conosco agora!
            </span>
        </a>
    );
}