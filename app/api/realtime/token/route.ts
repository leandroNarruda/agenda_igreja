import { NextResponse } from 'next/server'
import Ably from 'ably'

export const dynamic = 'force-dynamic'

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000 // 12h

export async function GET() {
  const key = process.env.ABLY_API_KEY
  if (!key) {
    return NextResponse.json(
      { error: 'ABLY_API_KEY não configurada' },
      { status: 500 }
    )
  }

  const rest = new Ably.Rest({ key })
  const tokenRequest = await rest.auth.createTokenRequest({
    ttl: TOKEN_TTL_MS,
    capability: {
      'agenda:updates': ['subscribe'],
    },
  })

  return NextResponse.json(tokenRequest)
}
