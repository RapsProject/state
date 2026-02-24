import { Router } from "express";
import authRoutes from "./v1/authRoutes";
import subjectRoutes from "./v1/subjectRoutes";
import tryoutRoutes from "./v1/tryoutRoutes";
import questionRoutes from "./v1/questionRoutes";
import sessionRoutes from "./v1/sessionRoutes";
import subscriptionRoutes from "./v1/subscriptionRoutes";
import dashboardRoutes from "./v1/dashboardRoutes";
import profileRoutes from "./v1/profileRoutes";

const router = Router();

router.use("/api/v1/auth", authRoutes);
router.use("/api/v1/subjects", subjectRoutes);
router.use("/api/v1/tryouts", tryoutRoutes);
router.use("/api/v1/questions", questionRoutes);
router.use("/api/v1/sessions", sessionRoutes);
router.use("/api/v1/dashboard", dashboardRoutes);
router.use("/api/v1/profile", profileRoutes);
router.use("/api/v1", subscriptionRoutes);

export default router;
