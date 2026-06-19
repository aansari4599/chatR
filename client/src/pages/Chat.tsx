import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../hooks/useSocket'
import api from '../api/client'
import ChatSidebar from '../components/ChatSidebar'
import MessageList from '../components/MessageList'
import MessageInput from '../components/MessageInput'

interface User {
  _id: string
  username: string
  avatar?: string
}

interface FileData {
  url: string
  name: string
  type: string
  size: number
}

interface Message {
  _id: string
  sender: { _id: string; username: string; avatar?: string }
  receiver: { _id: string; username: string; avatar?: string }
  content?: string
  files?: FileData[]
  createdAt: string
}

interface Conversation {
  _id: string
  lastMessage: {
    sender: { _id: string; username: string }
    content?: string
    createdAt: string
  }
}

export default function Chat() {
  const { user } = useAuth()
  const socketRef = useSocket()
  const [users, setUsers] = useState<User[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  useEffect(() => {
    api.get('/auth/users').then((res) => setUsers(res.data))
    api.get('/messages/conversations/latest').then((res) => setConversations(res.data))
  }, [])

  useEffect(() => {
    if (!selectedUserId) return
    api.get(`/messages/${selectedUserId}?page=1&limit=50`).then((res) => setMessages(res.data.messages))
  }, [selectedUserId])

  useEffect(() => {
    const socket = socketRef.current
    if (!socket) return

    if (selectedUserId) {
      const room = [user?._id, selectedUserId].sort().join('-')
      socket.emit('join', room)
    }

    const handleNewMessage = (msg: Message) => {
      const isRelevant = msg.sender._id === selectedUserId || msg.receiver._id === selectedUserId
      if (isRelevant) {
        setMessages((prev) => [...prev, msg])
      }
      setConversations((prev) => {
        const filtered = prev.filter((c) => c._id !== (msg.sender._id === user?._id ? msg.receiver._id : msg.sender._id))
        return [
          {
            _id: msg.sender._id === user?._id ? msg.receiver._id : msg.sender._id,
            lastMessage: { sender: msg.sender, content: msg.content, createdAt: msg.createdAt },
          },
          ...filtered,
        ]
      })
    }

    socket.on('new_message', handleNewMessage)
    return () => { socket.off('new_message', handleNewMessage) }
  }, [selectedUserId, user?._id, socketRef])

  const handleSend = useCallback((content: string, files?: any[]) => {
    const socket = socketRef.current
    if (!socket || !selectedUserId) return
    socket.emit('send_message', { receiver: selectedUserId, content, files })
  }, [selectedUserId, socketRef])

  const selectedUser = users.find((u) => u._id === selectedUserId)

  return (
    <div className="flex h-screen bg-gray-900">
      <ChatSidebar
        users={users}
        conversations={conversations}
        selectedUserId={selectedUserId}
        onSelect={setSelectedUserId}
      />
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <div className="p-4 bg-gray-800 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {selectedUser.username[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-white font-semibold">{selectedUser.username}</h2>
                  <p className="text-green-400 text-xs">Online</p>
                </div>
              </div>
            </div>
            <MessageList messages={messages} />
            <MessageInput onSend={handleSend} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <svg className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-lg">Select a user to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
