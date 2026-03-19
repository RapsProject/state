import type { RequestHandler } from "express";
import { ok } from "../utils/response";
import * as userService from "../services/userService";

export const getMe: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const profile = await userService.getProfileById(userId);
    // Log ke terminal: cek role yang terbaca dari DB
    // Akan muncul di terminal server backend (Express)
    // contoh: [profile.getMe] userId=... email=... role=admin
    console.log("[profile.getMe] userId=%s email=%s role=%s", userId, profile.email, profile.role);
    return res.json(ok("Operation successful", profile));
  } catch (e) {
    return next(e);
  }
};

export const updateMe: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const data = req.body as {
      phoneNumber?: string;
      dreamMajor?: string;
      fullName?: string;
      schoolOrigin?: string;
    };
    const profile = await userService.updateProfile(userId, data);
    return res.json(ok("Profile updated", profile));
  } catch (e) {
    return next(e);
  }
};

