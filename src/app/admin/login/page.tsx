"use client";
import { useState, type FormEvent } from "react";
import { LockKeyhole, ArrowRight } from "lucide-react";
export default function Login() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      window.location.assign("/admin");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Não foi possível entrar. Tente novamente.",
      );
      setBusy(false);
    }
  }
  return (
    <main className="admin-login">
      <div className="login-brand">
        <img src="/logo.png" alt="Primos" width="180" height="85" />
        <span>PAINEL DE CONTEÚDO</span>
        <h1>
          Sua loja.
          <br />
          Do seu jeito.
        </h1>
        <p>Produtos, campanhas e informações atualizadas em um só lugar.</p>
        <a href="/">← Voltar ao site</a>
      </div>
      <div className="login-card">
        <div className="admin-icon">
          <LockKeyhole />
        </div>
        <h2>Bem-vindo de volta</h2>
        <p>Entre com sua conta de administrador.</p>
        <form onSubmit={submit}>
          <label>
            E-mail
            <input
              name="email"
              type="email"
              autoComplete="username"
              required
              maxLength={254}
            />
          </label>
          <label>
            Senha
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              maxLength={256}
            />
          </label>
          {error && (
            <p className="admin-error" role="alert">
              {error}
            </p>
          )}
          <button className="admin-primary" disabled={busy}>
            {busy ? "Entrando…" : "Entrar no painel"}
            <ArrowRight size={18} />
          </button>
        </form>
        <small>Precisa de acesso? Fale com o responsável pelo site.</small>
      </div>
    </main>
  );
}
