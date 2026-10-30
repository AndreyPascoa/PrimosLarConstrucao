# Primos Lar e Construção

Site institucional e catálogo com orçamento pelo WhatsApp, administrados por um painel privado. Next.js 16, React, TypeScript, PostgreSQL/Supabase e Prisma 7. Trabalho desenvolvido na branch `feature/admin`.

## O que está implementado

- Catálogo público vindo do banco: produtos publicados, busca, filtros de categoria, paginação, descrição e imagens.
- Lista de orçamento persistida no navegador, quantidades, remoção de itens e envio pelo WhatsApp da loja. Não há cobrança online: preços, estoque e entrega são confirmados pela equipe.
- Login administrativo, sessão de oito horas em cookie HttpOnly, logout e proteção de todas as APIs de escrita.
- Produtos e categorias: cadastro, edição, exclusão, cores e publicação/rascunho. Categorias em uso não podem ser excluídas.
- Banners: imagens, texto alternativo, links, ordenação e publicação.
- Biblioteca de imagens: upload PNG/JPG/WebP até 5 MB, conversão para WebP no servidor, Supabase Storage, seleção em formulários e exclusão protegida de imagens em uso.
- Conteúdo e aparência: logo, cores, títulos, descrições, novidades, sobre a loja, contatos, horários e metadados de busca. Novidades e sobre podem ser ocultados.
- Site e painel adaptados para celular, estados de carregamento/erro/vazio, confirmação de exclusão e aviso de alterações não salvas.

## Preparar o ambiente

Use Node.js 22. Copie `.env.example` para `.env` e preencha os dados do seu projeto Supabase. Não envie `.env` ao GitHub.

```bash
nvm use
npm ci
npm run db:migrate
npm run db:seed
npm run admin:password
npm run images:optimize
npm run dev
```

`npm ci` gera o Prisma Client. `db:migrate` aplica as migrações pendentes sem apagar produtos/categorias existentes. Confira a conexão antes de executar em produção. `db:seed` inicializa as configurações e, apenas quando as tabelas estão vazias, os dois produtos e o banner já existentes no projeto. Execute o seed uma vez na configuração inicial; ele não é executado automaticamente pelo build.

O comando `admin:password` gera uma senha aleatória e seu hash. Guarde a senha num gerenciador e copie **somente o hash** para `ADMIN_PASSWORD_HASH`. Defina o e-mail do responsável em `ADMIN_EMAIL`. Não existe senha padrão nem cadastro público de administradores. Trocar o e-mail ou o hash invalida as sessões existentes. Reinicie a aplicação após alterar variáveis.

Acesse `/admin/login`. O painel tem `/admin`, `/admin/produtos`, `/admin/categorias`, `/admin/banners`, `/admin/imagens`, `/admin/conteudo` e `/admin/aparencia`.

## Variáveis

| Variável                    | Uso                                                                                                                                                      |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`              | Conexão PostgreSQL do servidor, compatível com Prisma/adapter-pg. Use o pooler recomendado no painel Supabase e SSL quando exigido.                      |
| `DIRECT_URL`                | Conexão direta ou session pooler para migrações. Não use a chave da API como senha.                                                                      |
| `APP_URL`                   | Origem exata acessada no navegador, por exemplo `http://localhost:3000` no desenvolvimento e `https://primoslarconstrucao.com` em produção. Sem caminho. |
| `ADMIN_EMAIL`               | E-mail autorizado a entrar no painel.                                                                                                                    |
| `ADMIN_PASSWORD_HASH`       | Hash scrypt gerado por `npm run admin:password`.                                                                                                         |
| `SUPABASE_URL`              | URL do projeto Supabase.                                                                                                                                 |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço exclusivamente do servidor; nunca use prefixo `NEXT_PUBLIC_`.                                                                           |
| `SUPABASE_STORAGE_BUCKET`   | Bucket público de imagens; padrão `site-media`.                                                                                                          |

A conexão PostgreSQL usada pelo servidor deve ser proprietária das tabelas ou ter permissão BYPASSRLS (como a conexão administrativa fornecida pelo Supabase). As migrações habilitam RLS sem políticas de acesso público; o navegador usa apenas as APIs Next.js. Não exponha credenciais de banco no cliente.

## Preparar imagens no Supabase

1. Em Storage, crie o bucket `site-media` como **público**. Somente imagens destinadas à publicação devem ser enviadas.
2. Restrinja o bucket a `image/webp` e limite de 5 MB. O servidor recebe PNG/JPG/WebP e converte antes de enviar.
3. Configure a URL e chave de serviço no servidor. Não crie políticas anônimas de upload/exclusão: as operações são feitas pela API autenticada.
4. Abra `/admin/imagens` e envie uma imagem. Ela pode ser escolhida nos formulários de produtos, banners e aparência.

Os arquivos existentes em `public/` continuam válidos. As imagens institucionais conhecidas são geradas em várias larguras durante o build. Uploads são persistidos no Storage e sobrevivem a reinícios/redeploys. Antes de excluir uma imagem, retire suas referências nos produtos, banners ou aparência.

## Publicação na Hostinger (Node.js)

Esta versão possui banco, login e APIs: precisa de uma aplicação **Node.js**. GitHub Pages/exportação estática não executa esses recursos. O workflow desta branch verifica o código e não publica automaticamente na hospedagem estática.

1. Use a branch `feature/admin` para homologar e configure Node 22, diretório raiz do repositório e instalação `npm ci` incluindo dependências de desenvolvimento durante o build.
2. Configure todas as variáveis acima no ambiente da Hostinger. Use HTTPS e `APP_URL` correspondente ao domínio público.
3. Execute `npm run db:migrate` contra o banco de destino antes de iniciar esta versão. Na primeira configuração, execute `npm run db:seed`.
4. Build: `npm run build`. Inicialização: `npm start` (ou `npm start -- --port PORTA` conforme o painel). O Next respeita `PORT` fornecida pela plataforma. Não configure `out/` como diretório de publicação desta versão.
5. Teste login, upload, publicação de produto e orçamento no domínio de homologação antes de trocar o site público.

Migrações não rodam automaticamente no build para evitar alterações no banco durante verificações de PR. A `main` deve ser atualizada somente após a homologação e a configuração da hospedagem Node.

## Verificações

```bash
npm test
npm run check
```

Para testar as APIs contra uma implantação **isolada e descartável**, defina `TEST_BASE_URL`, `TEST_ADMIN_EMAIL`, `TEST_ADMIN_PASSWORD` e `TEST_ALLOW_WRITES=isolated`, então execute `node tests/api.integration.mjs`. O teste cria e remove registros e altera temporariamente o título do catálogo. `TEST_MEDIA=1` também exercita uploads e exclusão quando o Storage de teste estiver configurado. Não execute esse teste no site de produção.

Os testes cobrem validação de dados, bloqueio de URLs perigosas, origem das mutações e limites de payload. O build não precisa de credenciais reais: as rotas são dinâmicas e a conexão ao banco é criada sob demanda.

Sem banco acessível, o catálogo público mostra indisponibilidade com contato por WhatsApp. O painel apresenta erro e não simula gravações. Tentativas de login têm um limite global persistido de 20 em uma janela de 15 minutos; após excesso, aguarde a próxima janela. Uploads exigem sessão, origem válida, conteúdo de imagem decodificável e limites de tamanho/dimensões.

## Estrutura e APIs

- `prisma/schema.prisma` e `prisma/migrations`: modelos e evolução do banco.
- `src/server`: banco, autenticação, conteúdo público, validação HTTP e Storage.
- `src/lib/content.ts` e `src/lib/validation.ts`: tipos, conteúdo inicial e contratos de entrada.
- `src/components/admin`: interface administrativa.
- `src/features/home/components/storefront.tsx`: site, catálogo e orçamento.
- `GET /api/produtos`: produtos publicados com categoria.
- `GET /api/site`: conteúdo público (503 se o banco estiver indisponível).
- `POST /api/admin/login` e `/logout`: sessão administrativa.
- `/api/admin/products`, `/categories`, `/banners`: GET/POST; PATCH/DELETE em `/:id`.
- `/api/admin/settings`: GET/PUT; `/dashboard`: GET.
- `/api/admin/media`: GET/POST (multipart, campo `file`); DELETE em `/:id`.

Todas as rotas administrativas, exceto login, exigem sessão. As mutações validam `Origin` contra `APP_URL`. As respostas privadas usam `Cache-Control: no-store`.
