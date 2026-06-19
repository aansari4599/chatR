import { Router, Response, NextFunction } from "express";
import multer from "multer";
import authMiddleware, { AuthRequest } from "../middleware/auth";
import { getCloudinary } from "../utils/cloudinary";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "../utils/validate";
import { AppError } from "../utils/errors";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError("File type not allowed. Accepted: images, video, audio, PDF, DOC", 400));
    }
  },
});

const router = Router();

router.post(
  "/",
  authMiddleware,
  (req: AuthRequest, res: Response, next: NextFunction) => {
    upload.single("file")(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  },
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError("No file provided", 400);
      }

      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      const result = await getCloudinary().uploader.upload(dataURI, {
        folder: "chatr",
        resource_type: "auto",
      });

      res.json({
        url: result.secure_url,
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
