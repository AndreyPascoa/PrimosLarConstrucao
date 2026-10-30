"use client";
import Image from "next/image";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Package } from "lucide-react";
import type { CategoryItem, ProductItem } from "@/lib/content";
import ProductQuantity from "./product-quantity";
export default function CategoryProductRail({
  category,
  products,
  quantities,
  onQuantity,
  onOpen,
}: {
  category: CategoryItem;
  products: ProductItem[];
  quantities: Record<string, number>;
  onQuantity: (id: string, quantity: number) => void;
  onOpen: (product: ProductItem) => void;
}) {
  const id = useId();
  const track = useRef<HTMLDivElement>(null);
  const [limit, setLimit] = useState(12),
    [edges, setEdges] = useState({ start: true, end: true });
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () =>
      setEdges({
        start: element.scrollLeft <= 2,
        end:
          element.scrollLeft + element.clientWidth >= element.scrollWidth - 2,
      });
    update();
    element.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => {
      element.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [limit, products.length]);
  function move(direction: number) {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("article");
    const step = card ? card.offsetWidth + 16 : el.clientWidth;
    const amount = Math.max(1, Math.floor(el.clientWidth / step)) * step;
    el.scrollBy({
      left: direction * amount,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }
  function keyboard(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      move(event.key === "ArrowRight" ? 1 : -1);
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      event.currentTarget.scrollTo({
        left: event.key === "Home" ? 0 : event.currentTarget.scrollWidth,
      });
    }
  }
  function more() {
    const oldLimit = limit;
    setLimit((value) => Math.min(products.length, value + 12));
    requestAnimationFrame(() => {
      const next = track.current?.querySelectorAll<HTMLElement>(
        ".product-details-trigger",
      )[oldLimit];
      next?.focus({ preventScroll: true });
      next?.scrollIntoView({ block: "nearest", inline: "start" });
    });
  }
  return (
    <section
      className="category-product-section"
      aria-labelledby={`${id}-title`}
    >
      <header className="category-product-heading">
        <div className="category-product-heading-copy">
          <span
            className="category-product-mark"
            style={{
              background: category.secondaryColor,
              color: category.primaryColor,
            }}
          >
            <Package size={21} />
          </span>
          <div>
            <h3 id={`${id}-title`}>{category.name}</h3>
            <p>
              {products.length} produto{products.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <div className="category-product-arrows">
          <button
            type="button"
            disabled={edges.start}
            aria-label={`Produtos anteriores de ${category.name}`}
            aria-controls={id}
            onClick={() => move(-1)}
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            disabled={edges.end}
            aria-label={`Próximos produtos de ${category.name}`}
            aria-controls={id}
            onClick={() => move(1)}
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </header>
      <div
        ref={track}
        id={id}
        role="region"
        aria-label={`Produtos de ${category.name}`}
        tabIndex={0}
        className="category-product-track"
        onKeyDown={keyboard}
      >
        {products.slice(0, limit).map((item) => (
          <article
            key={item.id}
            className="category-product-card group bg-slate-50 rounded-[2.5rem] p-4 border border-gray-100 flex flex-col items-center text-center"
          >
            <button
              type="button"
              className="product-details-trigger"
              onClick={() => onOpen(item)}
              aria-label={`Ver detalhes de ${item.name}`}
            >
              <div className="relative w-full h-56">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt=""
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 80vw, 240px"
                  />
                ) : (
                  <Package size={64} className="m-auto h-full text-slate-300" />
                )}
              </div>
              <h4 className="category-product-name text-l font-black text-(--primarycolor) mt-3 mb-2">
                {item.name}
              </h4>
            </button>
            <ProductQuantity
              name={item.name}
              quantity={quantities[item.id] || 0}
              onChange={(quantity) => onQuantity(item.id, quantity)}
            />
          </article>
        ))}
        {products.length > limit && (
          <div className="category-product-more">
            <Package size={32} />
            <strong>Mais em {category.name}</strong>
            <p>
              Exibindo {limit} de {products.length}
            </p>
            <button
              type="button"
              onClick={more}
              aria-label={`Carregar mais produtos de ${category.name}`}
            >
              Carregar mais <ArrowRight size={17} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
