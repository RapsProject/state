import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../../middlewares/auth";
import { validateBody, validateParams } from "../../middlewares/validation";
import * as tryoutController from "../../controllers/tryoutController";

const router = Router();

const idParamsSchema = z.object({ id: z.string().min(1) });

const createTryoutSchema = z.object({
  title: z.string().min(1),
  type: z.enum(["simulation", "practice"]).default("simulation"),
  durationMinutes: z.number().int().positive(),
  maxAttempts: z.number().int().positive().optional(),
  isPremium: z.boolean().default(false),
  isUltimate: z.boolean().default(false),
  isPublished: z.boolean().default(false),
});

const updateTryoutSchema = createTryoutSchema.partial().extend({
  isActive: z.boolean().optional(),
});

router.use(authMiddleware);

router.get("/", tryoutController.listTryouts);
router.get("/:id", validateParams(idParamsSchema), tryoutController.getTryout);
router.post("/", validateBody(createTryoutSchema), tryoutController.createTryout);
router.patch("/:id", validateParams(idParamsSchema), validateBody(updateTryoutSchema), tryoutController.updateTryout);

export default router;
