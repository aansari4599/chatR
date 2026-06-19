import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed",
      details: err.issues.map((e) => ({ path: e.path.join("."), message: e.message })),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }

  if ((err as any).code === 11000) {
    return res.status(409).json({ error: "Resource already exists" });
  }

  if (err.name === "MulterError") {
    return res.status(400).json({ error: err.message });
  }

  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
};

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
};
