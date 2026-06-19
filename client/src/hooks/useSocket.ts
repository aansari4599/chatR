import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'

export function useSocket() {
  const { token } = useAuth()
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!token) return

    const socket = io('/', {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [token])

  return socketRef
}
