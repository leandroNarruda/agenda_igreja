import Ably from 'ably'

let ablyRest: Ably.Rest | null = null

function getAblyRest(): Ably.Rest {
  if (!ablyRest) {
    const key = process.env.ABLY_API_KEY
    if (!key) throw new Error('ABLY_API_KEY não configurada')
    ablyRest = new Ably.Rest({ key })
  }
  return ablyRest
}

export interface AgendaUpdatePayload {
  date: string        // "YYYY-MM-DD"
  action: 'upsert' | 'delete'
}

/**
 * Publica evento de atualização da agenda para todos os clientes conectados.
 * Chamado após POST/DELETE em /api/agenda (non-blocking).
 */
export async function publishAgendaUpdated(payload: AgendaUpdatePayload): Promise<void> {
  try {
    const client = getAblyRest()
    const channel = client.channels.get('agenda:updates')
    await channel.publish('entry_changed', payload)
  } catch (err) {
    console.error('[realtime] Erro ao publicar atualização da agenda:', err)
  }
}
