import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../../middlewares/auth";
import { validateBody, validateParams } from "../../middlewares/validation";
import * as subjectController from "../../controllers/subjectController";

const router = Router();

// Subject IDs in this project are plain strings (seeded from mockData),
// so we only validate that they are non-empty strings instead of UUID format.
const idParamsSchema = z.object({ id: z.string().min(1) });

const createSubjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

const createTopicSchema = z.object({
  name: z.string().min(1),
});

const subjectAndTopicParamsSchema = z.object({
  id: z.string().min(1),
  topicId: z.string().min(1),
});

router.use(authMiddleware);

router.get("/", subjectController.listSubjects);
router.post("/", validateBody(createSubjectSchema), subjectController.createSubject);
router.get("/:id/topics", validateParams(idParamsSchema), subjectController.listTopics);
router.post("/:id/topics", validateParams(idParamsSchema), validateBody(createTopicSchema), subjectController.createTopic);
router.delete("/:id", validateParams(idParamsSchema), subjectController.deleteSubject);
router.delete(
  "/:id/topics/:topicId",
  validateParams(subjectAndTopicParamsSchema),
  subjectController.deleteTopic,
);

export default router;
