"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Menu,
  MessageCircle,
  Minus,
  Package,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import type { PublicContent } from "@/lib/content";
type Cart = Record<string, number>;
const widths = [320, 480, 640, 768, 1024, 1280, 1920];
const optimized = new Set([
  "/carousel/1.png",
  "/evento/aniversario.png",
  "/fachada_primos.png",
  "/logo.png",
  "/logo2.png",
]);
function photo(src: string, width = 768) {
  return optimized.has(src)
    ? `/optimized${src.slice(0, -4)}-${width}.webp`
    : src;
}
function sourceSet(src: string) {
  return optimized.has(src)
    ? widths.map((w) => `${photo(src, w)} ${w}w`).join(", ")
    : undefined;
}
export default function Storefront({ content }: { content: PublicContent }) {
  const {
    settings: s,
    products,
    categories,
    banners,
    catalogAvailable,
  } = content;
  const [menu, setMenu] = useState(false);
  const [banner, setBanner] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
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
  const filtered = products.filter(
    (p) =>
      (!category || p.categoryId === category) &&
      `${p.name} ${p.description} ${p.category?.name}`
        .toLocaleLowerCase("pt-BR")
        .includes(search.toLocaleLowerCase("pt-BR")),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / 12));
  function setQuantity(id: string, quantity: number) {
    setCart((c) => {
      const next = { ...c };
      if (quantity <= 0) delete next[id];
      else next[id] = Math.min(999, Math.floor(quantity));
      return next;
    });
  }
  function add(id: string) {
    setCart((c) => ({ ...c, [id]: Math.min(999, (c[id] || 0) + 1) }));
    setMessage("Produto adicionado à sua lista de orçamento.");
  }
  const quote = `Olá! Gostaria de um orçamento dos seguintes produtos:\n\n${cartProducts.map((p) => `${cart[p.id]} × ${p.name}`).join("\n")}\n\nPodem confirmar os valores, a disponibilidade e as opções de entrega?`;
  const nav = [
    { href: "#home", label: "Início" },
    { href: "#shop", label: "Catálogo" },
    ...(s.aboutEnabled ? [{ href: "#sobre", label: "Sobre a loja" }] : []),
    { href: "#contato", label: "Contato" },
  ];
  return (
    <div
      className="storefront"
      style={
        {
          "--primarycolor": s.primaryColor,
          "--secoundcolor": s.secondaryColor,
        } as CSSProperties
      }
    >
      <header className="store-header">
        <div className="store-container header-inner">
          <a href="#home" aria-label={`${s.name} — início`}>
            <img
              src={photo(s.logoUrl, 320)}
              alt={s.name}
              width="137"
              height="65"
            />
          </a>
          <nav className={menu ? "open" : ""} aria-label="Navegação principal">
            {nav.map((item) => (
              <a
                href={item.href}
                key={item.href}
                onClick={() => setMenu(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <button
              className="quote-button"
              onClick={() => cartDialog.current?.showModal()}
              aria-label={`Abrir orçamento, ${cartCount} itens`}
            >
              <ShoppingBag size={21} />
              <span>Meu orçamento</span>
              <b>{cartCount}</b>
            </button>
            <button
              className="store-menu"
              onClick={() => setMenu(!menu)}
              aria-label={menu ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menu}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      <main>
        <section id="home" className="store-hero">
          {banners.length > 0 && (
            <div className="store-banners">
              <div
                className="banner-track"
                style={{ transform: `translateX(-${banner * 100}%)` }}
              >
                {banners.map((item, index) => (
                  <div
                    className="banner-slide"
                    key={item.id}
                    aria-hidden={index !== banner}
                  >
                    {item.linkUrl ? (
                      <a
                        href={item.linkUrl}
                        tabIndex={index === banner ? 0 : -1}
                      >
                        <img
                          src={photo(item.imageUrl, 1920)}
                          srcSet={sourceSet(item.imageUrl)}
                          sizes="100vw"
                          alt={item.title}
                          width="1920"
                          height="800"
                          loading={index === 0 ? "eager" : "lazy"}
                          fetchPriority={index === 0 ? "high" : "auto"}
                        />
                      </a>
                    ) : (
                      <img
                        src={photo(item.imageUrl, 1920)}
                        srcSet={sourceSet(item.imageUrl)}
                        sizes="100vw"
                        alt={item.title}
                        width="1920"
                        height="800"
                        loading={index === 0 ? "eager" : "lazy"}
                        fetchPriority={index === 0 ? "high" : "auto"}
                      />
                    )}
                  </div>
                ))}
              </div>
              {banners.length > 1 && (
                <>
                  <button
                    className="banner-prev"
                    aria-label="Banner anterior"
                    onClick={() =>
                      setBanner((banner + banners.length - 1) % banners.length)
                    }
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    className="banner-next"
                    aria-label="Próximo banner"
                    onClick={() => setBanner((banner + 1) % banners.length)}
                  >
                    <ChevronRight />
                  </button>
                  <div className="banner-dots">
                    {banners.map((item, index) => (
                      <button
                        key={item.id}
                        aria-label={`Ver banner ${index + 1}`}
                        aria-current={banner === index ? "true" : undefined}
                        onClick={() => setBanner(index)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          <div className="store-container hero-copy">
            <div>
              <span className="store-kicker">PRIMOS · SOROCABA E REGIÃO</span>
              <h1>{s.heroTitle}</h1>
              <p>{s.heroText}</p>
            </div>
            <a className="store-primary" href="#shop">
              {s.heroButton}
              <ArrowRight size={19} />
            </a>
          </div>
        </section>
        <div className="benefits store-container">
          <span>
            <Truck />
            Entrega em Sorocaba e região
          </span>
          <span>
            <ShieldCheck />
            Tradição desde 1981
          </span>
          <span>
            <MessageCircle />
            Atendimento pelo WhatsApp
          </span>
        </div>
        <section id="shop" className="store-catalog store-container">
          <div className="section-heading">
            <div>
              <span className="store-kicker">PARA CADA ETAPA DA SUA OBRA</span>
              <h2>{s.catalogTitle}</h2>
              <p>{s.catalogText}</p>
            </div>
            <span className="catalog-count">{products.length} produtos</span>
          </div>
          <div className="catalog-controls">
            <label className="catalog-search">
              <Search size={20} />
              <input
                type="search"
                placeholder="O que você precisa para sua obra?"
                aria-label="Buscar produtos"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </label>
            <div className="category-tabs" aria-label="Categorias">
              <button
                aria-pressed={!category}
                onClick={() => {
                  setCategory("");
                  setPage(1);
                }}
              >
                Todos
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  aria-pressed={category === c.id}
                  style={
                    category === c.id
                      ? {
                          background: c.primaryColor,
                          borderColor: c.primaryColor,
                          color: "#fff",
                        }
                      : { background: c.secondaryColor, color: c.primaryColor }
                  }
                  onClick={() => {
                    setCategory(c.id);
                    setPage(1);
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          {!catalogAvailable ? (
            <div className="store-empty">
              <Package size={36} />
              <h3>Nosso catálogo está temporariamente indisponível.</h3>
              <p>Nossa equipe pode ajudar você a encontrar o que precisa.</p>
              <a
                className="store-primary"
                href={wa("Olá! Gostaria de consultar os produtos da loja.")}
                target="_blank"
                rel="noreferrer"
              >
                Consultar pelo WhatsApp
              </a>
            </div>
          ) : !filtered.length ? (
            <div className="store-empty">
              <Search size={36} />
              <h3>
                {products.length
                  ? "Nenhum produto encontrado"
                  : "Estamos preparando nosso catálogo"}
              </h3>
              <p>
                {products.length
                  ? "Tente outra busca ou categoria. Nossa equipe também pode ajudar pelo WhatsApp."
                  : "Fale com a loja para consultar materiais e disponibilidade."}
              </p>
              {products.length > 0 && (
                <button
                  onClick={() => {
                    setSearch("");
                    setCategory("");
                  }}
                >
                  Limpar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="product-grid">
              {filtered.slice((page - 1) * 12, page * 12).map((p) => (
                <article className="product-card" key={p.id}>
                  <div className="product-image">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        loading="lazy"
                        width="400"
                        height="400"
                      />
                    ) : (
                      <Package size={60} strokeWidth={1} />
                    )}
                  </div>
                  <div className="product-body">
                    <span
                      className="product-category"
                      style={{
                        color: p.category?.primaryColor,
                        background: p.category?.secondaryColor,
                      }}
                    >
                      {p.category?.name}
                    </span>
                    <h3>{p.name}</h3>
                    <details>
                      <summary>Ver descrição</summary>
                      <p>{p.description}</p>
                    </details>
                    <button className="product-add" onClick={() => add(p.id)}>
                      <Plus size={17} />
                      Adicionar ao orçamento
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <div className="store-pagination">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                Anterior
              </button>
              <span>
                {page} / {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Próxima
              </button>
            </div>
          )}
          <p className="catalog-note">
            Valores e disponibilidade confirmados pela nossa equipe no
            atendimento.
          </p>
        </section>
        {s.newsEnabled && (
          <section className="store-news">
            <div className="store-container editorial-grid">
              <div className="editorial-image">
                <img
                  src={photo(s.newsImage)}
                  srcSet={sourceSet(s.newsImage)}
                  sizes="(max-width: 760px) 100vw, 600px"
                  alt={s.newsTitle}
                  width="600"
                  height="600"
                  loading="lazy"
                />
              </div>
              <div>
                <span className="store-kicker">{s.newsLabel}</span>
                <h2>{s.newsTitle}</h2>
                <p>{s.newsText}</p>
                <a
                  className="store-text-link"
                  href={wa(
                    "Olá! Gostaria de saber mais sobre as novidades da Primos.",
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  Fale com a nossa equipe <ArrowRight size={18} />
                </a>
              </div>
            </div>
          </section>
        )}
        {s.aboutEnabled && (
          <section
            id="sobre"
            className="store-container store-about editorial-grid"
          >
            <div>
              <span className="store-kicker">
                CONSTRUINDO HISTÓRIAS DESDE 1981
              </span>
              <h2>{s.aboutTitle}</h2>
              <p>{s.aboutText}</p>
              <div className="about-points">
                <span>
                  <CheckIcon />
                  Atendimento especializado
                </span>
                <span>
                  <CheckIcon />
                  Qualidade para a sua obra
                </span>
              </div>
            </div>
            <div className="editorial-image">
              <img
                src={photo(s.aboutImage)}
                srcSet={sourceSet(s.aboutImage)}
                sizes="(max-width: 760px) 100vw, 600px"
                alt={`Conheça a ${s.name}`}
                width="600"
                height="500"
                loading="lazy"
              />
            </div>
          </section>
        )}
        <section id="contato" className="store-contact">
          <div className="store-container contact-grid">
            <div>
              <span className="store-kicker">CONTE COM A PRIMOS</span>
              <h2>{s.contactTitle}</h2>
              <p>{s.contactText}</p>
              <a
                href={wa("Olá! Gostaria de falar com a equipe da Primos.")}
                className="store-primary"
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={20} />
                Conversar pelo WhatsApp
              </a>
            </div>
            <div className="contact-card">
              <div>
                <MapPin />
                <span>
                  <strong>Venha nos visitar</strong>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {s.address}
                    <br />
                    <small>Ver no mapa ↗</small>
                  </a>
                </span>
              </div>
              <div>
                <Clock3 />
                <span>
                  <strong>Horários de atendimento</strong>Segunda a sexta:{" "}
                  {s.weekdays}
                  <br />
                  Sábado: {s.saturday}
                </span>
              </div>
              <div>
                <MessageCircle />
                <span>
                  <strong>Fale com a loja</strong>
                  <a href={`tel:${s.phone.replace(/[^+\d]/g, "")}`}>
                    {s.phone}
                  </a>
                  <br />
                  <a href={`mailto:${s.email}`}>{s.email}</a>
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="store-footer">
        <div className="store-container">
          <div>
            <img
              src={photo(s.logoUrl, 320)}
              alt={s.name}
              width="125"
              height="60"
            />
            <p>{s.footerText}</p>
          </div>
          <div className="footer-bottom">
            <span>
              © {new Date().getFullYear()} {s.name}. Todos os direitos
              reservados.
            </span>
            <a
              href="https://orditra.com.br/"
              target="_blank"
              rel="noreferrer"
              className="dan-credit"
            >
              Feito por{" "}
              <img src="/dan-logo.svg" alt="" width="20" height="20" /> DAN
              Tecnologia
            </a>
            <a href="/admin/login">Área administrativa</a>
          </div>
        </div>
      </footer>
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
              Adicione os produtos que precisa e peça um orçamento para a loja.
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
  );
}
function CheckIcon() {
  return <ShieldCheck size={18} />;
}
