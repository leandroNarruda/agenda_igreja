@AGENTS.md

> **Antes de explorar o projeto:** leia este arquivo por completo. Ele contém toda a documentação necessária — stack, estrutura, regras de negócio, API e convenções. Só explore arquivos individuais se precisar de detalhes além do que está aqui.

# agenda-igreja — Documentação para Claude Code

## Visão geral

Agenda virtual de pregações para uso interno da igreja. Permite visualizar quem está pregando em cada culto (domingos, quartas e sábados). O front-end é Next.js e o backend é uma API REST dentro do próprio Next.js conectada ao MongoDB Atlas (Vercel).

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + TypeScript 5 (strict) |
| Estilos | Tailwind CSS v4 (via PostCSS) |
| Calendário | `react-calendar` v6 |
| Datas | `date-fns` v4 (locale `pt-BR`) |
| Banco de dados | MongoDB Atlas (Free Tier, cluster `atlas-amethyst-dog`) |
| Driver MongoDB | `mongodb` v7 (driver nativo, sem ORM) |
| Gerenciador de pacotes | pnpm |

## Estrutura de arquivos relevantes

```
agenda-igreja/
├── app/
│   ├── layout.tsx                    # Root layout, fontes Geist, metadata
│   ├── page.tsx                      # Página principal — só monta o <Calendar />
│   ├── globals.css                   # Tailwind + estilos customizados do react-calendar
│   └── api/
│       └── agenda/
│           ├── route.ts              # GET ?date=YYYY-MM-DD | POST { date, preacher, service }
│           └── month/
│               └── route.ts         # GET ?year=YYYY&month=MM → lista entradas do mês
├── components/
│   ├── Calendar.tsx                  # Calendário com fetch à API (pontos azuis + modal + handlers de CRUD)
│   └── DayModal.tsx                  # Modal com 3 modos: view / edit / confirm-delete
├── lib/
│   ├── agenda.ts                     # Tipos, constantes e funções utilitárias de data
│   └── mongodb.ts                    # Singleton de conexão com MongoDB Atlas
├── scripts/
│   └── seed.ts                       # Popula o banco com dados iniciais
└── .env.local                        # MONGODB_URI (não commitado)
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
  date: string;      // "YYYY-MM-DD" em horário local (não UTC)
  preacher: string;
  service: string;
}
```

> **Atenção:** as datas são geradas com `toLocalDateString()` exportada de `lib/agenda.ts`, não `toISOString()` (que retorna UTC e pode errar o dia dependendo do fuso).

## API Routes

### `GET /api/agenda?date=YYYY-MM-DD`
Retorna o documento da data ou `null` com status 404.

### `POST /api/agenda`
Body: `{ date, preacher, service }` — cria ou atualiza (upsert por `date`).

### `DELETE /api/agenda?date=YYYY-MM-DD`
Remove a entrada da data. Retorna 204 sem corpo.

### `GET /api/agenda/month?year=YYYY&month=MM`
Retorna array de entradas do mês — usado pelo calendário para exibir os pontos azuis.

## Banco de dados (MongoDB Atlas)

- **Cluster:** `atlas-amethyst-dog` (Free Tier, AWS us-east-1)
- **Database:** `agenda-igreja`
- **Collection:** `entries`
- **Índice único:** campo `date` (sem duplicatas por data)
- **Conexão:** singleton em `lib/mongodb.ts` via variável `MONGODB_URI` no `.env.local`

## Como popular o banco (seed)

```bash
pnpm dlx tsx --env-file=.env.local scripts/seed.ts
```

Insere/atualiza as 14 entradas iniciais de abril/maio 2026.

## Como o calendário busca dados

1. Ao mudar de mês → `GET /api/agenda/month` → atualiza o `Set` de datas com ponto azul
2. Ao clicar em um dia → `GET /api/agenda?date=...` → exibe o modal com loading enquanto aguarda
3. Após salvar → `Calendar.handleSave` adiciona a data ao `Set` (ponto azul aparece sem reload)
4. Após excluir → `Calendar.handleDelete` remove a data do `Set`

## DayModal — modos

O modal tem 3 modos internos (`useState<"view" | "edit" | "confirm-delete">`):

- **`view`**: leitura. Se sem pregador, exibe empty state + botão "Agendar pregador". Se com pregador, exibe dados + ícones ✏️ e 🗑️.
- **`edit`**: formulário com input do nome (pré-preenchido se editando). Serviço é calculado automaticamente via `SERVICE_LABELS[date.getDay()]`. Salva via `POST /api/agenda`.
- **`confirm-delete`**: card vermelho com confirmação. Exclui via `DELETE /api/agenda?date=...`.

> **Atenção:** a prop `entry` do DayModal aceita `AgendaEntry | null | undefined` — `undefined` = loading, `null` = sem pregador. Não usar `entry ?? undefined` ao passar do Calendar pois isso converte `null` em `undefined` e o modal fica preso no loading.

## Estilos do calendário

Os estilos do `react-calendar` são sobrescritos em `app/globals.css` via classes CSS nativas. As classes customizadas são:

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
- Não usar `toISOString()` para comparar datas locais — usar `toLocalDateString()` de `lib/agenda.ts`.
- Datas no banco sempre no formato `"YYYY-MM-DD"` local, nunca UTC.
