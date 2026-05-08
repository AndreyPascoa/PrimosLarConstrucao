import { ShoppingBag } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
    
    const style = `
        relative 
        text-[var(--primarycolor)] 
        hover:text-[var(--secoundcolor)] 
        transition-colors duration-300 
        font-medium text-[20px] 
        font-[family-name:var(--font-titillium-web)]
    `;

    return (
        <div className="w-full h-25 bg-white text-black flex items-center justify-center px-4">
            <nav className="flex space-x-4 justify-center items-center w-full max-w-6xl gap-5">
                <a href="#">
                    <Image src={"/logo.png"} alt="Logo" width={137} height={65} />
                </a>
                
                <a href="#" className={style}>HOME</a>
                <a href="#" className={style}>SOBRE NÓS</a>
                <a href="#" className={style}>PRODUTOS</a>
                <a href="#" className={style}>CONTATO</a>
                
                <a href="#" className={`${style} hover:-translate-y-1 transition-transform`}>
                    <ShoppingBag 
                        size={24}
                        strokeWidth={1.5}
                     />
                </a>
            </nav>
        </div>
    );
}