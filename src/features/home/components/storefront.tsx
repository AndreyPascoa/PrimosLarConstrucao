"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  MessageCircle,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import type { PublicContent } from "@/lib/content";
import SiteHeader from "@/components/layout/site-header";
import SiteFooter from "@/components/layout/site-footer";
import FloatingWhatsApp from "@/components/layout/floating-whatsapp";
import HeroCarousel from "./hero-carousel";
import NewsSection from "./news-section";
import AboutSection from "./about-section";
import ShopSection from "./shop-section";
import { PublicContentProvider } from "./public-content";

type Cart = Record<string, number>;
export default function Storefront({ content }: { content: PublicContent }) {
  const { settings: s, products } = content;
  const [cart, setCart] = useState<Cart>({});
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const cartDialog = useRef<HTMLDialogElement>(null);
  const wa = (text: string) =>
    `https://wa.me/${s.whatsappNumber}?text=${encodeURIComponent(text)}`;
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("primos-quote") || "{}");
      const cleaned: Cart = {};
      if (saved && typeof saved === "object" && !Array.isArray(saved))
        for (const p of products) {
          const qty = Number(saved[p.id]);
          if (Number.isInteger(qty) && qty > 0)
            cleaned[p.id] = Math.min(999, qty);
        }
      setCart(cleaned);
    } catch {
      /* Private browsing or old storage. */
    }
    setReady(true);
  }, [products]);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem("primos-quote", JSON.stringify(cart));
      } catch {
        /* Cart still works in memory. */
      }
  }, [cart, ready]);
  const cartProducts = products.filter((p) => cart[p.id]);
  const cartCount = cartProducts.reduce((sum, p) => sum + cart[p.id], 0);
  function setQuantity(id: string, quantity: number) {
    setCart((c) => {
      const next = { ...c };
      if (quantity <= 0) delete next[id];
      else next[id] = Math.min(999, Math.floor(quantity));
      return next;
    });
  }
  const quote = `Olá! Gostaria de um orçamento dos seguintes produtos:\n\n${cartProducts.map((p) => `${cart[p.id]} × ${p.name}`).join("\n")}\n\nPodem confirmar os valores, a disponibilidade e as opções de entrega?`;
  return (
    <PublicContentProvider value={content}>
      <div
        className="flex flex-col min-h-screen bg-gray-100"
        style={
          {
            "--primarycolor": s.primaryColor,
            "--secoundcolor": s.secondaryColor,
          } as CSSProperties
        }
      >
        <SiteHeader />
        <main>
          <h1 className="sr-only">
            {s.name} — Materiais de construção em Sorocaba
          </h1>
          <div id="home" className="w-full">
            <HeroCarousel />
          </div>
          {s.newsEnabled && <NewsSection />}
          {s.aboutEnabled && <AboutSection />}
          <ShopSection
            quantities={cart}
            onQuantity={(id, quantity) => {
              setQuantity(id, quantity);
              setMessage("Quantidade atualizada na sua lista de orçamento.");
            }}
          />
        </main>
        <SiteFooter />
        <FloatingWhatsApp />
        {message && (
          <div className="store-toast" role="status">
            <CheckIcon />
            {message}
            <button onClick={() => setMessage("")} aria-label="Fechar aviso">
              <X size={16} />
            </button>
          </div>
        )}
        <button
          className="floating-quote"
          onClick={() => cartDialog.current?.showModal()}
          aria-label={`Abrir lista de orçamento com ${cartCount} itens`}
        >
          <ShoppingBag size={22} />
          <span>
            {cartCount ? `${cartCount} itens no orçamento` : "Meu orçamento"}
          </span>
        </button>
        <dialog className="cart-dialog" ref={cartDialog}>
          <div className="cart-header">
            <div>
              <span className="store-kicker">VAMOS CONSTRUIR JUNTOS</span>
              <h2>Seu orçamento</h2>
            </div>
            <button
              onClick={() => cartDialog.current?.close()}
              aria-label="Fechar orçamento"
            >
              <X />
            </button>
          </div>
          {cartProducts.length ? (
            <>
              <div className="cart-items">
                {cartProducts.map((p) => (
                  <div className="cart-row" key={p.id}>
                    {p.imageUrl && (
                      <img src={p.imageUrl} alt="" width="60" height="60" />
                    )}
                    <div>
                      <strong>{p.name}</strong>
                      <div className="quantity-controls">
                        <button
                          aria-label={`Diminuir quantidade de ${p.name}`}
                          onClick={() => setQuantity(p.id, cart[p.id] - 1)}
                        >
                          <Minus size={15} />
                        </button>
                        <input
                          aria-label={`Quantidade de ${p.name}`}
                          type="number"
                          min="1"
                          max="999"
                          value={cart[p.id]}
                          onChange={(e) => {
                            const n = Number(e.target.value);
                            if (Number.isFinite(n) && n >= 1)
                              setQuantity(p.id, n);
                          }}
                        />
                        <button
                          aria-label={`Aumentar quantidade de ${p.name}`}
                          onClick={() => setQuantity(p.id, cart[p.id] + 1)}
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                    </div>
                    <button
                      aria-label={`Remover ${p.name}`}
                      onClick={() => setQuantity(p.id, 0)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="cart-footer">
                <p>
                  Enviaremos a lista ao WhatsApp da loja. A equipe confirma os
                  valores e a disponibilidade antes da compra.
                </p>
                {quote.length > 3500 ? (
                  <p role="alert">
                    Sua lista está muito longa para um único envio. Divida os
                    produtos em dois orçamentos.
                  </p>
                ) : (
                  <a
                    className="store-primary"
                    href={wa(quote)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle size={19} />
                    Enviar orçamento pelo WhatsApp
                  </a>
                )}
                <button
                  onClick={() => {
                    if (window.confirm("Limpar todos os itens da lista?"))
                      setCart({});
                  }}
                >
                  Limpar lista
                </button>
              </div>
            </>
          ) : (
            <div className="store-empty">
              <ShoppingBag size={44} />
              <h3>Sua lista está vazia</h3>
              <p>
                Adicione os produtos que precisa e peça um orçamento para a
                loja.
              </p>
              <button
                className="store-primary"
                onClick={() => {
                  cartDialog.current?.close();
                  document.getElementById("shop")?.scrollIntoView();
                }}
              >
                Explorar catálogo
              </button>
            </div>
          )}
        </dialog>
      </div>
    </PublicContentProvider>
  );
}
function CheckIcon() {
  return <ShieldCheck size={18} />;
}
