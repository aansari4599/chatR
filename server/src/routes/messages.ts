import { Router, Response, NextFunction } from "express";
import Message from "../models/Message";
import authMiddleware, { AuthRequest } from "../middleware/auth";
import { AppError } from "../utils/errors";

const router = Router();

router.get("/:userId", authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId as string;
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError("Invalid user ID", 400);
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { sender: req.userId, receiver: userId },
        { sender: userId, receiver: req.userId },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "username avatar")
      .populate("receiver", "username avatar");

    const total = await Message.countDocuments({
      $or: [
        { sender: req.userId, receiver: userId },
        { sender: userId, receiver: req.userId },
      ],
    });

    res.json({ messages: messages.reverse(), total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
});

router.get("/conversations/latest", authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: req.userId }, { receiver: req.userId }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", req.userId] },
              "$receiver",
              "$sender",
            ],
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
      { $sort: { "lastMessage.createdAt": -1 } },
    ]);

    await Message.populate(messages, {
      path: "lastMessage.sender lastMessage.receiver _id",
      select: "username avatar email",
    });

    res.json(messages);
  } catch (error) {
    next(error);
  }
});

export default router;
