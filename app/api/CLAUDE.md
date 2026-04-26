# app/api/ — Documentação

## Rotas disponíveis

### GET /api/agenda?date=YYYY-MM-DD
- Retorna `AgendaEntry` ou `null` com status 404
- Pública — sem autenticação

### POST /api/agenda
- Body: `{ date, preacher, service }`
- Upsert por `date` (cria ou atualiza)
- **Requer sessão** — retorna 401 sem `auth()`
- Retorna o body salvo com status 201

### DELETE /api/agenda?date=YYYY-MM-DD
- Remove a entrada da data
- **Requer sessão** — retorna 401 sem `auth()`
- Retorna 204 sem corpo

### GET /api/agenda/month?year=YYYY&month=MM
- Retorna `AgendaEntry[]` do mês (match por prefixo regex `^YYYY-MM`)
- Pública — sem autenticação

### /api/auth/[...nextauth]
- Handler automático do NextAuth — não editar
- Exporta `{ GET, POST }` de `@/auth`

## Como proteger uma rota
```ts
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return new NextResponse(null, { status: 401 });
  // ...
}
```

## Coleções MongoDB usadas
- `entries` — via `lib/mongodb.ts` + `client.db("agenda-igreja").collection("entries")`
- `users` — via `lib/users.ts` (findUserByEmail, createUser)
