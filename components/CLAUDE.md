# components/ — Documentação

## Calendar.tsx

### Responsabilidades
- Renderiza o `react-calendar` com estilos customizados
- Busca entradas do mês via `GET /api/agenda/month` ao montar e ao trocar de mês
- Abre `DayModal` ao clicar em um dia permitido ou em um item da lista
- Lista todos os pregadores do mês abaixo do calendário (ordenados por data)
- Mantém dois estados sincronizados: `scheduledDates` (Set para os pontos laranjas) e `monthEntries` (array para a lista)

### Props
```ts
isAdmin?: boolean  // padrão false — habilita botões de edição no modal
```

### Fluxo de dados
1. `activeStartDate` muda → fetch `/api/agenda/month` → atualiza `scheduledDates` + `monthEntries`
2. Clique num dia → fetch `/api/agenda?date=...` → abre modal com `entry` (undefined=loading, null=vazio, AgendaEntry=preenchido)
3. Clique num item da lista → abre modal diretamente com `entry` já disponível (sem fetch)
4. `handleSave` → atualiza `monthEntries` e `scheduledDates` sem reload
5. `handleDelete` → remove de `monthEntries` e `scheduledDates` sem reload

### Dias permitidos
Apenas dom/qua/sáb são clicáveis — `tileDisabled` bloqueia os demais. Dias fora do mês ativo também são bloqueados.

---

## DayModal.tsx

### Modos
```ts
type Mode = "view" | "edit" | "confirm-delete"
```

### Props
```ts
date: Date | null
entry: AgendaEntry | null | undefined  // undefined=loading | null=sem pregador | AgendaEntry=preenchido
isAdmin?: boolean
onClose: () => void
onSave: (entry: AgendaEntry) => void
onDelete: (date: string) => void
```

### Regra importante — prop `entry`
- `undefined` → skeleton de loading
- `null` → empty state ("Nenhum pregador agendado")
- `AgendaEntry` → exibe pregador
- **Nunca passar `entry ?? undefined`** — isso converte `null` em `undefined` e o modal fica preso no loading

### Comportamento por modo
| Modo | Visível para | O que faz |
|---|---|---|
| `view` | todos | Mostra pregador ou empty state. Admin vê botões Editar/Excluir |
| `edit` | admin | Formulário: nome do pregador + tipo de culto (pré-preenchido, editável). Salva via `POST /api/agenda` |
| `confirm-delete` | admin | Card vermelho de confirmação. Deleta via `DELETE /api/agenda?date=...` |

### Notas de implementação
- Modal sempre centralizado (não bottom sheet) — `items-center` em todos os breakpoints
- Animação de entrada: `scale` + `opacity` via framer-motion
- `serviceValue` é inicializado com `entry.service` (edição) ou `SERVICE_LABELS[day]` (novo) e pode ser editado livremente
- `onSave` recebe `saved` direto da API (não sobrescrever com valor local)
- Escape: volta para `view` se em outro modo, fecha se já em `view`
