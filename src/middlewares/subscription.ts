import type { RequestHandler } from "express";
import * as userService from "../services/userService";
import { HttpError } from "./error";

const PREMIUM_PLAN_NAMES = ["Premium", "Ultimate"];

/**
 * Requires user to have an active subscription with plan name "Premium" or "Ultimate".
 * Use after authMiddleware. Free users get 403.
 */
export const requirePremiumOrUltimate: RequestHandler = async (req, _res, next) => {
  const userId = req.user?.id;
  if (!userId) return next(new HttpError(401, "Unauthorized"));

  try {
    const profile = await userService.getProfileById(userId);
    const activeSub = profile.subscriptions?.[0];
    const planName = activeSub?.plan?.name;

    if (!activeSub || activeSub.status !== "active" || !planName) {
      return next(
        new HttpError(403, "Akses fitur ini memerlukan langganan Premium atau Ultimate.")
      );
    }
    if (!PREMIUM_PLAN_NAMES.includes(planName)) {
      return next(
        new HttpError(403, "Akses fitur ini memerlukan langganan Premium atau Ultimate.")
      );
    }
    return next();
  } catch (e) {
    return next(e);
  }
};
