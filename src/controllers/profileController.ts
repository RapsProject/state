import type { RequestHandler } from "express";
import { ok } from "../utils/response";
import * as userService from "../services/userService";

export const getMyProfile: RequestHandler = async (req, res, next) => {
  try {
    const profile = await userService.getProfileById(req.user!.id);
    return res.json(ok("Operation successful", profile));
  } catch (e) {
    return next(e);
  }
};

export const updateMyProfile: RequestHandler = async (req, res, next) => {
  try {
    const { phoneNumber, dreamMajor, fullName } = req.body as {
      phoneNumber?: string;
      dreamMajor?: string;
      fullName?: string;
    };
    const profile = await userService.updateProfile(req.user!.id, {
      phoneNumber,
      dreamMajor,
      fullName,
    });
    return res.json(ok("Profile updated", profile));
  } catch (e) {
    return next(e);
  }
};
