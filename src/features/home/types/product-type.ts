import { LucideIcon } from "lucide-react"

export interface ProductType {
    id: number,
    nome: string,
    categoria: CategoriaProduto,
    image: string,
    imageAlt: string,
    icon: LucideIcon
    descricao: string, 
}

export type CategoriaProduto = 
    | "Eletrica"
    | "Ferramenta"
    | "Pintura"
    | "Encanamento"
    | "Estrutural"
    | "Protecao"
    | "Outros";

export interface CategoriaCores {
    primaria: string,
    secundaria: string
}

export const coresCategorias: Record<
  CategoriaProduto,
  CategoriaCores
> = {
  Eletrica: {
    primaria: "#D97706",
    secundaria: "#FEF3C7"
  },
  Ferramenta: { 
    primaria: "#475569",
    secundaria: "#E2E8F0"
  },
  Pintura: {
    primaria: "#7C3AED",
    secundaria: "#EDE9FE"
  },
  Encanamento: {
    primaria: "#0284C7",
    secundaria: "#E0F2FE"
  },
  Estrutural: {
    primaria: "#92400E",
    secundaria: "#FEF3C7"
  },
  Protecao: {
    primaria: "#15803D",
    secundaria: "#DCFCE7"
  },
  Outros: {
    primaria: "#BA2018",
    secundaria: "#FEE2E2"
  }
};

export type CategoriaFiltro = CategoriaProduto | "Todos";