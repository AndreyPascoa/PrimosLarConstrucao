import type { Metadata } from "next";
import { Titillium_Web } from "next/font/google";
import "./globals.css";

const titilliumWeb = Titillium_Web({
  variable: "--font-titillium-web",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Primos Lar e Construção",
  description: "Loja do ramo de construção civil, especializada em materiais de construção, ferramentas e equipamentos para construção. Oferecemos uma ampla variedade de produtos de alta qualidade para atender às necessidades dos nossos clientes, desde pequenos projetos de reforma até grandes obras de construção. Nossa equipe é dedicada a fornecer um excelente atendimento ao cliente e garantir a satisfação total dos nossos clientes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${titilliumWeb.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
