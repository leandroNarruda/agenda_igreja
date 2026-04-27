'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getAblyClient } from '@/lib/realtime/ablyClient'
import type { AgendaUpdatePayload } from '@/lib/realtime/publish'

/**
 * Assina o canal agenda:updates e invalida as queries afetadas no React Query.
 * Deve ser montado uma vez na árvore (ex.: Calendar.tsx).
 */
export function useAgendaRealtime() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const ably = getAblyClient()
    const channel = ably.channels.get('agenda:updates')

    const onEntryChanged = (message: { data?: unknown }) => {
      const payload = message.data as AgendaUpdatePayload | undefined
      if (!payload?.date) return

      const [year, month] = payload.date.split('-').map(Number)
      queryClient.invalidateQueries({ queryKey: ['agenda', 'month', year, month] })
      queryClient.invalidateQueries({ queryKey: ['agenda', 'day', payload.date] })
    }

    channel.subscribe('entry_changed', onEntryChanged)

    return () => {
      channel.unsubscribe('entry_changed', onEntryChanged)
    }
  }, [queryClient])
}
