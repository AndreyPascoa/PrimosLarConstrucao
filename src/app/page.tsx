import type { Metadata } from "next";
import Storefront from "@/features/home/components/storefront";
import { getPublicContent } from "@/server/content";
import "./storefront.css";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getPublicContent();
  return {
    ...(process.env.APP_URL
      ? { alternates: { canonical: process.env.APP_URL } }
      : {}),
    title: settings.name,
    description: settings.description,
    openGraph: {
      title: settings.name,
      description: settings.description,
      locale: "pt_BR",
      type: "website",
    },
  };
}
export default async function Home() {
  const content = await getPublicContent();
  const business = {
    "@context": "https://schema.org",
    "@type": "HardwareStore",
    name: content.settings.name,
    description: content.settings.description,
    telephone: content.settings.phone,
    email: content.settings.email,
    address: content.settings.address,
    ...(process.env.APP_URL ? { url: process.env.APP_URL } : {}),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(business).replace(/</g, "\\u003c"),
        }}
      />
      <Storefront content={content} />
    </>
  );
}
