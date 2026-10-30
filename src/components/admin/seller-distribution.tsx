"use client";
import { useId, useState } from "react";
import Link from "next/link";
export type SellerDistribution = {
  id: string;
  name: string;
  active: boolean;
  count: number;
};
const colors = [
  "#ba2018",
  "#2563eb",
  "#d97706",
  "#059669",
  "#7c3aed",
  "#0891b2",
  "#db2777",
  "#475569",
  "#65a30d",
  "#9333ea",
  "#0f766e",
  "#c2410c",
];
const number = new Intl.NumberFormat("pt-BR");
const percent = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  maximumFractionDigits: 1,
});
function slicePath(start: number, end: number) {
  if (end - start >= Math.PI * 2 - 0.000001)
    return "M 0 -100 A 100 100 0 1 1 0 100 A 100 100 0 1 1 0 -100 Z";
  const point = (a: number) => `${Math.cos(a) * 100} ${Math.sin(a) * 100}`;
  return `M 0 0 L ${point(start)} A 100 100 0 ${end - start > Math.PI ? 1 : 0} 1 ${point(end)} Z`;
}
export default function SellerDistributionChart({
  sellers,
  onRefresh,
}: {
  sellers: SellerDistribution[];
  onRefresh: () => void;
}) {
  const titleId = useId(),
    descriptionId = useId();
  const [selected, setSelected] = useState<string | null>(null);
  const data = sellers
    .map((s, index) => ({ ...s, color: colors[index % colors.length] }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "pt-BR"));
  const total = data.reduce((sum, s) => sum + s.count, 0);
  let angle = -Math.PI / 2;
  const slices = data
    .filter((s) => s.count > 0)
    .map((s) => {
      const start = angle;
      angle += (s.count / total) * Math.PI * 2;
      return { ...s, path: slicePath(start, angle) };
    });
  const active = data.find((s) => s.id === selected) || slices[0];
  const leaders = data.filter((s) => s.count > 0 && s.count === data[0]?.count);
  return (
    <section className="admin-panel seller-chart" aria-labelledby={titleId}>
      <header className="seller-chart-heading">
        <div>
          <span className="admin-eyebrow">DISTRIBUIÇÃO DE ORÇAMENTOS</span>
          <h2 id={titleId}>Orçamentos por vendedor</h2>
          <p id={descriptionId}>
            Todo o período · Encaminhamentos registrados pelo site, incluindo os
            cancelados. Não confirma recebimento no WhatsApp.
          </p>
        </div>
        <button type="button" className="admin-secondary" onClick={onRefresh}>
          Atualizar gráfico
        </button>
      </header>
      {total > 0 ? (
        <>
          <div className="seller-chart-summary">
            <strong>
              {number.format(total)} <span>orçamento(s) encaminhado(s)</span>
            </strong>
            <p>
              {leaders.length === 1 ? (
                <>
                  <b>{leaders[0].name}</b> lidera com{" "}
                  {number.format(leaders[0].count)} (
                  {percent.format(leaders[0].count / total)}).
                </>
              ) : (
                <>
                  Empate na liderança: {leaders.map((s) => s.name).join(", ")} ·{" "}
                  {number.format(leaders[0].count)} para cada.
                </>
              )}
            </p>
          </div>
          <div className="seller-chart-grid">
            <div className="seller-chart-visual">
              <svg
                viewBox="-110 -110 220 220"
                role="img"
                aria-labelledby={`${titleId} ${descriptionId}`}
                onMouseLeave={() => setSelected(null)}
              >
                {slices.map((s) => (
                  <path
                    key={s.id}
                    d={s.path}
                    fill={s.color}
                    stroke="white"
                    strokeWidth="1.5"
                    className={active?.id === s.id ? "is-selected" : ""}
                    onMouseEnter={() => setSelected(s.id)}
                  >
                    <title>
                      {s.name}: {number.format(s.count)} ·{" "}
                      {percent.format(s.count / total)}
                    </title>
                  </path>
                ))}
              </svg>
              <p className="seller-chart-detail">
                <b>{active?.name}</b>
                <span>
                  {number.format(active?.count || 0)} ·{" "}
                  {percent.format((active?.count || 0) / total)}
                </span>
              </p>
            </div>
            <ul
              className="seller-chart-legend"
              aria-label="Quantidade e participação por vendedor"
            >
              {data.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    className={active?.id === s.id ? "is-selected" : ""}
                    onMouseEnter={() => setSelected(s.id)}
                    onMouseLeave={() => setSelected(null)}
                    onFocus={() => setSelected(s.id)}
                    onBlur={() => setSelected(null)}
                    onClick={() => setSelected(s.id)}
                    aria-label={`${s.name}${s.active ? "" : " (inativo)"}: ${s.count} encaminhamentos, ${percent.format(s.count / total)}`}
                  >
                    <i style={{ background: s.color }} aria-hidden="true" />
                    <span className="seller-chart-name">
                      {s.name}
                      {!s.active && (
                        <small>Inativo · histórico preservado</small>
                      )}
                    </span>
                    <span className="seller-chart-values">
                      <strong>{number.format(s.count)}</strong>
                      <small>{percent.format(s.count / total)}</small>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <div className="seller-chart-empty">
          <div aria-hidden="true" />
          <h3>Nenhum orçamento encaminhado ainda</h3>
          <p>
            {sellers.length
              ? "O gráfico será preenchido conforme os orçamentos forem encaminhados aos vendedores."
              : "Cadastre seus vendedores e horários para começar a distribuir os orçamentos."}
          </p>
          <Link href="/admin/vendedores">Gerenciar vendedores →</Link>
        </div>
      )}
      <footer>
        <Link href="/admin/orcamentos">Ver histórico de orçamentos →</Link>
      </footer>
    </section>
  );
}
