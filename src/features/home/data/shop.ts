import { BrickWall } from "lucide-react";
import { ProductType } from "../types/product-type";

export const ShopItens : ProductType[] = [
    {
        id: 1,
        nome: "TECPLUS TOP",
        categoria: "Estrutural",
        image: "/produto/quartzolit/quartzolit-tecplus.png",
        imageAlt: "",
        icon: BrickWall,
        descricao: "Argamassa TECPLUS TOP 18kg"
    },
    {
        id: 2,
        nome: "TECPLUS TOP 7000",
        categoria: "Estrutural",
        image: "/produto/quartzolit/quartzolit-tecplus-7000.png",
        imageAlt: "",
        icon: BrickWall,
        descricao: "Argamassa TECPLUS LASTIC 7000 18kg"
    },

] as const;