import type { RequestHandler } from "express";
import { ok } from "../utils/response";
import * as leaderboardService from "../services/leaderboardService";

export const getLeaderboard: RequestHandler = async (req, res, next) => {
  try {
    const { filterType, subject, examId, dreamMajor, limit } = req.query as {
      filterType: leaderboardService.LeaderboardFilterType;
      subject?: leaderboardService.SubjectFilter;
      examId?: string;
      dreamMajor?: string;
      limit?: string;
    };

    const data = await leaderboardService.getLeaderboard({
      filterType,
      subject,
      examId,
      dreamMajor,
      limit: limit != null ? Number(limit) : undefined
    });

    return res.json(ok("Operation successful", data));
  } catch (e) {
    return next(e);
  }
};

export const getDreamMajors: RequestHandler = async (_req, res, next) => {
  try {
    const data = await leaderboardService.getAvailableDreamMajors();
    return res.json(ok("Operation successful", data));
  } catch (e) {
    return next(e);
  }
};

