import type { RequestHandler } from "express";
import { prisma } from "../config/prisma";
import { HttpError } from "./error";

const ROLE_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const roleCache = new Map<string, { role: string; expiry: number }>();

export const adminOnly: RequestHandler = async (req, _res, next) => {
  const userId = req.user?.id;
  if (!userId) return next(new HttpError(401, "Unauthorized"));

  try {
    const now = Date.now();
    const cached = roleCache.get(userId);

    let role: string;
    if (cached && cached.expiry > now) {
      role = cached.role;
    } else {
      const profile = await prisma.profile.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (!profile) {
        console.warn("[adminOnly] profile not found for userId=%s", userId);
        return next(new HttpError(401, "Profile not found"));
      }

      role = profile.role;
      roleCache.set(userId, { role, expiry: now + ROLE_CACHE_TTL_MS });
      console.log("[adminOnly] userId=%s role=%s (from DB)", userId, role);
    }

    if (role !== "admin") {
      console.warn("[adminOnly] forbidden, non-admin userId=%s role=%s", userId, role);
      return next(new HttpError(403, "Forbidden: admin access only"));
    }

    return next();
  } catch (e) {
    return next(e);
  }
};

/** Call this when a user's role is changed so the cache is invalidated immediately. */
export function clearAdminRoleCache(userId: string) {
  roleCache.delete(userId);
}
