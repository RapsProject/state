import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../../middlewares/auth";
import { validateBody } from "../../middlewares/validation";
import * as authController from "../../controllers/authController";

const router = Router();

const syncBodySchema = z.object({
  email: z.string().email().optional(),
  full_name: z.string().optional(),
  school_origin: z.string().optional(),
});

router.use(authMiddleware);

router.post("/sync", validateBody(syncBodySchema), authController.syncProfile);
router.get("/me", authController.getMe);

export default router;
