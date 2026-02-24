import type { RequestHandler } from "express";
import { ok } from "../utils/response";
import * as userService from "../services/userService";

export const getMe: RequestHandler = async (req, res, next) => {
  try {
    const profile = await userService.getProfileById(req.user!.id);
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
    };
    const profile = await userService.updateProfile(userId, data);
    return res.json(ok("Profile updated", profile));
  } catch (e) {
    return next(e);
  }
};

