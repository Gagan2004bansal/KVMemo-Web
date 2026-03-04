import { useRef, useState, useCallback } from 'react'

export const WS_URL = 'ws://localhost:8080/ws'

export function useWebSocket(url = WS_URL) {
  const ws      = useRef(null)
  const pending = useRef({})
  const idRef   = useRef(0)
  const [status, setStatus] = useState('disconnected')

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return
    setStatus('connecting')
    try {
      ws.current = new WebSocket(url)
      ws.current.onopen    = () => setStatus('connected')
      ws.current.onclose   = () => setStatus('disconnected')
      ws.current.onerror   = () => setStatus('disconnected')
      ws.current.onmessage = ({ data }) => {
        try {
          const d = JSON.parse(data)
          pending.current[d.id]?.(d)
          delete pending.current[d.id]
        } catch {}
      }
    } catch { setStatus('disconnected') }
  }, [url])

  const disconnect = useCallback(() => ws.current?.close(), [])

  const send = useCallback((cmd) => new Promise(resolve => {
    const id = ++idRef.current
    if (ws.current?.readyState === WebSocket.OPEN) {
      pending.current[id] = resolve
      ws.current.send(JSON.stringify({ id, ...cmd }))
      setTimeout(() => {
        if (pending.current[id]) { delete pending.current[id]; resolve({ id, error: 'Timeout' }) }
      }, 5000)
    } else {
      resolve({ id, error: "Not connected — type 'connect' first" })
    }
  }), [])

  return { status, connect, disconnect, send }
}
