import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../../middlewares/auth";
import { adminOnly } from "../../middlewares/adminOnly";
import { uploadImage } from "../../controllers/uploadController";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 }, // 100 KB hard limit at multer level
});

router.use(authMiddleware);
router.use(adminOnly);

router.post("/image", upload.single("file"), uploadImage);

export default router;
