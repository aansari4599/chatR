# ChatR

A real-time chat application with media sharing, built with React, Node.js, MongoDB, and Socket.io.

## Features

- **User authentication** — Register/login with JWT-based auth
- **Real-time messaging** — Instant message delivery via WebSocket (Socket.io)
- **Media sharing** — Upload and share images, video, audio, PDFs, and documents (powered by Cloudinary)
- **Conversation history** — Paginated message history with infinite scroll support
- **User discovery** — See all registered users and start conversations
- **Responsive UI** — Dark-themed chat interface built with Tailwind CSS
- **Production-ready** — Helmet security headers, rate limiting, input validation, XSS sanitization, graceful shutdown

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB + Mongoose |
| Real-time | Socket.io |
| Auth | JWT + bcrypt |
| File Storage | Cloudinary |
| Validation | Zod |
| Deployment | Render (backend), Vercel (frontend) |

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB Atlas account (free tier)
- Cloudinary account (free tier)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd chatr

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your credentials:

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 3001) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Random 64-char hex string |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From Cloudinary dashboard |

### 3. Run locally

```bash
# Terminal 1 — backend
cd server
npm run dev

# Terminal 2 — frontend
cd client
npm run dev
```

Open http://localhost:5173

## Deployment

### Backend — Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service → connect repo
3. Set:
   - **Build**: `cd server && npm install && npm run build`
   - **Start**: `cd server && npm start`
   - **Plan**: Free
4. Add all env vars from `.env`
5. Set `CLIENT_URL` to your Vercel URL after frontend deploy

### Frontend — Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → import repo
2. Set:
   - **Root Directory**: `client`
   - **Framework**: Vite
3. Add `VITE_API_URL` env var pointing to your Render URL
4. Deploy

## Project Structure

```
chatr/
├── server/
│   ├── src/
│   │   ├── index.ts               # Express + Socket.io server
│   │   ├── config/db.ts           # MongoDB connection
│   │   ├── middleware/auth.ts     # JWT auth middleware
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   └── Message.ts
│   │   ├── routes/
│   │   │   ├── auth.ts            # Register, login, profile
│   │   │   ├── messages.ts        # Message history, conversations
│   │   │   └── upload.ts          # File upload → Cloudinary
│   │   ├── socket/index.ts        # WebSocket event handlers
│   │   └── utils/
│   │       ├── env.ts             # Env validation
│   │       ├── errors.ts          # Error handling
│   │       ├── validate.ts        # Zod schemas
│   │       └── cloudinary.ts      # Cloudinary config
│   ├── render.yaml
│   └── package.json
├── client/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── context/AuthContext.tsx
│   │   ├── hooks/useSocket.ts
│   │   ├── api/client.ts
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── Chat.tsx
│   │   └── components/
│   │       ├── ChatSidebar.tsx
│   │       ├── MessageList.tsx
│   │       └── MessageInput.tsx
│   ├── vercel.json
│   └── package.json
└── README.md
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/auth/users` | Yes | List all users |
| GET | `/api/messages/:userId` | Yes | Get message history (paginated) |
| GET | `/api/messages/conversations/latest` | Yes | Get latest conversations |
| POST | `/api/upload` | Yes | Upload file to Cloudinary |
| GET | `/api/health` | No | Health check |
