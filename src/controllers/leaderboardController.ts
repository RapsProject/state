import type { RequestHandler } from "express";
import { ok } from "../utils/response";
import * as leaderboardService from "../services/leaderboardService";

export const getLeaderboard: RequestHandler = async (req, res, next) => {
  try {
    const { filterType, subject, examId, limit } = req.query as {
      filterType: leaderboardService.LeaderboardFilterType;
      subject?: leaderboardService.SubjectFilter;
      examId?: string;
      limit?: string;
    };

    const data = await leaderboardService.getLeaderboard({
      filterType,
      subject,
      examId,
      limit: limit != null ? Number(limit) : undefined
    });

    return res.json(ok("Operation successful", data));
  } catch (e) {
    return next(e);
  }
};

