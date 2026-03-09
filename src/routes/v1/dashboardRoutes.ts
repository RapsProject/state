import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth";
import * as dashboardController from "../../controllers/dashboardController";

const router = Router();

router.use(authMiddleware);

router.get("/stats", dashboardController.getStats);

export default router;
