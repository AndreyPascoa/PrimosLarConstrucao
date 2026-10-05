# Primos Lar e Construção

Site institucional em Next.js, React, TypeScript e Tailwind CSS, com exportação estática para GitHub Pages e pedidos de orçamento via WhatsApp.

## Desenvolvimento

```bash
npm ci
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

O build gera `out/`. O workflow `.github/workflows/deploy.yml` publica ao receber commits na `main`; pull requests executam somente as verificações. Imagens permanecem sem otimização automática para suportar exportação estática; comprima os arquivos antes de adicioná-los.
