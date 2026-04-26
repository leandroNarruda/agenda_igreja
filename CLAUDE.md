@AGENTS.md

# agenda-igreja — CLAUDE.md

## O que é este projeto
Agenda de pregações da Igreja do Santa Tereza. Calendário público mostra quem prega em cada culto. Admins autenticados gerenciam os agendamentos via `/admin`.

## Stack
| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + TypeScript 5 strict |
| Estilos | Tailwind CSS v4 (PostCSS) |
| Calendário | `react-calendar` v6 |
| Animações | `framer-motion` v12 |
| Datas | `date-fns` v4 — locale `pt-BR` |
| Banco | MongoDB Atlas — driver nativo `mongodb` v7, sem ORM |
| Auth | NextAuth.js v5 beta — Credentials provider + JWT |
| Senhas | `bcryptjs` |

## Comandos
```bash
pnpm dev      # http://localhost:3000
pnpm build    # build de produção + checagem TypeScript
pnpm lint     # ESLint

# Criar admin no banco
pnpm dlx tsx --env-file=.env.local scripts/seed-admin.ts <email> "<nome>" <senha>

# Popular entradas iniciais
pnpm dlx tsx --env-file=.env.local scripts/seed.ts
```

## Arquitetura — mapa de arquivos
```
auth.ts                          # Configuração NextAuth (Credentials provider)
proxy.ts                         # Protege /admin/** — redireciona para /login
app/
  layout.tsx                     # Root layout + <Providers> (SessionProvider)
  providers.tsx                  # "use client" wrapper do SessionProvider
  page.tsx                       # Calendário público (só leitura)
  login/page.tsx                 # Tela de login (email + senha)
  admin/page.tsx                 # Calendário admin — mesmo layout + isAdmin prop
  api/
    agenda/route.ts              # GET | POST* | DELETE* (*requer sessão)
    agenda/month/route.ts        # GET público — lista entradas do mês
    auth/[...nextauth]/route.ts  # Handlers NextAuth
lib/
  agenda.ts                      # Tipos, constantes, utilitários de data
  mongodb.ts                     # Singleton MongoClient
  users.ts                       # findUserByEmail, createUser
components/
  Calendar.tsx                   # Calendário + lista mensal + modal
  DayModal.tsx                   # Modal: view | edit | confirm-delete
scripts/
  seed.ts                        # Dados iniciais de pregações
  seed-admin.ts                  # Cria usuário admin no banco
```

## Banco de dados (MongoDB Atlas)
- **Cluster:** `atlas-amethyst-dog` — database `agenda-igreja`
- **Collection `entries`:** `{ date, preacher, service }` — índice único em `date`
- **Collection `users`:** `{ email, name, passwordHash, createdAt }` — índice único em `email`
- Conexão via singleton em `lib/mongodb.ts` — variável `MONGODB_URI` no `.env.local`

## Regras de negócio críticas
- Apenas **domingos (0), quartas (3) e sábados (6)** são clicáveis — `ALLOWED_WEEKDAYS` em `lib/agenda.ts`
- **Nunca usar `toISOString()`** para datas — usar `toLocalDateString()` de `lib/agenda.ts` (evita erro de fuso UTC)
- Datas no banco sempre `"YYYY-MM-DD"` em horário local
- `service` é calculado automaticamente por `SERVICE_LABELS[date.getDay()]` mas pode ser editado manualmente
- `POST` e `DELETE` em `/api/agenda` exigem sessão autenticada — retornam 401 sem ela

## Autenticação
- Sessão gerenciada por NextAuth v5 com estratégia `jwt`
- `proxy.ts` (Next.js 16 renomeou `middleware.ts`) protege `/admin/**`
- `auth()` importado de `@/auth` para verificar sessão em route handlers
- Página de login: `/login` — redireciona para `/admin` após sucesso

## Convenções
- Componentes client-side: `"use client"` no topo
- Imports de alias: `@/` (raiz do projeto)
- Sem comentários salvo quando o "porquê" não é óbvio
- Cores do design system (inline styles — Tailwind não cobre tokens customizados):
  - Fundo escuro: `#0e0718` / `#1a0d22`
  - Texto principal: `#e8f9a2`
  - Roxo primário: `#7e5686`
  - Laranja destaque: `#f8a13f`
  - Texto secundário: `rgba(165,170,217,0.6)`
  - Vermelho destrutivo: `#ba3c3d`

## Variáveis de ambiente (.env.local)
```
MONGODB_URI=      # string de conexão Atlas
AUTH_SECRET=      # string aleatória ≥32 chars (openssl rand -base64 32)
NEXTAUTH_URL=     # http://localhost:3000 (dev) ou URL de produção
```
