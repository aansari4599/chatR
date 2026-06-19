import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import authMiddleware, { AuthRequest } from "../middleware/auth";
import { registerSchema, loginSchema } from "../utils/validate";
import { AppError } from "../utils/errors";
import rateLimit from "express-rate-limit";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many attempts, try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password } = registerSchema.parse(req.body);

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      throw new AppError("User already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ username, email, password: hashedPassword });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: "7d" });

    res.status(201).json({
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", authLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError("Invalid credentials", 401);
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: "7d" });

    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email, avatar: user.avatar },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) throw new AppError("User not found", 404);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.get("/users", authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({ _id: { $ne: req.userId } }).select("username email avatar");
    res.json(users);
  } catch (error) {
    next(error);
  }
});

export default router;
