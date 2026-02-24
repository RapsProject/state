import type { RequestHandler } from "express";
import { ok } from "../utils/response";
import * as dashboardService from "../services/dashboardService";

export const getStats: RequestHandler = async (req, res, next) => {
  try {
    const data = await dashboardService.getDashboardStats(req.user!.id);
    return res.json(ok("Operation successful", data));
  } catch (e) {
    return next(e);
  }
};
