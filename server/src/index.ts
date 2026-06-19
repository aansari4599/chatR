import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import dotenv from "dotenv";
import connectDB from "./config/db";
import { setupSocket } from "./socket";
import authRoutes from "./routes/auth";
import messageRoutes from "./routes/messages";
import uploadRoutes from "./routes/upload";
import { errorHandler, notFoundHandler } from "./utils/errors";
import { validateEnv } from "./utils/env";

dotenv.config();
validateEnv();

const app = express();
const server = createServer(app);

app.use(helmet());
app.use(compression());
app.use(morgan("short"));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowed = [
      process.env.CLIENT_URL,
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
    ].filter(Boolean);
    if (allowed.some((o) => origin.startsWith(o as string)) || origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }
    callback(null, true);
  },
  credentials: true,
}));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: "Too many requests" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

app.use(express.json({ limit: "1mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(notFoundHandler);
app.use(errorHandler);

setupSocket(server);

const PORT = process.env.PORT || 3001;

const start = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();

const gracefulShutdown = (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
  setTimeout(() => {
    console.error("Forced shutdown");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
