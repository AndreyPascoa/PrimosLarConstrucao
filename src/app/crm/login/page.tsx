export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="crm-login">
      <img src="/logo.png" alt="Primos" width="150" />
      <h1>Acesso do vendedor</h1>
      <p>Entre com o acesso criado pelo administrador.</p>
      <form method="post" action="/api/crm/login">
        <label>
          E-mail
          <input type="email" name="email" required autoComplete="username" />
        </label>
        <label>
          Senha
          <input
            type="password"
            name="password"
            required
            maxLength={256}
            autoComplete="current-password"
          />
        </label>
        {error && (
          <p role="alert">
            {error === "401"
              ? "E-mail ou senha incorretos."
              : error === "429"
                ? "Aguarde 15 minutos para tentar novamente."
                : "Não foi possível entrar. Confira a configuração do servidor."}
          </p>
        )}
        <button>Entrar no atendimento</button>
      </form>
      <a href="/admin/login">Acesso administrativo</a>
    </main>
  );
}
