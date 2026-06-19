import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const messageSchema = z.object({
  receiver: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid receiver ID"),
  content: z.string().max(5000, "Message too long").optional(),
  files: z
    .array(
      z.object({
        url: z.string().url(),
        name: z.string().max(255),
        type: z.string().max(100),
        size: z.number().max(10 * 1024 * 1024, "File too large"),
      })
    )
    .max(10, "Too many files")
    .optional(),
});

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/webm",
  "audio/mpeg",
  "audio/ogg",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
