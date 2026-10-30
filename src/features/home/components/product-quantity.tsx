"use client";
import { useRef, useState } from "react";
import { Check, Minus, Plus, X } from "lucide-react";
export default function ProductQuantity({
  name,
  quantity,
  onChange,
}: {
  name: string;
  quantity: number;
  onChange: (quantity: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("1");
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const amount = Number(draft);
  const valid = Number.isInteger(amount) && amount >= 1 && amount <= 999;
  function cancel() {
    setEditing(false);
    trigger.current?.focus();
  }
  function confirm() {
    if (!valid) {
      input.current?.focus();
      return;
    }
    onChange(amount);
    setEditing(false);
    trigger.current?.focus();
  }
  return (
    <div className={`product-order ${editing ? "is-editing" : ""}`}>
      <button
        ref={trigger}
        type="button"
        className="product-order-button"
        aria-expanded={editing}
        aria-label={
          editing
            ? `Confirmar quantidade de ${name}`
            : quantity
              ? `Editar quantidade de ${name}`
              : "Adicionar ao orçamento"
        }
        onClick={() => {
          if (editing) confirm();
          else {
            setDraft(String(quantity || 1));
            setEditing(true);
            requestAnimationFrame(() => {
              input.current?.focus();
              input.current?.select();
            });
          }
        }}
      >
        <span className="product-order-label">
          {quantity ? `No orçamento · ${quantity}` : "Adicionar ao orçamento"}
        </span>
        <Check className="product-order-check" size={20} />
      </button>
      <div
        className="product-order-controls"
        inert={!editing}
        aria-hidden={!editing}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            cancel();
          }
          if (e.key === "Enter") {
            e.preventDefault();
            confirm();
          }
        }}
      >
        <button
          type="button"
          aria-label={`Diminuir quantidade de ${name}`}
          disabled={valid && amount <= 1}
          onClick={() =>
            setDraft(String(Math.max(1, (valid ? amount : 1) - 1)))
          }
        >
          <Minus size={16} />
        </button>
        <input
          ref={input}
          type="number"
          inputMode="numeric"
          min="1"
          max="999"
          step="1"
          aria-label={`Quantidade de ${name}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button
          type="button"
          aria-label={`Aumentar quantidade de ${name}`}
          disabled={valid && amount >= 999}
          onClick={() =>
            setDraft(String(Math.min(999, (valid ? amount : 0) + 1)))
          }
        >
          <Plus size={16} />
        </button>
        <button
          type="button"
          aria-label={`Cancelar quantidade de ${name}`}
          onClick={cancel}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
