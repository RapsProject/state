import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../../middlewares/auth";
import { validateBody, validateParams } from "../../middlewares/validation";
import * as sessionController from "../../controllers/sessionController";

const router = Router();

const idParamsSchema = z.object({ id: z.string().min(1) });

const startSessionSchema = z.object({
  tryoutId: z.string().min(1),
});

const saveAnswerSchema = z.object({
  questionId: z.string().min(1),
  optionId: z.string().min(1).nullable(),
  isMarkedForReview: z.boolean().optional().default(false),
});

router.use(authMiddleware);

router.get("/", sessionController.listSessions);
router.post("/start", validateBody(startSessionSchema), sessionController.startSession);
router.get("/:id", validateParams(idParamsSchema), sessionController.getSession);
router.put("/:id/answer", validateParams(idParamsSchema), validateBody(saveAnswerSchema), sessionController.saveAnswer);
router.post("/:id/submit", validateParams(idParamsSchema), sessionController.submitSession);

export default router;
