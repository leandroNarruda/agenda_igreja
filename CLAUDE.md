@AGENTS.md

# agenda-igreja — Documentação para Claude Code

## Visão geral

Agenda virtual de pregações para uso interno da igreja. Permite visualizar quem está pregando em cada culto (domingos, quartas e sábados). Por enquanto é somente front-end com dados mockados; o backend/banco de dados será integrado futuramente.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + TypeScript 5 (strict) |
| Estilos | Tailwind CSS v4 (via PostCSS) |
| Calendário | `react-calendar` v6 |
| Datas | `date-fns` v4 (locale `pt-BR`) |
| Gerenciador de pacotes | pnpm |

## Estrutura de arquivos relevantes

```
agenda-igreja/
├── app/
│   ├── layout.tsx          # Root layout, fontes Geist, metadata
│   ├── page.tsx            # Página principal — só monta o <Calendar />
│   └── globals.css         # Tailwind + estilos customizados do react-calendar
├── components/
│   ├── Calendar.tsx        # Wrapper do react-calendar com lógica de negócio
│   └── DayModal.tsx        # Modal de exibição do pregador do dia
└── lib/
    └── agenda.ts           # Tipos, dados mockados e funções auxiliares
```

## Regras de negócio

- Apenas **domingos (0), quartas (3) e sábados (6)** são dias clicáveis — definidos em `ALLOWED_WEEKDAYS` em `lib/agenda.ts`.
- Cada dia pertence a um tipo de culto:
  - Domingo → "Culto do Dia do Senhor"
  - Quarta → "Culto de Oração"
  - Sábado → "Culto da Família"
- Um dia pode ter um pregador agendado ou não (modal exibe "Nenhum pregador agendado").
- Dias com pregador exibem um ponto azul no calendário.

## Tipo de dados

```ts
interface AgendaEntry {
  date: string;    // "YYYY-MM-DD" em horário local (não UTC)
  preacher: string;
  service: string;
}
```

> **Atenção:** as datas são geradas com `toLocalDateString()` local, não `toISOString()` (que retorna UTC e pode errar o dia dependendo do fuso).

## Como adicionar/editar pregadores (fase mock)

Edite o array `AGENDA_MOCK` em `lib/agenda.ts`. Só inclua datas que sejam dom/qua/sáb — outras datas são ignoradas silenciosamente pelo calendário.

## Integração futura com backend

Quando o backend for conectado, o ponto de troca é a função `getEntryByDate(date)` em `lib/agenda.ts`. Ela deverá ser substituída por uma chamada à API (ex: `fetch("/api/agenda?date=YYYY-MM-DD")`). O restante dos componentes não precisa mudar.

## Estilos do calendário

Os estilos do `react-calendar` são sobrescritos em `app/globals.css` via classes CSS nativas (não Tailwind direto, pois o react-calendar gera suas próprias classes). As classes customizadas são:

- `.tile-allowed` — dias dom/qua/sáb (clicáveis, negrito)
- `.tile-disabled` — demais dias (acinzentados, sem cursor)

## Comandos

```bash
pnpm dev      # Servidor de desenvolvimento em http://localhost:3000
pnpm build    # Build de produção (verifica TypeScript)
pnpm lint     # ESLint
```

## Convenções

- Componentes client-side levam `"use client"` no topo.
- Imports de alias usam `@/` (mapeado para a raiz do projeto).
- Sem comentários de código salvo quando o "porquê" não é óbvio.
- Não usar `toISOString()` para comparar datas locais — usar a função `toLocalDateString()` definida em `lib/agenda.ts`.
