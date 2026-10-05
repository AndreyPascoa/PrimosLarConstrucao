import { siteConfig } from "@/config/site";
import type { Metadata } from "next";
import { Titillium_Web } from "next/font/google";
import "./globals.css";

const titilliumWeb = Titillium_Web({
  variable: "--font-titillium-web",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
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
