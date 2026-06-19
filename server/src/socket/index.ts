import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import xss from "xss";
import Message from "../models/Message";
import { messageSchema } from "../utils/validate";
import { ZodError } from "zod";

interface AuthSocket extends Socket {
  userId?: string;
}

export const setupSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
    },
    maxHttpBufferSize: 1e7,
  });

  io.use((socket: AuthSocket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication required"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      socket.userId = decoded.userId;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket: AuthSocket) => {
    console.log(`User connected: ${socket.userId}`);

    socket.on("join", (conversationId: string) => {
      socket.join(conversationId);
    });

    socket.on(
      "send_message",
      async (data: { receiver: string; content?: string; files?: any[] }) => {
        if (!socket.userId) return;

        try {
          const validated = messageSchema.parse(data);
          const sanitizedContent = validated.content ? xss(validated.content.trim()) : undefined;

          const message = await Message.create({
            sender: socket.userId,
            receiver: validated.receiver,
            content: sanitizedContent,
            files: validated.files || [],
          });

          const populated = await message.populate([
            { path: "sender", select: "username avatar" },
            { path: "receiver", select: "username avatar" },
          ]);

          const room = [socket.userId, validated.receiver].sort().join("-");
          io.to(room).emit("new_message", populated);
        } catch (err) {
          if (err instanceof ZodError) {
            socket.emit("error", { message: "Invalid message data" });
          } else {
            console.error("Socket message error:", err);
            socket.emit("error", { message: "Failed to send message" });
          }
        }
      }
    );

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};
