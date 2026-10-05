# Primos Lar e Construção

Site institucional em Next.js, React, TypeScript e Tailwind CSS, com exportação estática para GitHub Pages e pedidos de orçamento via WhatsApp.

## Desenvolvimento

```bash
nvm use
npm ci
npm run images:optimize
npm run dev
```

## Estrutura

- `src/app`: rotas, layout raiz, metadados e estilos globais.
- `src/components/layout`: cabeçalho, rodapé e contato flutuante compartilhados.
- `src/features/home/components`: seções da página inicial; componentes interativos usam `use client`.
- `src/features/home/data`: categorias e conteúdo da página, separados da apresentação.
- `src/config/site.ts`: informações públicas da empresa e navegação.
- `src/lib/whatsapp.ts`: geração de links com mensagens codificadas.
- `public`: imagens e outros arquivos estáticos.

Edite telefone, endereço e horários em `src/config/site.ts`. O horário de sábado foi consolidado em 8h00 às 12h30, conforme a seção de contato original; confirmar com a loja antes do merge.

## Verificação e publicação

```bash
npm run check
```

O build gera `out/`. O workflow `.github/workflows/deploy.yml` publica ao receber commits na `main`; pull requests executam somente as verificações. As imagens usam WebP responsivo pré-gerado em `public/optimized`, compatível com GitHub Pages. O build gera essas versões automaticamente. Para atualizar as imagens durante o desenvolvimento, execute `npm run images:optimize` após alterar os PNGs originais. O loader em `src/lib/image-loader.ts` e o script compartilham as mesmas larguras. Apenas o primeiro banner é pré-carregado; as imagens das demais seções usam carregamento adiado.

## Hostinger

Use Node.js 22 e o comando de build `npm run build`. A versão está indicada em `package.json` e `.nvmrc`, e o CI usa a mesma versão. O build usa Webpack explicitamente para evitar depender do comportamento do Turbopack no ambiente de hospedagem. O PostCSS continua configurado para Tailwind CSS 4.

O projeto gera arquivos estáticos em `out/`; publique esse diretório como site estático. `next start` não serve projetos com `output: "export"`. Se o painel exigir uma aplicação Node.js com servidor, será necessário configurar esse modo separadamente.
