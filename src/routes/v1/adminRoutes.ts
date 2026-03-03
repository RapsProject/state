import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth";
import { adminOnly } from "../../middlewares/adminOnly";
import * as adminController from "../../controllers/adminController";

const router = Router();

router.use(authMiddleware);
router.use(adminOnly);

router.get("/users", adminController.listUsers);
router.get("/users/summary", adminController.getUsersSummary);

export default router;
