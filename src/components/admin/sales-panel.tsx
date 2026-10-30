"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  defaultSchedule,
  weekdayNames,
  quoteStatuses,
  type Schedule,
} from "@/lib/sales";
type Seller = {
  id: string;
  name: string;
  phone: string;
  active: boolean;
  available: boolean;
  schedule: Schedule;
  _count: { quotes: number };
};
type Quote = {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  items: { id: string; name: string; quantity: number }[];
  status: keyof typeof quoteStatuses;
  notes: string;
  createdAt: string;
};
type Draft = {
  id?: string;
  name: string;
  phone: string;
  active: boolean;
  schedule: Schedule;
};
async function api(path: string, init?: RequestInit) {
  const response = await fetch(`/api/admin/${path}`, {
    ...init,
    headers: { "Content-Type": "application/json" },
  });
  if (response.status === 401) {
    location.assign("/admin/login");
    throw Error("Entre novamente.");
  }
  const data = await response.json();
  if (!response.ok) throw Error(data.error || "Falha na operação.");
  return data;
}
export default function SalesPanel({ view }: { view: string }) {
  const [sellers, setSellers] = useState<Seller[]>([]),
    [quotes, setQuotes] = useState<Quote[]>([]),
    [total, setTotal] = useState(0),
    [page, setPage] = useState(1),
    [filter, setFilter] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [notice, setNotice] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  async function load() {
    setLoading(true);
    setError("");
    try {
      const rows = await api("sellers");
      setSellers(rows);
      if (view === "quotes") {
        const data = await api(
          `quotes?page=${page}&seller=${encodeURIComponent(filter)}`,
        );
        setQuotes(data.rows);
        setTotal(data.total);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao carregar.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, [view, page, filter]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (draft) dialog.current?.showModal();
    else dialog.current?.close();
  }, [draft !== null]);
  function edit(seller?: Seller) {
    setError("");
    setDraft(
      seller
        ? {
            id: seller.id,
            name: seller.name,
            phone: seller.phone,
            active: seller.active,
            schedule: structuredClone(seller.schedule),
          }
        : {
            name: "",
            phone: "",
            active: true,
            schedule: structuredClone(defaultSchedule),
          },
    );
  }
  function updateDay(day: number, key: string, value: unknown) {
    setDraft((d) =>
      d
        ? {
            ...d,
            schedule: d.schedule.map((s) =>
              s.day === day ? { ...s, [key]: value } : s,
            ),
          }
        : d,
    );
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    setBusy(true);
    setError("");
    try {
      const { id, ...data } = draft;
      await api(`sellers${id ? "/" + id : ""}`, {
        method: id ? "PATCH" : "POST",
        body: JSON.stringify(data),
      });
      setDraft(null);
      setNotice("Vendedor e horários salvos.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao salvar.");
    } finally {
      setBusy(false);
    }
  }
  async function updateQuote(event: FormEvent<HTMLFormElement>, quote: Quote) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      await api(`quotes/${quote.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: form.get("status"),
          notes: form.get("notes"),
        }),
      });
      setNotice("Acompanhamento atualizado.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao salvar.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="sales-panel">
      <div className="admin-panel">
        <p>
          Horários de Brasília. O rodízio escolhe o vendedor disponível há mais
          tempo sem um novo orçamento. Pausas, dias desmarcados e vendedores
          inativos ficam fora da distribuição.
        </p>
        <p>
          O histórico registra o encaminhamento ao WhatsApp. O recebimento da
          mensagem deve ser confirmado pelo vendedor.
        </p>
      </div>
      {error && !draft && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="admin-success" role="status">
          {notice}
        </p>
      )}
      <div className="admin-toolbar">
        {view === "sellers" ? (
          <button className="admin-primary" onClick={() => edit()}>
            Adicionar vendedor
          </button>
        ) : (
          <label>
            Vendedor{" "}
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Todos</option>
              {sellers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <button
          className="admin-secondary"
          disabled={loading}
          onClick={() => void load()}
        >
          Atualizar
        </button>
      </div>
      {view === "sellers" && (
        <div className="sales-seller-grid">
          {sellers.map((s) => (
            <article className="admin-panel" key={s.id}>
              <h2>{s.name}</h2>
              <p>+{s.phone}</p>
              <span
                className={`status-badge ${s.available ? "published" : ""}`}
              >
                {!s.active
                  ? "Inativo"
                  : s.available
                    ? "Disponível agora"
                    : "Fora do horário"}
              </span>
              <p>
                <strong>{s._count.quotes}</strong> orçamento(s) encaminhado(s)
                no total
              </p>
              <button className="admin-secondary" onClick={() => edit(s)}>
                Editar {s.name}
              </button>
            </article>
          ))}
        </div>
      )}
      {loading ? (
        <p aria-busy="true">Carregando…</p>
      ) : view === "sellers" && !sellers.length ? (
        <div className="admin-empty">
          Cadastre os vendedores e confira os horários antes de ativar o
          rodízio.
        </div>
      ) : (
        view === "quotes" && (
          <>
            <div className="sales-seller-grid">
              {sellers
                .filter((s) => !filter || s.id === filter)
                .map((s) => (
                  <div className="admin-panel" key={s.id}>
                    <strong>{s.name}</strong>
                    <p>{s._count.quotes} encaminhamento(s) no total</p>
                  </div>
                ))}
            </div>
            <p>
              {total} orçamento(s) registrado(s). Datas em horário de Brasília.
            </p>
            {quotes.length ? (
              quotes.map((q) => (
                <article className="admin-panel sales-quote" key={q.id}>
                  <header>
                    <strong>Orçamento {q.id}</strong>
                    <span>
                      {new Intl.DateTimeFormat("pt-BR", {
                        timeZone: "America/Sao_Paulo",
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(new Date(q.createdAt))}
                    </span>
                  </header>
                  <p>
                    Encaminhado para <strong>{q.sellerName}</strong> · +
                    {q.sellerPhone}
                  </p>
                  <details>
                    <summary>Ver produtos ({q.items.length})</summary>
                    <ul>
                      {q.items.map((p) => (
                        <li key={p.id}>
                          {p.quantity} × {p.name}
                        </li>
                      ))}
                    </ul>
                  </details>
                  <form onSubmit={(e) => void updateQuote(e, q)}>
                    <label>
                      Andamento
                      <select name="status" defaultValue={q.status}>
                        {Object.entries(quoteStatuses).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Observações
                      <textarea
                        name="notes"
                        defaultValue={q.notes}
                        maxLength={1000}
                        rows={2}
                      />
                    </label>
                    <button className="admin-secondary" disabled={busy}>
                      Salvar acompanhamento
                    </button>
                  </form>
                </article>
              ))
            ) : (
              <div className="admin-empty">
                Nenhum orçamento encaminhado ainda.
              </div>
            )}
            {total > 25 && (
              <div className="admin-pagination">
                <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                  Anterior
                </button>
                <span>
                  Página {page} de {Math.ceil(total / 25)}
                </span>
                <button
                  disabled={page * 25 >= total}
                  onClick={() => setPage(page + 1)}
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )
      )}
      <dialog
        ref={dialog}
        className="admin-dialog seller-dialog"
        onCancel={(e) => {
          if (busy) e.preventDefault();
          else setDraft(null);
        }}
      >
        {draft && (
          <form onSubmit={save}>
            <header>
              <h2>{draft.id ? "Editar vendedor" : "Novo vendedor"}</h2>
              <button
                type="button"
                aria-label="Fechar cadastro de vendedor"
                disabled={busy}
                onClick={() => setDraft(null)}
              >
                ×
              </button>
            </header>
            <fieldset disabled={busy}>
              <div className="admin-form-grid">
                <label>
                  Nome
                  <input
                    required
                    maxLength={100}
                    value={draft.name}
                    onChange={(e) =>
                      setDraft({ ...draft, name: e.target.value })
                    }
                  />
                </label>
                <label>
                  WhatsApp com DDI e DDD
                  <input
                    required
                    type="tel"
                    inputMode="tel"
                    pattern="55[0-9]{10,11}"
                    placeholder="5515999999999"
                    value={draft.phone}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        phone: e.target.value.replace(/\D/g, ""),
                      })
                    }
                  />
                </label>
              </div>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={draft.active}
                  onChange={(e) =>
                    setDraft({ ...draft, active: e.target.checked })
                  }
                />
                Participar do rodízio
              </label>
              <p>
                Configure cada dia. Horário de Brasília. Sem atendimento durante
                o almoço ou após a saída. Turnos devem terminar no mesmo dia.
              </p>
              {draft.schedule.map((s) => (
                <div className="seller-day" key={s.day}>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={s.enabled}
                      onChange={(e) =>
                        updateDay(s.day, "enabled", e.target.checked)
                      }
                    />
                    {weekdayNames[s.day]}
                  </label>
                  {s.enabled && (
                    <fieldset disabled={busy}>
                      <div className="seller-times">
                        <label>
                          Entrada
                          <input
                            aria-label={`Entrada ${weekdayNames[s.day]}`}
                            type="time"
                            required
                            value={s.start}
                            onChange={(e) =>
                              updateDay(s.day, "start", e.target.value)
                            }
                          />
                        </label>
                        <label>
                          Saída
                          <input
                            aria-label={`Saída ${weekdayNames[s.day]}`}
                            type="time"
                            required
                            value={s.end}
                            onChange={(e) =>
                              updateDay(s.day, "end", e.target.value)
                            }
                          />
                        </label>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={s.lunch}
                            onChange={(e) =>
                              updateDay(s.day, "lunch", e.target.checked)
                            }
                          />
                          Intervalo de almoço
                        </label>
                      </div>
                      {s.lunch && (
                        <div className="seller-times">
                          <label>
                            Saída para almoço
                            <input
                              aria-label={`Almoço ${weekdayNames[s.day]}`}
                              type="time"
                              required
                              value={s.lunchStart}
                              onChange={(e) =>
                                updateDay(s.day, "lunchStart", e.target.value)
                              }
                            />
                          </label>
                          <label>
                            Retorno do almoço
                            <input
                              aria-label={`Retorno ${weekdayNames[s.day]}`}
                              type="time"
                              required
                              value={s.lunchEnd}
                              onChange={(e) =>
                                updateDay(s.day, "lunchEnd", e.target.value)
                              }
                            />
                          </label>
                        </div>
                      )}
                      <button
                        type="button"
                        className="admin-secondary"
                        onClick={() =>
                          setDraft((d) =>
                            d
                              ? {
                                  ...d,
                                  schedule: d.schedule.map((day) =>
                                    day.enabled ? { ...s, day: day.day } : day,
                                  ),
                                }
                              : d,
                          )
                        }
                      >
                        Repetir horários nos dias ativos
                      </button>
                    </fieldset>
                  )}
                </div>
              ))}
            </fieldset>
            {error && (
              <p className="admin-error" role="alert">
                {error}
              </p>
            )}
            <footer>
              <button
                type="button"
                disabled={busy}
                className="admin-secondary"
                onClick={() => setDraft(null)}
              >
                Cancelar
              </button>
              <button disabled={busy} className="admin-primary">
                {busy ? "Salvando…" : "Salvar vendedor"}
              </button>
            </footer>
          </form>
        )}
      </dialog>
    </div>
  );
}
