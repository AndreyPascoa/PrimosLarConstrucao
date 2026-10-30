export const defaultSettings = {
  name: "Primos Lar e Construção",
  description:
    "Materiais de construção, ferramentas e equipamentos em Sorocaba. Solicite seu orçamento com a Primos Lar e Construção.",
  primaryColor: "#BA2018",
  secondaryColor: "#63100E",
  logoUrl: "/logo.png",
  phone: "(15) 3229-3388",
  whatsappNumber: "551532293388",
  email: "primos@primosmat.com",
  address: "Av. Dr. Armando Pannunzio, 90 - Cerrado, Sorocaba - SP",
  weekdays: "7h30 às 17h30",
  saturday: "8h00 às 12h30",
  heroTitle: "Tudo para construir e transformar seu lar.",
  heroText:
    "Materiais de qualidade, atendimento de confiança e entrega em Sorocaba e região.",
  heroButton: "Explore o catálogo",
  newsTitle: "45 anos de Primos",
  newsLabel: "Uma história construída com você",
  newsText:
    "Em 2026, a Primos Lar e Construção completa 45 anos de história, fazendo parte da construção de Sorocaba e região. Estamos preparando novidades e ações especiais para celebrar esse momento junto com nossos clientes.",
  newsImage: "/evento/aniversario.png",
  newsEnabled: true,
  aboutTitle: "O parceiro ideal para sua reforma ou construção.",
  aboutText:
    "Desde 1981, a Primos Lar e Construção oferece soluções do alicerce ao acabamento. Nossa missão é fornecer materiais de construção de qualidade, com atendimento técnico que entende a necessidade do seu projeto.",
  aboutImage: "/fachada_primos.png",
  aboutEnabled: true,
  catalogTitle: "Catálogo de materiais",
  catalogText:
    "Escolha os produtos e envie sua lista pelo WhatsApp. Nossa equipe confirma preços, disponibilidade e entrega.",
  contactTitle: "Vamos tirar sua obra do papel?",
  contactText:
    "Fale com nossa equipe e encontre os materiais certos para o seu projeto.",
  footerText: "Tradição e confiança para construir com você.",
};
export type SiteContent = typeof defaultSettings;
export type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  primaryColor: string;
  secondaryColor: string;
  _count?: { products: number };
};
export type ProductItem = {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  published: boolean;
  categoryId: string;
  category?: CategoryItem;
};
export type BannerItem = {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  position: number;
  published: boolean;
};
export type MediaItem = { id: string; name: string; url: string };
export type PublicContent = {
  settings: SiteContent;
  products: ProductItem[];
  categories: CategoryItem[];
  banners: BannerItem[];
  catalogAvailable: boolean;
};
