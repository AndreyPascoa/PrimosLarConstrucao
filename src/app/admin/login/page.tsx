import { LockKeyhole, ArrowRight } from "lucide-react";
export const dynamic = "force-dynamic";
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error: code } = await searchParams;
  const errors: Record<string, string> = {
    "400": "Confira o e-mail e a senha informados.",
    "401": "E-mail ou senha incorretos.",
    "403": "Endereço de acesso inválido. Confira APP_URL no servidor.",
    "429": "Muitas tentativas. Aguarde até 15 minutos.",
    "503":
      "Não foi possível entrar. Confira as configurações do administrador, a conexão e as migrações do banco no servidor.",
  };
  const error = code
    ? errors[code] || "Não foi possível entrar. Tente novamente."
    : "";
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
        <form method="post" action="/api/admin/login">
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
          <button type="submit" className="admin-primary">
            Entrar no painel
            <ArrowRight size={18} />
          </button>
        </form>
        <small>Precisa de acesso? Fale com o responsável pelo site.</small>
      </div>
    </main>
  );
}
