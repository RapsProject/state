import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../../middlewares/auth";
import { validateBody } from "../../middlewares/validation";
import * as profileController from "../../controllers/profileController";

const router = Router();

const updateProfileSchema = z.object({
  phoneNumber: z.string().optional(),
  dreamMajor: z.string().optional(),
  fullName: z.string().optional(),
  schoolOrigin: z.string().optional(),
});

router.use(authMiddleware);

router.get("/me", profileController.getMe);
router.put("/me", validateBody(updateProfileSchema), profileController.updateMe);

export default router;

