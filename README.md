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

## Rodízio de vendedores e controle de orçamentos

Após atualizar o código, execute `npm run db:migrate` antes de iniciar a versão. A migração `20261030_seller_rotation` cria `Seller` e `Quote`, com RLS e acesso somente pelo servidor. Não é necessário apagar dados nem executar novamente o seed.

No painel, abra **Vendedores e horários** (`/admin/vendedores`). Cadastre nome, WhatsApp com DDI 55 e DDD e os horários de cada dia: entrada, saída para almoço, retorno e saída. O formulário começa com um exemplo de segunda a sexta de 08h às 18h, almoço 12h–13h: ajuste para a regra real de cada pessoa. Desative dias sem atendimento e desmarque intervalo nos dias sem almoço. Todos os horários são de Brasília (`America/Sao_Paulo`); turnos devem terminar no mesmo dia. Vendedores inativos permanecem no histórico e não recebem novos encaminhamentos.

Ao enviar a lista pelo catálogo, o servidor considera somente vendedores ativos e dentro do horário, excluindo almoço e folgas. Entre os disponíveis, escolhe quem está há mais tempo sem um novo encaminhamento. Um bloqueio transacional PostgreSQL serializa a escolha entre instâncias. Repetir a mesma solicitação não aumenta a contagem; o navegador reutiliza a referência da mesma lista na aba durante até 15 minutos. Se o vendedor anterior já estiver indisponível, a página pede uma nova tentativa sem encaminhar para o número fora do horário. Sem ninguém disponível, mostra um aviso e preserva a lista.

O site registra os itens, quantidades, nome e número do vendedor naquele momento, data, referência e mensagem antes de abrir o WhatsApp. **Encaminhado não é confirmação de envio, recebimento ou leitura**: o cliente ainda precisa enviar a mensagem no WhatsApp. Para confirmação automática seria necessária uma integração própria com a plataforma do WhatsApp. Os botões institucionais de contato geral continuam usando o número da loja; o rodízio é aplicado ao envio da lista de orçamento.

Em **Orçamentos** (`/admin/orcamentos`), consulte contagem por vendedor, histórico paginado, produtos e quantidades, filtre por vendedor e registre andamento/observações. Os estados são Encaminhado, Em atendimento, Concluído e Cancelado. A contagem total representa encaminhamentos registrados, inclusive os posteriormente cancelados.

Testes adicionais: `npm test` cobre horários/intervalos e validação. Em implantação descartável, `node tests/sales.integration.mjs` usa as mesmas variáveis `TEST_BASE_URL`, `TEST_ADMIN_EMAIL`, `TEST_ADMIN_PASSWORD`, `TEST_ALLOW_WRITES=isolated`; cria vendedores e orçamentos de teste. Nunca execute esse teste no banco real.

## CRM e conector WhatsApp (experimental)

Acesse `/crm` com a sessão administrativa do painel. A barra do painel contém **Central de atendimento**. Em **Acessos**, selecione um vendedor já cadastrado, informe e-mail e senha de pelo menos 12 caracteres. O vendedor entra em `/crm/login` e vê somente conversas atribuídas a ele. Na aba WhatsApp pode ajustar seu próprio número antes da primeira vinculação. Após criar a conta WhatsApp, a troca de número exige um novo cadastro de vendedor para preservar a origem do histórico. Trocar a senha ou desativar o acesso/vendedor invalida as sessões. O administrador vê todas as conversas e pode transferir o responsável. A transferência não troca o número de origem da conversa: respostas continuam saindo pelo número em que o cliente entrou.

Implantação inicial:

1. Faça backup do banco e execute `npm run db:migrate` e `npm run db:generate`. A migração `20261030_whatsapp_crm` adiciona tabelas do CRM com RLS. O servidor precisa das mesmas permissões administrativas PostgreSQL já utilizadas pelo painel.
2. No Supabase Storage, crie o bucket **privado** `crm-private`, limitado a 10 MB, com `image/webp` e `application/pdf`. Nunca marque esse bucket como público. Anexos são acessados somente pelas rotas autenticadas do CRM; não são reutilizados na biblioteca pública do site.
3. Configure no `.env` do site `CRM_STORAGE_BUCKET=crm-private` e um `CRM_CONNECTOR_SECRET` aleatório de pelo menos 32 caracteres. Exemplo de geração local: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Não envie esse segredo nem QR Codes ao GitHub ou a terceiros.
4. Copie `whatsapp-connector/.env.example` para `whatsapp-connector/.env`. Defina `CRM_APP_URL` com a URL do site acessível pelo conector e o mesmo `CRM_CONNECTOR_SECRET`. Em produção use HTTPS. Reinicie/recompile o site com as variáveis corretas.
5. No servidor com Docker e Compose, entre em `whatsapp-connector` e execute `docker compose -f compose.yml up -d --build`. O serviço não publica portas: busca tarefas e registra eventos por HTTPS no Next. Execute apenas uma instância deste conector com o volume de sessões. Não use GitHub Pages para esta aplicação.
6. Em `/crm`, abra **WhatsApp**, clique em Conectar e leia o QR Code com **um número de teste** pelo menu de aparelhos conectados do WhatsApp. O número deve coincidir com o cadastrado no vendedor; outro número é desconectado. Repita para cada vendedor somente após validar o piloto.

O conector usa `whatsapp-web.js` 1.34.7 com Chromium/LocalAuth. É uma integração **não oficial**, sujeita a mudanças do WhatsApp, desconexões e restrições da conta. Não existe garantia de compatibilidade ou de ausência de bloqueio. Cada conta abre um navegador: dimensione e monitore CPU/memória da VPS. Sessões e eventos pendentes ficam no volume Docker; proteja o volume e seus backups como credenciais e dados pessoais. Não é um serviço hospedado gratuito: a biblioteca não elimina custos de servidor/armazenamento.

Fluxo suportado: mensagens individuais recebidas após conectar, texto, imagens PNG/JPG/WebP e PDF até 10 MB. Grupos, chamadas, áudio/vídeo, campanhas em massa, importação automática do histórico antigo e espelhamento de respostas enviadas diretamente no aplicativo não estão implementados. Anexos recebidos em formatos não suportados ou com falha de armazenamento geram aviso no histórico para consulta no aplicativo. Não prometa histórico completo retroativo. O QR expira e o estado offline aparece quando o heartbeat do conector para.

O cliente recebe atendimento do vendedor associado ao número; o rodízio do catálogo continua encaminhando novos orçamentos aos vendedores disponíveis por horário. Quando a mensagem recebida contém a referência do orçamento e corresponde ao vendedor daquele orçamento, o CRM mostra os itens vinculados. O CRM guarda nome, telefone, etapa, responsável, notas internas, mensagens e status. As etapas são Novo contato, Em atendimento, Orçamento enviado, Concluído e Não convertido.

Mensagens saem por uma fila persistente. O envio recebe uma chave de idempotência e tarefas são reclamadas com bloqueio transacional. Uma tarefa que perdeu confirmação fica com estado **incerto**, sem reenvio automático: confira no aplicativo antes de compor outra mensagem. Enviado significa retorno do conector; entregue/lido dependem dos eventos efetivamente fornecidos pelo WhatsApp. Recebimentos são deduplicados por ID externo e o conector mantém eventos pendentes no disco quando o CRM está indisponível. Persistência exige que o volume seja mantido. O serviço não restaura automaticamente falhas de autenticação: use Conectar/novo QR.

Validação antes de usar números de vendas: vincular número de teste, enviar/receber texto, imagem e PDF, confirmar número errado, testar reinício/reconexão, validar transferência e isolamento entre dois vendedores. Os testes locais usam um conector e Storage simulados; não substituem essa homologação real. Teste API em banco **descartável** com `node tests/crm.integration.mjs`, variáveis `TEST_BASE_URL`, `TEST_ALLOW_WRITES=isolated`, `TEST_ADMIN_EMAIL`, `TEST_ADMIN_PASSWORD`, `TEST_CONNECTOR_SECRET`. Não execute contra o banco de produção.

Inclua mensagens e anexos na política de privacidade, defina retenção conforme a operação e controle o acesso a banco, bucket e backups. Desconectar uma conta não apaga o histórico. Exclusão automática de clientes, anexos sem uso e expurgo por prazo não estão implementados; planeje a rotina de retenção antes da operação contínua.
