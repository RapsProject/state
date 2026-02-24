import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../../middlewares/auth";
import { validateBody, validateParams } from "../../middlewares/validation";
import * as subjectController from "../../controllers/subjectController";

const router = Router();

const idParamsSchema = z.object({ id: z.string().uuid() });

const createSubjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

const createTopicSchema = z.object({
  name: z.string().min(1),
});

router.use(authMiddleware);

router.get("/", subjectController.listSubjects);
router.post("/", validateBody(createSubjectSchema), subjectController.createSubject);
router.get("/:id/topics", validateParams(idParamsSchema), subjectController.listTopics);
router.post("/:id/topics", validateParams(idParamsSchema), validateBody(createTopicSchema), subjectController.createTopic);

export default router;
