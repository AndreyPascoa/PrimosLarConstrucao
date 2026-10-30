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
  const [sending, setSending] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const cartDialog = useRef<HTMLDialogElement>(null);
  const requestCache = useRef<{
    key: string;
    signature: string;
    createdAt: number;
  } | null>(null);
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
  async function sendQuote() {
    if (sending) return;
    setSending(true);
    setQuoteError("");
    const items = cartProducts
      .map((p) => ({ id: p.id, quantity: cart[p.id] }))
      .sort((a, b) => a.id.localeCompare(b.id));
    const signature = JSON.stringify(items);
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
      "",
    );
    let requestKey = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    if (
      requestCache.current?.signature === signature &&
      Date.now() - requestCache.current.createdAt < 15 * 60 * 1000
    )
      requestKey = requestCache.current.key;
    try {
      const cached = JSON.parse(
        sessionStorage.getItem("primos-quote-request") || "null",
      );
      if (
        cached?.signature === signature &&
        Date.now() - cached.createdAt < 15 * 60 * 1000
      )
        requestKey = cached.key;
      sessionStorage.setItem(
        "primos-quote-request",
        JSON.stringify({ key: requestKey, signature, createdAt: Date.now() }),
      );
    } catch {}
    requestCache.current = {
      key: requestKey,
      signature,
      createdAt: Date.now(),
    };
    try {
      const response = await fetch("/api/orcamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestKey, items }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 409) {
          requestCache.current = null;
          try {
            sessionStorage.removeItem("primos-quote-request");
          } catch {}
        }
        throw Error(
          data.error || "Não foi possível encaminhar. Tente novamente.",
        );
      }
      window.location.assign(data.url);
    } catch (error) {
      setQuoteError(
        error instanceof Error
          ? error.message
          : "Falha na conexão. Sua lista continua salva.",
      );
    } finally {
      setSending(false);
    }
  }
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
                  O site seleciona um vendedor disponível e encaminha a lista ao
                  WhatsApp dele. A equipe confirma os valores e a
                  disponibilidade antes da compra.
                </p>
                <button
                  className="store-primary"
                  disabled={sending}
                  onClick={() => void sendQuote()}
                >
                  <MessageCircle size={19} />
                  {sending
                    ? "Selecionando vendedor…"
                    : "Enviar orçamento pelo WhatsApp"}
                </button>
                {quoteError && <p role="alert">{quoteError}</p>}
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
