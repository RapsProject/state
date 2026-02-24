import type { RequestHandler } from "express";
import { ok } from "../utils/response";
import * as userService from "../services/userService";

export const syncProfile: RequestHandler = async (req, res, next) => {
  try {
    const user = req.user!;
    const { full_name, email } = req.body as { full_name?: string; email?: string };

    const profile = await userService.syncProfile({
      id: user.id,
      email: email ?? (user.email ?? ""),
      fullName: full_name ?? (user.claims?.["user_metadata"] as Record<string, string> | undefined)?.["full_name"] ?? "",
    });

    return res.json(ok("Profile synced", profile));
  } catch (e) {
    return next(e);
  }
};

export const getMe: RequestHandler = async (req, res, next) => {
  try {
    const profile = await userService.getProfileById(req.user!.id);
    return res.json(ok("Operation successful", profile));
  } catch (e) {
    return next(e);
  }
};
