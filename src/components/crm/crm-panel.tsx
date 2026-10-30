"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Actor } from "@/server/crm-auth";
type Seller = { id: string; name: string; phone: string };
type Account = {
  id: string;
  sellerId: string;
  status: string;
  qr: string | null;
};
type Message = {
  id: string;
  direction: string;
  body: string;
  status: string;
  error?: string;
  author?: string;
  createdAt: string;
  attachment?: { id: string; name: string };
};
type Conversation = {
  account?: Account;
  sourcePhone?: string;
  id: string;
  accountId: string;
  assignedSellerId: string;
  phone: string;
  name: string;
  stage: string;
  notes: string;
  quoteId?: string;
  hasMore?: boolean;
  messages: Message[];
  quotes?: { id: string; items: { name: string; quantity: number }[] }[];
};
const stages = {
  new: "Novo contato",
  contacted: "Em atendimento",
  quoted: "Orçamento enviado",
  won: "Concluído",
  lost: "Não convertido",
};
const statuses: Record<string, string> = {
  queued: "Na fila",
  sending: "Enviando",
  sent: "Enviado",
  delivered: "Entregue",
  read: "Lido",
  received: "Recebido",
  failed: "Falhou",
  unknown: "Confira no WhatsApp antes de reenviar",
};
const accountStatuses: Record<string, string> = {
  connected: "Conectado",
  connecting: "Conectando",
  qr: "Leia o QR Code",
  disconnected: "Desconectado",
  offline: "Conector offline",
  pending: "Solicitação pendente",
  error: "Falha na conexão",
  wrong_number: "Número diferente do cadastro",
};
async function api(path: string, init?: RequestInit) {
  const response = await fetch(`/api/crm/${path}`, {
    ...init,
    headers:
      init?.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" },
  });
  if (response.status === 401) {
    location.assign("/crm/login");
    throw Error("Entre novamente.");
  }
  const data = await response.json();
  if (!response.ok) throw Error(data.error || "Falha na operação.");
  return data;
}
function uuid() {
  const a = crypto.getRandomValues(new Uint8Array(16));
  a[6] = (a[6] & 15) | 64;
  a[8] = (a[8] & 63) | 128;
  const h = Array.from(a, (n) => n.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
export default function CrmPanel({ actor }: { actor: Actor }) {
  const [view, setView] = useState("inbox"),
    [sellers, setSellers] = useState<Seller[]>([]),
    [accounts, setAccounts] = useState<Account[]>([]),
    [conversations, setConversations] = useState<Conversation[]>([]),
    [selected, setSelected] = useState<Conversation | null>(null),
    [query, setQuery] = useState(""),
    [stage, setStage] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [text, setText] = useState(""),
    [attachment, setAttachment] = useState<{ id: string; name: string } | null>(
      null,
    ),
    [notice, setNotice] = useState("");
  const selectedId = useRef<string | null>(null),
    requestKey = useRef<string | null>(null),
    list = useRef<HTMLDivElement>(null);
  async function refresh() {
    try {
      const [s, a, c] = await Promise.all([
        api("sellers"),
        api("accounts"),
        api(`conversations?q=${encodeURIComponent(query)}`),
      ]);
      setSellers(s);
      setAccounts(a);
      setConversations(c);
      if (selectedId.current) {
        const id = selectedId.current;
        const detail = await api(`conversations/${id}`);
        if (id === selectedId.current)
          setSelected((previous) =>
            previous?.id === id
              ? {
                  ...detail,
                  hasMore: previous.hasMore,
                  messages: Array.from(
                    new Map(
                      [...previous.messages, ...detail.messages].map((m) => [
                        m.id,
                        m,
                      ]),
                    ).values(),
                  ).sort(
                    (a, b) =>
                      a.createdAt.localeCompare(b.createdAt) ||
                      a.id.localeCompare(b.id),
                  ),
                }
              : detail,
          );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao atualizar.");
    }
  }
  useEffect(() => {
    void refresh();
    const timer = setInterval(() => void refresh(), 5000);
    return () => clearInterval(timer);
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps
  async function open(c: Conversation) {
    selectedId.current = c.id;
    setSelected(null);
    setText("");
    setAttachment(null);
    requestKey.current = null;
    try {
      const detail = await api(`conversations/${c.id}`);
      if (selectedId.current === c.id) {
        setSelected(detail);
        requestAnimationFrame(() =>
          list.current?.scrollTo({ top: list.current.scrollHeight }),
        );
      }
    } catch (e) {
      setError(String(e));
    }
  }
  async function action(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await fn();
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha na operação.");
    } finally {
      setBusy(false);
    }
  }
  async function send(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;
    const id = selected.id;
    const key = requestKey.current || (requestKey.current = uuid());
    await action(async () => {
      await api(`conversations/${id}/messages`, {
        method: "POST",
        body: JSON.stringify({
          requestKey: key,
          body: text,
          ...(attachment ? { attachmentId: attachment.id } : {}),
        }),
      });
      setText("");
      setAttachment(null);
      requestKey.current = null;
      setNotice("Mensagem colocada na fila de envio.");
    });
  }
  const account =
    accounts.find((a) => a.id === selected?.accountId) || selected?.account;
  return (
    <div className="crm-app">
      <header className="crm-top">
        <a href="/">
          <img src="/logo.png" alt="Primos" width="110" />
        </a>
        <strong>Central de atendimento</strong>
        <span>{actor.name}</span>
        <nav>
          <button onClick={() => setView("inbox")}>Conversas</button>
          <button onClick={() => setView("accounts")}>WhatsApp</button>
          {actor.admin && (
            <>
              <button onClick={() => setView("users")}>Acessos</button>
              <a href="/admin">Painel</a>
            </>
          )}
          <button
            onClick={() =>
              void action(async () => {
                await api("logout", { method: "POST" });
                location.assign(actor.admin ? "/admin" : "/crm/login");
              })
            }
          >
            Sair
          </button>
        </nav>
      </header>
      {error && (
        <p className="crm-error" role="alert">
          {error}
          <button onClick={() => setError("")}>×</button>
        </p>
      )}
      {notice && (
        <p className="crm-notice" role="status">
          {notice}
        </p>
      )}
      {view === "accounts" && (
        <main className="crm-settings">
          <h1>Conexões WhatsApp</h1>
          <p>
            Use primeiro um número de teste. Vincule somente o número informado
            no cadastro do vendedor. O serviço conector deve estar em execução.
            Conversas recebidas após conectar aparecerão no CRM; grupos e
            histórico antigo não são importados.
          </p>
          <div className="crm-account-grid">
            {sellers.map((s) => {
              const a = accounts.find((a) => a.sellerId === s.id);
              return (
                <article key={s.id}>
                  <h2>{s.name}</h2>
                  <p>+{s.phone}</p>
                  {!a && (
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        const data = new FormData(event.currentTarget);
                        void action(async () => {
                          await api("profile", {
                            method: "POST",
                            body: JSON.stringify({
                              sellerId: s.id,
                              phone: data.get("phone"),
                            }),
                          });
                          setNotice("Número atualizado.");
                        });
                      }}
                    >
                      <label>
                        Seu número com DDI e DDD
                        <input
                          name="phone"
                          type="tel"
                          pattern="55[0-9]{10,11}"
                          defaultValue={s.phone}
                          required
                        />
                      </label>
                      <button disabled={busy}>Salvar número</button>
                    </form>
                  )}
                  <p>
                    Estado:{" "}
                    {accountStatuses[a?.status || ""] || "Não configurado"}
                  </p>
                  {a?.qr && (
                    <img
                      src={a.qr}
                      alt={`QR Code para conectar ${s.name}`}
                      width="240"
                    />
                  )}
                  <button
                    disabled={busy}
                    onClick={() =>
                      void action(async () => {
                        await api("accounts", {
                          method: "POST",
                          body: JSON.stringify({
                            sellerId: s.id,
                            command: "connect",
                          }),
                        });
                      })
                    }
                  >
                    Conectar / novo QR
                  </button>
                  <button
                    disabled={busy}
                    onClick={() =>
                      void action(async () => {
                        await api("accounts", {
                          method: "POST",
                          body: JSON.stringify({
                            sellerId: s.id,
                            command: "disconnect",
                          }),
                        });
                      })
                    }
                  >
                    Desconectar
                  </button>
                </article>
              );
            })}
          </div>
        </main>
      )}
      {view === "users" && actor.admin && (
        <main className="crm-settings">
          <h1>Acessos dos vendedores</h1>
          <p>
            Crie ou substitua o acesso do vendedor. Trocar a senha invalida as
            sessões anteriores. Primeiro cadastre o vendedor no painel.
          </p>
          <form
            className="crm-user-form"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget,
                data = new FormData(form);
              void action(async () => {
                await api("users", {
                  method: "POST",
                  body: JSON.stringify({
                    sellerId: data.get("sellerId"),
                    email: data.get("email"),
                    password: data.get("password"),
                    active: data.get("active") === "on",
                  }),
                });
                form.reset();
                setNotice("Acesso salvo.");
              });
            }}
          >
            <label>
              Vendedor
              <select name="sellerId" required>
                {sellers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              E-mail
              <input type="email" name="email" required />
            </label>
            <label>
              Nova senha
              <input
                type="password"
                name="password"
                minLength={12}
                maxLength={256}
                required
                autoComplete="new-password"
              />
            </label>
            <label>
              <input type="checkbox" name="active" defaultChecked />
              Acesso ativo
            </label>
            <button disabled={busy}>Salvar acesso</button>
          </form>
          <p>
            Login dos vendedores: <a href="/crm/login">/crm/login</a>
          </p>
        </main>
      )}
      {view === "inbox" && (
        <main className={`crm-inbox ${selected ? "has-selection" : ""}`}>
          <aside className="crm-list">
            <h1>Atendimentos</h1>
            <input
              aria-label="Buscar cliente"
              placeholder="Nome ou telefone"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              aria-label="Filtrar etapa"
              value={stage}
              onChange={(e) => setStage(e.target.value)}
            >
              <option value="">Todas as etapas</option>
              {Object.entries(stages).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
            <small>
              Últimas 100 conversas da busca · atualização a cada 5 segundos
            </small>
            {conversations
              .filter((c) => !stage || c.stage === stage)
              .map((c) => (
                <button
                  key={c.id}
                  className={selected?.id === c.id ? "active" : ""}
                  onClick={() => void open(c)}
                >
                  <strong>{c.name || c.phone}</strong>
                  <span>{stages[c.stage as keyof typeof stages]}</span>
                  <small>
                    {c.messages[0]?.body || "Anexo ou nova conversa"}
                  </small>
                </button>
              ))}
            {!conversations.length && (
              <p>Nenhuma conversa. Conecte um número na aba WhatsApp.</p>
            )}
          </aside>
          <section className="crm-thread">
            {selected ? (
              <>
                <header>
                  <button
                    className="crm-back"
                    onClick={() => {
                      selectedId.current = null;
                      setSelected(null);
                    }}
                  >
                    ← Voltar
                  </button>
                  <h2>{selected.name || selected.phone}</h2>
                  <p>
                    +{selected.phone} · Conta: +{selected.sourcePhone} ·{" "}
                    {accountStatuses[account?.status || ""] || "Desconectado"}
                  </p>
                </header>
                <details className="crm-customer">
                  <summary>Cliente, etapa e observações</summary>
                  <form
                    key={selected.id}
                    onSubmit={(e) => {
                      e.preventDefault();
                      const data = new FormData(e.currentTarget);
                      void action(async () => {
                        await api(`conversations/${selected.id}`, {
                          method: "PATCH",
                          body: JSON.stringify({
                            name: data.get("name"),
                            notes: data.get("notes"),
                            stage: data.get("stage"),
                            assignedSellerId: data.get("sellerId"),
                          }),
                        });
                        setNotice("Atendimento atualizado.");
                      });
                    }}
                  >
                    <label>
                      Nome
                      <input
                        name="name"
                        defaultValue={selected.name}
                        maxLength={120}
                      />
                    </label>
                    <label>
                      Etapa
                      <select name="stage" defaultValue={selected.stage}>
                        {Object.entries(stages).map(([v, l]) => (
                          <option key={v} value={v}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Responsável
                      <select
                        name="sellerId"
                        defaultValue={selected.assignedSellerId}
                        disabled={!actor.admin}
                      >
                        {sellers.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    {!actor.admin && (
                      <input
                        type="hidden"
                        name="sellerId"
                        value={selected.assignedSellerId}
                      />
                    )}
                    <label>
                      Notas internas
                      <textarea
                        name="notes"
                        maxLength={3000}
                        defaultValue={selected.notes}
                      />
                    </label>
                    <button disabled={busy}>Salvar atendimento</button>
                  </form>
                </details>
                {selected.quotes?.map((q) => (
                  <details className="crm-customer" key={q.id}>
                    <summary>Orçamento {q.id}</summary>
                    {q.items.map((p, i) => (
                      <p key={i}>
                        {p.quantity} × {p.name}
                      </p>
                    ))}
                  </details>
                ))}
                <div ref={list} className="crm-messages">
                  {selected.hasMore && (
                    <button
                      disabled={busy}
                      onClick={() =>
                        void action(async () => {
                          const older = await api(
                            `conversations/${selected.id}?before=${selected.messages[0].id}`,
                          );
                          setSelected((previous) =>
                            previous && previous.id === older.id
                              ? {
                                  ...previous,
                                  hasMore: older.hasMore,
                                  messages: [
                                    ...older.messages,
                                    ...previous.messages,
                                  ],
                                }
                              : previous,
                          );
                        })
                      }
                    >
                      Carregar mensagens anteriores
                    </button>
                  )}
                  {selected.messages.map((m) => (
                    <article
                      key={m.id}
                      className={`crm-message ${m.direction}`}
                    >
                      <p>{m.body}</p>
                      {m.attachment && (
                        <a
                          href={`/api/crm/attachments/${m.attachment.id}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Baixar {m.attachment.name}
                        </a>
                      )}
                      <footer>
                        {m.author && `${m.author} · `}
                        {new Date(m.createdAt).toLocaleString("pt-BR")} ·{" "}
                        {statuses[m.status] || m.status}
                      </footer>
                      {m.error && <small>{m.error}</small>}
                    </article>
                  ))}
                  <p className="crm-history-note">
                    Carregue o histórico anterior quando necessário.
                  </p>
                </div>
                <form className="crm-compose" onSubmit={send}>
                  <textarea
                    aria-label="Mensagem"
                    placeholder="Escreva sua mensagem…"
                    maxLength={4000}
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value);
                      requestKey.current = null;
                    }}
                  />
                  <label className="crm-file">
                    Anexar imagem ou PDF
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,application/pdf"
                      disabled={busy}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        void action(async () => {
                          const data = new FormData();
                          data.set("file", file);
                          setAttachment(
                            await api(
                              `conversations/${selected.id}/attachments`,
                              { method: "POST", body: data },
                            ),
                          );
                          requestKey.current = null;
                        });
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {attachment && (
                    <span>
                      {attachment.name}
                      <button
                        type="button"
                        onClick={() => {
                          setAttachment(null);
                          requestKey.current = null;
                        }}
                      >
                        Remover
                      </button>
                    </span>
                  )}
                  <button
                    disabled={
                      busy ||
                      (!text.trim() && !attachment) ||
                      account?.status !== "connected"
                    }
                  >
                    {busy ? "Processando…" : "Enviar"}
                  </button>
                  {account?.status !== "connected" && (
                    <small>
                      Reconecte o número na aba WhatsApp para enviar.
                    </small>
                  )}
                </form>
              </>
            ) : (
              <div className="crm-empty">
                <h2>Seu atendimento começa aqui</h2>
                <p>
                  Selecione uma conversa para responder, acompanhar o orçamento
                  e registrar observações.
                </p>
              </div>
            )}
          </section>
        </main>
      )}
    </div>
  );
}
