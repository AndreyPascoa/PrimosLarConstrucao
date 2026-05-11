import { MessageCircle, Mail, MapPin, Clock } from "lucide-react";

export default function Footer() {
    return (
        <footer className="w-full bg-white pt-20 pb-10 px-6 border-t border-gray-100">
            <div className="max-w-7xl mx-auto">

                <div className="text-center mb-16">
                    <h2 className="text-sm font-bold tracking-widest text-(--primarycolor) uppercase mb-3">
                        Fale Conosco
                    </h2>
                    <p className="text-4xl md:text-5xl font-extrabold text-(--primarycolor) uppercase">
                        Entre em Contato
                    </p>
                    <div className="h-1.5 w-20 bg-(--primarycolor) mx-auto mt-4 rounded-full"></div>
                </div>

                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            Estamos prontos para ajudar na sua obra.
                        </h3>
                        <p className="text-gray-600 text-lg">
                            Tire suas dúvidas sobre produtos, peça orçamentos ou verifique nossa disponibilidade de entrega através de nossos canais oficiais.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <a
                            href="https://wa.me/551532293388?text=Olá! Gostaria de solicitar um orçamento na Primos."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-6 bg-slate-50 rounded-2xl border border-gray-100 hover:border-(--primarycolor) transition-all group shadow-sm hover:shadow-md"
                        >
                            <div className="w-12 h-12 bg-white text-(--primarycolor) rounded-xl flex items-center justify-center shadow-sm group-hover:bg-(--primarycolor) group-hover:text-white transition-all">
                                <MessageCircle size={24} />
                            </div>
                            <div className="ml-4 text-left">
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">WhatsApp</p>
                                <p className="text-gray-900 font-semibold text-lg">(15) 3229-3388</p>
                            </div>
                        </a>

                        <div className="flex items-center p-6 bg-slate-50 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="w-12 h-12 bg-white text-(--primarycolor) rounded-xl flex items-center justify-center shadow-sm">
                                <Mail size={24} />
                            </div>
                            <div className="ml-4 text-left">
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">E-mail</p>
                                <p className="text-gray-900 font-semibold">primos@primosmat.com</p>
                            </div>
                        </div>

                        <div className="flex items-center p-6 bg-slate-50 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="w-12 h-12 bg-white text-(--primarycolor) rounded-xl flex items-center justify-center shadow-sm">
                                <Clock size={24} />
                            </div>
                            <div className="ml-4 text-left">
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Segunda a Sexta</p>
                                <p className="text-gray-900 font-semibold text-sm md:text-base">7h30 às 17h30</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center p-6 bg-slate-50 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="w-12 h-12 bg-white text-(--primarycolor) rounded-xl flex items-center justify-center shadow-sm">
                                <Clock size={24} />
                            </div>
                            <div className="ml-4 text-left">
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Sábados</p>
                                <p className="text-gray-900 font-semibold text-sm md:text-base">8h00 às 12h30</p>
                            </div>
                        </div>

                        <div className="flex items-center p-6 bg-slate-50 rounded-2xl border border-gray-100 col-span-1 md:col-span-2 shadow-sm">
                            <div className="w-12 h-12 bg-white text-(--primarycolor) rounded-xl flex items-center justify-center shadow-sm">
                                <MapPin size={24} />
                            </div>
                            <div className="ml-4 text-left">
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Nossa Loja</p>
                                <p className="text-gray-900 font-semibold text-sm md:text-base">
                                    Av. Dr. Armando Pannunzio, 90 - Cerrado, Sorocaba - SP
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-20 pt-8 border-t border-gray-100 text-center">
                    <p className="text-gray-400 text-sm">
                        &copy; {new Date().getFullYear()} Primos Materiais para Construção. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </footer>
    );
}