import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../../middlewares/auth";
import { requirePremiumOrUltimate } from "../../middlewares/subscription";
import { validateQuery } from "../../middlewares/validation";
import * as leaderboardController from "../../controllers/leaderboardController";

const router = Router();

const leaderboardQuerySchema = z
  .object({
    filterType: z.enum(["OVERALL", "SUBJECT", "TRYOUT", "DREAM_MAJOR"]),
    subject: z.enum(["MATHEMATICS", "PHYSICS"]).optional(),
    examId: z.string().min(1).optional(),
    dreamMajor: z.string().min(1).optional(),
    limit: z
      .union([z.string().regex(/^\d+$/), z.number().int().positive()])
      .optional()
  })
  .superRefine((value, ctx) => {
    if (value.filterType === "SUBJECT" && !value.subject) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["subject"],
        message: "subject is required when filterType is SUBJECT"
      });
    }

    if (value.filterType === "TRYOUT" && !value.examId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["examId"],
        message: "examId is required when filterType is TRYOUT"
      });
    }

    if (value.filterType === "DREAM_MAJOR" && !value.dreamMajor) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dreamMajor"],
        message: "dreamMajor is required when filterType is DREAM_MAJOR"
      });
    }
  });

router.use(authMiddleware);
router.use(requirePremiumOrUltimate);

router.get("/dream-majors", leaderboardController.getDreamMajors);
router.get("/", validateQuery(leaderboardQuerySchema), leaderboardController.getLeaderboard);

export default router;

