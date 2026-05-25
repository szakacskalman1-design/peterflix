import { useEffect, useRef, useCallback } from 'react'

export type WsPixelMsg = { type: 'pixel'; x: number; y: number; color: string }
export type WsResetMsg = { type: 'reset' }
export type WsMsg      = WsPixelMsg | WsResetMsg

interface Handlers {
  onPixel: (msg: WsPixelMsg) => void
  onReset: () => void
  onStatus?: (s: 'connected' | 'disconnected') => void
}

/**
 * WebSocket URL meghatározása.
 *
 * Fejlesztésben (Vite dev server):
 *   - A frontend bármilyen hálózati IP-ről elérhető (npx vite --host)
 *   - A Vite proxy a /ws útvonalat továbbítja ws://localhost:3001-re
 *   - Így mobilról is működik: ws://192.168.x.x:5173/ws → ws://localhost:3001
 *
 * Productionban:
 *   - VITE_WS_URL env var (pl. wss://api.peterflix.hu)
 *   - Ha nincs, VITE_API_URL-ből vezeti le
 */
function getWsUrl(): string {
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'

  // Explicit WS URL (production)
  const wsUrl = (import.meta as { env?: { VITE_WS_URL?: string } }).env?.VITE_WS_URL
  if (wsUrl) return wsUrl

  // VITE_API_URL-ből levezetés (production, ha nincs VITE_WS_URL)
  const apiUrl = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL
  if (apiUrl && !apiUrl.includes('localhost') && !apiUrl.includes('127.0.0.1')) {
    return apiUrl
      .replace(/\/api\/?$/, '')
      .replace(/^https:\/\//, 'wss://')
      .replace(/^http:\/\//, 'ws://')
  }

  // Dev mód: mindig az aktuális host:port + /ws útvonal
  // A Vite proxy ezt ws://localhost:3001-re proxyzza
  return `${proto}//${window.location.host}/ws`
}

export function usePixelSocket({ onPixel, onReset, onStatus }: Handlers) {
  const handlersRef = useRef({ onPixel, onReset, onStatus })
  handlersRef.current = { onPixel, onReset, onStatus }

  const wsRef     = useRef<WebSocket | null>(null)
  const retryRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const unmounted = useRef(false)

  const connect = useCallback(() => {
    if (unmounted.current) return

    const url = getWsUrl()
    let ws: WebSocket
    try {
      ws = new WebSocket(url)
    } catch {
      return
    }
    wsRef.current = ws

    ws.onopen = () => {
      handlersRef.current.onStatus?.('connected')
    }

    ws.onmessage = e => {
      try {
        const msg = JSON.parse(e.data as string) as WsMsg
        if (msg.type === 'pixel') handlersRef.current.onPixel(msg)
        if (msg.type === 'reset') handlersRef.current.onReset()
      } catch {}
    }

    ws.onclose = () => {
      handlersRef.current.onStatus?.('disconnected')
      if (!unmounted.current) {
        retryRef.current = setTimeout(connect, 3000)
      }
    }

    ws.onerror = () => ws.close()
  }, [])

  useEffect(() => {
    unmounted.current = false
    connect()
    return () => {
      unmounted.current = true
      if (retryRef.current) clearTimeout(retryRef.current)
      wsRef.current?.close()
    }
  }, [connect])
}
