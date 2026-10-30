"use client";
import SalesPanel from "./sales-panel";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  LayoutDashboard,
  Package,
  Tags,
  ImageIcon,
  PanelsTopLeft,
  Palette,
  FileText,
  ExternalLink,
  LogOut,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Upload,
  Check,
  ArrowUpRight,
  Menu,
} from "lucide-react";
import {
  defaultSettings,
  type CategoryItem,
  type MediaItem,
} from "@/lib/content";

type Row = Record<string, unknown> & {
  id: string;
  name?: string;
  title?: string;
  imageUrl?: string;
  url?: string;
  published?: boolean;
  category?: CategoryItem;
  _count?: { products: number };
};
type Field = { key: string; label: string; type?: string; hint?: string };
const navigation = [
  {
    view: "dashboard",
    href: "/admin",
    label: "Visão geral",
    icon: LayoutDashboard,
  },
  {
    view: "products",
    href: "/admin/produtos",
    label: "Produtos",
    icon: Package,
  },
  {
    view: "categories",
    href: "/admin/categorias",
    label: "Categorias",
    icon: Tags,
  },
  {
    view: "banners",
    href: "/admin/banners",
    label: "Banners",
    icon: PanelsTopLeft,
  },
  {
    view: "media",
    href: "/admin/imagens",
    label: "Biblioteca de imagens",
    icon: ImageIcon,
  },
  {
    view: "content",
    href: "/admin/conteudo",
    label: "Textos e informações",
    icon: FileText,
  },
  {
    view: "appearance",
    href: "/admin/aparencia",
    label: "Aparência",
    icon: Palette,
  },
  {
    view: "sellers",
    href: "/admin/vendedores",
    label: "Vendedores e horários",
    icon: Tags,
  },
  {
    view: "quotes",
    href: "/admin/orcamentos",
    label: "Orçamentos",
    icon: FileText,
  },
];
const fields: Record<string, Field[]> = {
  products: [
    { key: "name", label: "Nome do produto" },
    { key: "description", label: "Descrição", type: "textarea" },
    { key: "categoryId", label: "Categoria", type: "category" },
    { key: "imageUrl", label: "Imagem do produto", type: "image" },
    { key: "published", label: "Publicado no catálogo", type: "checkbox" },
  ],
  categories: [
    { key: "name", label: "Nome da categoria" },
    {
      key: "slug",
      label: "Identificador",
      hint: "Ex.: ferramentas, eletrica ou materiais-de-construcao",
    },
    { key: "primaryColor", label: "Cor principal", type: "color" },
    { key: "secondaryColor", label: "Cor de fundo", type: "color" },
  ],
  banners: [
    { key: "title", label: "Descrição da imagem (acessibilidade)" },
    {
      key: "imageUrl",
      label: "Imagem do banner",
      type: "image",
      hint: "Formato recomendado: 1920 × 800. A imagem inteira será exibida.",
    },
    {
      key: "linkUrl",
      label: "Link ao clicar",
      hint: "Opcional. Ex.: #shop ou https://…",
    },
    { key: "position", label: "Ordem de exibição", type: "number" },
    { key: "published", label: "Publicado no site", type: "checkbox" },
  ],
  content: [
    { key: "name", label: "Nome da loja" },
    {
      key: "description",
      label: "Descrição para buscadores",
      type: "textarea",
    },
    { key: "catalogTitle", label: "Título do catálogo" },
    { key: "catalogText", label: "Texto do catálogo", type: "textarea" },
    { key: "newsEnabled", label: "Mostrar novidades", type: "checkbox" },
    { key: "newsLabel", label: "Chamada das novidades" },
    { key: "newsTitle", label: "Título das novidades" },
    { key: "newsText", label: "Texto das novidades", type: "textarea" },
    { key: "aboutEnabled", label: "Mostrar sobre a loja", type: "checkbox" },
    { key: "aboutTitle", label: "Título sobre a loja" },
    { key: "aboutText", label: "Texto sobre a loja", type: "textarea" },
    { key: "phone", label: "Telefone exibido" },
    {
      key: "whatsappNumber",
      label: "WhatsApp (DDI + DDD + número)",
      hint: "Somente números. Ex.: 551532293388",
    },
    { key: "email", label: "E-mail", type: "email" },
    { key: "address", label: "Endereço" },
    { key: "weekdays", label: "Horário de segunda a sexta" },
    { key: "saturday", label: "Horário de sábado" },
    { key: "contactTitle", label: "Título do contato" },
    { key: "contactText", label: "Texto do contato", type: "textarea" },
    { key: "footerText", label: "Texto do rodapé" },
  ],
  appearance: [
    { key: "primaryColor", label: "Cor principal", type: "color" },
    { key: "secondaryColor", label: "Cor secundária", type: "color" },
    { key: "logoUrl", label: "Logo da loja", type: "image" },
    { key: "newsImage", label: "Imagem de novidades", type: "image" },
    { key: "aboutImage", label: "Imagem sobre a loja", type: "image" },
  ],
};
async function api(path: string, init?: RequestInit) {
  const response = await fetch(`/api/admin/${path}`, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...init?.headers,
    },
  });
  if (response.status === 401) {
    window.location.assign("/admin/login");
    throw new Error("Entre novamente para continuar.");
  }
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Não foi possível concluir.");
  return data;
}
function ImageField({
  value,
  onChange,
  media,
  onUploaded,
}: {
  value: string;
  onChange: (v: string) => void;
  media: MediaItem[];
  onUploaded: (v: MediaItem) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="image-field">
      <input
        aria-label="URL da imagem"
        value={value}
        placeholder="/imagem.png ou https://…"
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="image-actions">
        <label className="admin-secondary upload-label">
          <Upload size={16} />
          {busy ? "Enviando…" : "Enviar imagem"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={busy}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setBusy(true);
              setError("");
              try {
                if (file.size > 5 * 1024 * 1024)
                  throw new Error("A imagem deve ter até 5 MB.");
                const body = new FormData();
                body.set("file", file);
                const item = await api("media", { method: "POST", body });
                onChange(item.url);
                onUploaded(item);
              } catch (err) {
                setError(
                  err instanceof Error ? err.message : "Falha no envio.",
                );
              } finally {
                setBusy(false);
                e.target.value = "";
              }
            }}
          />
        </label>
        <select
          aria-label="Escolher imagem da biblioteca"
          value=""
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Usar da biblioteca…</option>
          {media.map((item) => (
            <option key={item.id} value={item.url}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      {value && (
        <img
          src={value}
          alt="Prévia da imagem selecionada"
          className="field-preview"
        />
      )}
      {error && (
        <span className="admin-error" role="alert">
          {error}
        </span>
      )}
      <small>PNG, JPG ou WebP. Até 5 MB; otimização automática.</small>
    </div>
  );
}
export default function AdminPanel({ view }: { view: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [settings, setSettings] = useState<Record<string, unknown>>({
    ...defaultSettings,
  });
  const [stats, setStats] = useState<Record<string, number | boolean>>({});
  const [settingsReady, setSettingsReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [publication, setPublication] = useState("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [editError, setEditError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [menu, setMenu] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const isSales = view === "sellers" || view === "quotes";
  const isSettings = view === "content" || view === "appearance";
  const active = navigation.find((n) => n.view === view)!;
  async function load() {
    if (isSales) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (view === "dashboard") setStats(await api("dashboard"));
      else if (isSettings) {
        const [s, m] = await Promise.all([api("settings"), api("media")]);
        setSettings(s);
        setMedia(m);
        setSettingsReady(true);
      } else {
        const [items, cats, images] = await Promise.all([
          api(view),
          view === "products" ? api("categories") : Promise.resolve([]),
          view !== "media" ? api("media") : Promise.resolve([]),
        ]);
        setRows(items);
        setPage(1);
        setCategories(cats);
        setMedia(images);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load(); /* Each route mounts its own panel. */
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (editing) dialog.current?.showModal();
    else dialog.current?.close();
  }, [editing !== null]);
  useEffect(() => {
    function warn(e: BeforeUnloadEvent) {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function closeEditor() {
    if (busy) return;
    if (dirty && !window.confirm("Descartar as alterações não salvas?")) return;
    setEditing(null);
    setDirty(false);
  }
  function openEditor(row?: Row) {
    const value: Record<string, unknown> = {};
    for (const field of fields[view])
      value[field.key] =
        row?.[field.key] ??
        (field.type === "checkbox"
          ? false
          : field.type === "number"
            ? 0
            : field.type === "color"
              ? field.key === "primaryColor"
                ? "#BA2018"
                : "#FEE2E2"
              : "");
    if (row) value.id = row.id;
    setEditError("");
    setDirty(false);
    setEditing(value);
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setEditError("");
    setError("");
    setNotice("");
    try {
      if (isSettings)
        await api("settings", {
          method: "PUT",
          body: JSON.stringify(settings),
        });
      else if (editing) {
        const { id, ...data } = editing;
        await api(`${view}${id ? `/${id}` : ""}`, {
          method: id ? "PATCH" : "POST",
          body: JSON.stringify(data),
        });
        setEditing(null);
        await load();
      }
      setDirty(false);
      setNotice("Alterações salvas. O site já está atualizado.");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Falha ao salvar.";
      if (editing) setEditError(message);
      else setError(message);
    } finally {
      setBusy(false);
    }
  }
  async function remove(row: Row) {
    if (
      !window.confirm(
        `Excluir “${row.name || row.title || "imagem"}”? Esta ação não pode ser desfeita.`,
      )
    )
      return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api(`${view}/${row.id}`, { method: "DELETE" });
      setNotice("Registro excluído.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao excluir.");
    } finally {
      setBusy(false);
    }
  }
  function renderFields(
    definitions: Field[],
    values: Record<string, unknown>,
    update: (key: string, value: unknown) => void,
  ) {
    return definitions.map((field) => (
      <div
        key={field.key}
        className={`admin-field ${field.type === "textarea" || field.type === "image" ? "field-wide" : ""}`}
      >
        {field.type === "checkbox" ? (
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={!!values[field.key]}
              onChange={(e) => update(field.key, e.target.checked)}
            />
            {field.label}
          </label>
        ) : (
          <>
            <label htmlFor={`field-${field.key}`}>{field.label}</label>
            {field.type === "image" ? (
              <ImageField
                value={String(values[field.key] || "")}
                onChange={(v) => update(field.key, v)}
                media={media}
                onUploaded={(v) => setMedia((items) => [v, ...items])}
              />
            ) : field.type === "textarea" ? (
              <textarea
                id={`field-${field.key}`}
                rows={4}
                required
                value={String(values[field.key] || "")}
                onChange={(e) => update(field.key, e.target.value)}
              />
            ) : field.type === "category" ? (
              <select
                id={`field-${field.key}`}
                required
                value={String(values[field.key] || "")}
                onChange={(e) => update(field.key, e.target.value)}
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={`field-${field.key}`}
                required={field.key !== "linkUrl"}
                type={field.type || "text"}
                min={field.type === "number" ? 0 : undefined}
                max={field.type === "number" ? 9999 : undefined}
                value={String(values[field.key] ?? "")}
                onChange={(e) =>
                  update(
                    field.key,
                    field.type === "number"
                      ? Number(e.target.value)
                      : e.target.value,
                  )
                }
              />
            )}
            {field.hint && <small>{field.hint}</small>}
          </>
        )}
      </div>
    ));
  }
  const filtered = rows.filter(
    (row) =>
      `${row.name || row.title || ""} ${row.category?.name || ""}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (publication === "all" ||
        row.published === (publication === "published")),
  );
  const visible = filtered.slice((page - 1) * 12, page * 12);
  const totalPages = Math.max(1, Math.ceil(filtered.length / 12));
  return (
    <div className="admin-app">
      <aside className={`admin-sidebar ${menu ? "is-open" : ""}`}>
        <Link href="/admin" className="admin-brand">
          <img src="/logo.png" alt="Primos" width="137" height="65" />
          <span>GESTÃO DO SITE</span>
        </Link>
        <nav aria-label="Administração">
          {navigation.map((item) => (
            <Link
              key={item.view}
              href={item.href}
              aria-current={view === item.view ? "page" : undefined}
              onClick={(e) => {
                if (dirty && !window.confirm("Sair sem salvar as alterações?"))
                  e.preventDefault();
              }}
            >
              <item.icon size={19} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <a href="/" target="_blank" rel="noreferrer">
            <ExternalLink size={18} />
            Visitar site
          </a>
          <button
            onClick={async () => {
              if (dirty && !window.confirm("Sair sem salvar as alterações?"))
                return;
              try {
                await api("logout", { method: "POST" });
                window.location.assign("/admin/login");
              } catch (e) {
                setError(e instanceof Error ? e.message : "Falha ao sair.");
              }
            }}
          >
            <LogOut size={18} />
            Sair da conta
          </button>
        </div>
      </aside>
      <div className="admin-workspace">
        <header className="admin-topbar">
          <button
            className="mobile-menu"
            aria-label="Alternar menu"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            <Menu />
          </button>
          <span>
            Administração <span className="muted">/ {active.label}</span>
          </span>
          <span className="admin-avatar">P</span>
        </header>
        <main className="admin-main">
          <div className="admin-heading">
            <div>
              <span className="admin-eyebrow">PRIMOS LAR E CONSTRUÇÃO</span>
              <h1>{active.label}</h1>
              <p>
                {view === "dashboard"
                  ? "Tudo pronto para cuidar da presença digital da sua loja."
                  : isSettings
                    ? "Edite, salve e veja as mudanças no site."
                    : "Organize o conteúdo que seus clientes encontram no site."}
              </p>
            </div>
            {["products", "categories", "banners"].includes(view) && (
              <button
                className="admin-primary"
                disabled={
                  loading || (view === "products" && !categories.length)
                }
                onClick={() => openEditor()}
              >
                <Plus size={18} />
                {view === "products"
                  ? "Novo produto"
                  : view === "categories"
                    ? "Nova categoria"
                    : "Novo banner"}
              </button>
            )}
          </div>
          {error && (
            <div className="admin-error" role="alert">
              {error}{" "}
              <button onClick={() => void load()}>Tentar novamente</button>
            </div>
          )}
          {notice && (
            <div className="admin-success" role="status">
              <Check size={18} />
              {notice}
            </div>
          )}
          {isSales && <SalesPanel view={view} />}
          {loading ? (
            <div className="admin-empty" aria-busy="true">
              Carregando conteúdo…
            </div>
          ) : (
            <>
              {view === "dashboard" && (
                <>
                  <div className="stat-grid">
                    {[
                      {
                        key: "products",
                        label: "Produtos cadastrados",
                        icon: Package,
                      },
                      {
                        key: "published",
                        label: "Produtos publicados",
                        icon: Check,
                      },
                      { key: "categories", label: "Categorias", icon: Tags },
                      { key: "banners", label: "Banners", icon: PanelsTopLeft },
                    ].map((item) => (
                      <div className="stat-card" key={item.key}>
                        <item.icon size={22} />
                        <strong>{Number(stats[item.key] || 0)}</strong>
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="admin-welcome">
                    <div>
                      <span className="admin-eyebrow">SEU PRÓXIMO PASSO</span>
                      <h2>Um catálogo sempre atualizado.</h2>
                      <p>
                        Cadastre categorias, adicione produtos e publique os
                        itens que já estão prontos para receber pedidos de
                        orçamento.
                      </p>
                      <Link className="admin-primary" href="/admin/produtos">
                        Gerenciar produtos
                        <ArrowUpRight size={18} />
                      </Link>
                    </div>
                    <Package size={100} strokeWidth={1} />
                  </div>
                  <div className="admin-panel">
                    <h2>Configuração de imagens</h2>
                    <p>
                      {stats.storageReady
                        ? "Supabase Storage configurado. Envie imagens pela biblioteca ou pelos formulários."
                        : "Configure SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY e o bucket público site-media no servidor para habilitar uploads. Você também pode usar caminhos de imagens já existentes."}
                    </p>
                    <Link href="/admin/imagens">Abrir biblioteca →</Link>
                  </div>
                </>
              )}
              {isSettings && (
                <form className="admin-panel" onSubmit={save}>
                  <fieldset disabled={busy || !settingsReady}>
                    <div className="admin-form-grid">
                      {renderFields(fields[view], settings, (key, value) => {
                        setSettings((s) => ({ ...s, [key]: value }));
                        setDirty(true);
                        setNotice("");
                      })}
                    </div>
                  </fieldset>
                  {view === "appearance" && (
                    <div
                      className="theme-preview"
                      style={{ background: String(settings.secondaryColor) }}
                    >
                      <span
                        style={{ background: String(settings.primaryColor) }}
                      >
                        Orçar pelo WhatsApp
                      </span>
                      <p>Prévia das cores da marca</p>
                    </div>
                  )}
                  <div className="form-footer">
                    <span>
                      {dirty
                        ? "Você tem alterações não salvas."
                        : "Conteúdo atualizado."}
                    </span>
                    <button
                      disabled={busy || !settingsReady}
                      className="admin-primary"
                    >
                      {busy ? "Salvando…" : "Salvar alterações"}
                    </button>
                  </div>
                </form>
              )}
              {!isSales && !isSettings && view !== "dashboard" && (
                <>
                  {view === "products" && !categories.length && !error && (
                    <div className="admin-panel">
                      Primeiro,{" "}
                      <Link href="/admin/categorias">
                        cadastre uma categoria
                      </Link>{" "}
                      para organizar seus produtos.
                    </div>
                  )}
                  {view === "media" && (
                    <div className="admin-panel">
                      <h2>Adicionar imagem</h2>
                      <ImageField
                        value=""
                        onChange={() => {}}
                        media={[]}
                        onUploaded={(item) => {
                          setRows((items) => [
                            item as unknown as Row,
                            ...items,
                          ]);
                          setNotice("Imagem enviada à biblioteca.");
                        }}
                      />
                    </div>
                  )}
                  <div className="admin-toolbar">
                    <label className="search-box">
                      <Search size={18} />
                      <input
                        aria-label="Buscar registros"
                        placeholder="Buscar por nome…"
                        value={query}
                        onChange={(e) => {
                          setQuery(e.target.value);
                          setPage(1);
                        }}
                      />
                    </label>
                    {["products", "banners"].includes(view) && (
                      <select
                        aria-label="Filtrar publicação"
                        value={publication}
                        onChange={(e) => {
                          setPublication(e.target.value);
                          setPage(1);
                        }}
                      >
                        <option value="all">Todos os status</option>
                        <option value="published">Publicados</option>
                        <option value="draft">Rascunhos</option>
                      </select>
                    )}
                    <span>{filtered.length} registro(s)</span>
                  </div>
                  {!filtered.length ? (
                    <div className="admin-empty">
                      <Package size={38} />
                      <h2>
                        {query ? "Nenhum resultado" : "Tudo começa por aqui"}
                      </h2>
                      <p>
                        {query
                          ? "Tente outro termo de busca."
                          : "Adicione seu primeiro registro para começar."}
                      </p>
                    </div>
                  ) : (
                    <div
                      className={view === "media" ? "media-grid" : "admin-list"}
                    >
                      {visible.map((row) => (
                        <article key={row.id} className="admin-row">
                          {(row.imageUrl || row.url) && (
                            <img
                              src={String(row.imageUrl || row.url)}
                              alt={row.name || row.title || "Imagem"}
                              loading="lazy"
                            />
                          )}
                          <div className="admin-row-info">
                            <strong>{row.name || row.title}</strong>
                            <small>
                              {row.category?.name ||
                                (view === "categories"
                                  ? `${row._count?.products || 0} produto(s) · ${row.slug}`
                                  : view === "banners"
                                    ? `Ordem ${row.position}`
                                    : "")}
                            </small>
                            {typeof row.published === "boolean" && (
                              <span
                                className={`status-badge ${row.published ? "published" : ""}`}
                              >
                                {row.published ? "Publicado" : "Rascunho"}
                              </span>
                            )}
                          </div>
                          <div className="row-actions">
                            {view === "media" ? (
                              <button
                                aria-label={`Copiar URL de ${row.name}`}
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText(
                                      String(row.url),
                                    );
                                    setNotice("URL copiada.");
                                  } catch {
                                    setError(
                                      "Não foi possível copiar a URL neste navegador.",
                                    );
                                  }
                                }}
                              >
                                Copiar URL
                              </button>
                            ) : (
                              <button
                                aria-label={`Editar ${row.name || row.title}`}
                                onClick={() => openEditor(row)}
                              >
                                <Pencil size={17} />
                              </button>
                            )}
                            <button
                              disabled={busy}
                              aria-label={`Excluir ${row.name || row.title}`}
                              onClick={() => void remove(row)}
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                  {totalPages > 1 && (
                    <div className="admin-pagination">
                      <button
                        disabled={page <= 1}
                        onClick={() => setPage(page - 1)}
                      >
                        Anterior
                      </button>
                      <span>
                        Página {page} de {totalPages}
                      </span>
                      <button
                        disabled={page >= totalPages}
                        onClick={() => setPage(page + 1)}
                      >
                        Próxima
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>
      <dialog
        ref={dialog}
        className="admin-dialog"
        onCancel={(e) => {
          e.preventDefault();
          closeEditor();
        }}
      >
        <form onSubmit={save}>
          <header>
            <div>
              <small>{active.label}</small>
              <h2>{editing?.id ? "Editar registro" : "Novo registro"}</h2>
            </div>
            <button
              type="button"
              aria-label="Fechar formulário"
              disabled={busy}
              onClick={closeEditor}
            >
              <X />
            </button>
          </header>
          <fieldset disabled={busy}>
            <div className="admin-form-grid">
              {editing &&
                renderFields(fields[view] || [], editing, (key, value) => {
                  setEditing((s) => ({ ...s, [key]: value }));
                  setDirty(true);
                })}
            </div>
          </fieldset>
          {editError && (
            <p className="admin-error" role="alert">
              {editError}
            </p>
          )}
          <footer>
            <button
              type="button"
              className="admin-secondary"
              disabled={busy}
              onClick={closeEditor}
            >
              Cancelar
            </button>
            <button className="admin-primary" disabled={busy}>
              {busy ? "Salvando…" : "Salvar"}
            </button>
          </footer>
        </form>
      </dialog>
    </div>
  );
}
