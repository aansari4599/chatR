import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || ''

export function useSocket() {
  const { token } = useAuth()
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!token) return

    const url = API_URL || window.location.origin
    const socket = io(url, {
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
