import { useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

interface FileData {
  url: string
  name: string
  type: string
}

interface Message {
  _id: string
  sender: { _id: string; username: string; avatar?: string }
  content?: string
  files?: FileData[]
  createdAt: string
}

interface Props {
  messages: Message[]
}

export default function MessageList({ messages }: Props) {
  const { user } = useAuth()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const isImage = (type: string) => type.startsWith('image/')
  const isVideo = (type: string) => type.startsWith('video/')

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
      {messages.map((msg) => {
        const isMine = msg.sender._id === user?._id
        return (
          <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] ${isMine ? 'bg-blue-600' : 'bg-gray-700'} rounded-2xl px-4 py-2`}>
              {!isMine && (
                <p className="text-xs text-blue-300 mb-1">{msg.sender.username}</p>
              )}
              {msg.content && <p className="text-white">{msg.content}</p>}
              {msg.files?.map((file, i) => (
                <div key={i} className="mt-2">
                  {isImage(file.type) ? (
                    <img src={file.url} alt={file.name} className="max-w-full rounded-lg" loading="lazy" />
                  ) : isVideo(file.type) ? (
                    <video controls src={file.url} className="max-w-full rounded-lg" />
                  ) : (
                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-300 underline text-sm flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      {file.name}
                    </a>
                  )}
                </div>
              ))}
              <p className="text-xs text-gray-400 mt-1 text-right">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
