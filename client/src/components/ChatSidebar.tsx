import { useAuth } from '../context/AuthContext'

interface User {
  _id: string
  username: string
  avatar?: string
  email?: string
}

interface Conversation {
  _id: string
  lastMessage: {
    sender: { _id: string; username: string }
    content?: string
    createdAt: string
  }
}

interface Props {
  users: User[]
  conversations: Conversation[]
  selectedUserId: string | null
  onSelect: (userId: string) => void
}

export default function ChatSidebar({ users, conversations, selectedUserId, onSelect }: Props) {
  const { user, logout } = useAuth()

  const getLastMessage = (userId: string) => {
    const conv = conversations.find((c) => c._id === userId)
    if (!conv) return null
    const isFromMe = conv.lastMessage.sender._id === user?._id
    return {
      text: conv.lastMessage.content ? (isFromMe ? 'You: ' : '') + conv.lastMessage.content : '📎 Media',
      time: conv.lastMessage.createdAt,
    }
  }

  return (
    <div className="w-80 bg-gray-800 flex flex-col border-r border-gray-700">
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">ChatR</h2>
        <button onClick={logout} className="text-sm text-red-400 hover:text-red-300 transition">Logout</button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {users.length === 0 && (
          <p className="text-gray-500 text-center mt-8">No users found</p>
        )}
        {users.map((u) => {
          const lastMsg = getLastMessage(u._id)
          return (
            <button
              key={u._id}
              onClick={() => onSelect(u._id)}
              className={`w-full p-4 flex items-center gap-3 hover:bg-gray-700 transition text-left ${
                selectedUserId === u._id ? 'bg-gray-700' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                {u.username[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{u.username}</p>
                {lastMsg && (
                  <p className="text-gray-400 text-sm truncate">{lastMsg.text}</p>
                )}
              </div>
              {lastMsg && (
                <p className="text-gray-500 text-xs shrink-0">
                  {new Date(lastMsg.time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </p>
              )}
            </button>
          )
        })}
      </div>
      <div className="p-4 border-t border-gray-700 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-bold">
          {user?.username?.[0]?.toUpperCase() || '?'}
        </div>
        <span className="text-white text-sm truncate">{user?.username}</span>
      </div>
    </div>
  )
}
