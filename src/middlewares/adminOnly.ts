import type { RequestHandler } from "express";
import { prisma } from "../config/prisma";
import { HttpError } from "./error";

export const adminOnly: RequestHandler = async (req, _res, next) => {
  const userId = req.user?.id;
  if (!userId) return next(new HttpError(401, "Unauthorized"));

  try {
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!profile) {
      console.warn("[adminOnly] profile not found for userId=%s", userId);
      return next(new HttpError(401, "Profile not found"));
    }

    console.log("[adminOnly] userId=%s role=%s", userId, profile.role);
    if (profile.role !== "admin") {
      console.warn("[adminOnly] forbidden, non-admin userId=%s role=%s", userId, profile.role);
      return next(new HttpError(403, "Forbidden: admin access only"));
    }

    return next();
  } catch (e) {
    return next(e);
  }
};
