import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../../middlewares/auth";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../middlewares/validation";
import * as questionController from "../../controllers/questionController";

const router = Router();

const idParamsSchema = z.object({ id: z.string().min(1) });

const listQuerySchema = z.object({
  tryoutId: z.string().min(1).optional(),
  subjectId: z.string().min(1).optional(),
  topicId: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  includeInactive: z
    .string()
    .optional()
    .transform((v) => v === "true" || v === "1"),
});

const optionSchema = z.object({
  sequenceNumber: z.number().int().positive(),
  text: z.string().min(1),
  imageUrl: z.string().url().optional(),
  isCorrect: z.boolean().default(false),
});

// 1. Buat Base Schema (TANPA superRefine)
const baseQuestionSchema = z.object({
  tryoutId: z.string().min(1),
  subjectId: z.string().min(1),
  topicId: z.string().min(1).optional(),
  sequenceNumber: z.number().int().positive(),
  text: z.string().min(1),
  imageUrl: z.string().url().optional(),
  explanation: z.string().optional(),
  options: z.array(optionSchema).min(2),
});

// 2. Gunakan Base Schema untuk Create (tambahkan superRefine di sini)
const createQuestionSchema = baseQuestionSchema.superRefine((val, ctx) => {
  if (!val.options.some((o) => o.isCorrect)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["options"],
      message: "At least one option must be marked as correct",
    });
  }
});

// 3. Gunakan Base Schema untuk Update (sekarang aman pakai .partial)
const updateQuestionSchema = baseQuestionSchema
  .omit({ tryoutId: true })
  .partial()
  .extend({
    isActive: z.boolean().optional(),
    options: z.array(optionSchema).min(2).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.options && !val.options.some((o) => o.isCorrect)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["options"],
        message: "At least one option must be marked as correct",
      });
    }
  });

router.use(authMiddleware);

router.get(
  "/",
  validateQuery(listQuerySchema),
  questionController.listQuestions,
);
router.get(
  "/:id",
  validateParams(idParamsSchema),
  questionController.getQuestion,
);
router.post(
  "/",
  validateBody(createQuestionSchema),
  questionController.createQuestion,
);
router.put(
  "/:id",
  validateParams(idParamsSchema),
  validateBody(updateQuestionSchema),
  questionController.updateQuestion,
);
router.delete(
  "/:id",
  validateParams(idParamsSchema),
  questionController.deleteQuestion,
);

export default router;
