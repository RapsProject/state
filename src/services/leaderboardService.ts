import { prisma } from "../config/prisma";
import { HttpError } from "../middlewares/error";

export type LeaderboardFilterType = "OVERALL" | "SUBJECT" | "TRYOUT" | "DREAM_MAJOR";

export type SubjectFilter = "MATHEMATICS" | "PHYSICS";

export type LeaderboardParams = {
  filterType: LeaderboardFilterType;
  subject?: SubjectFilter;
  examId?: string;
  dreamMajor?: string;
  limit?: number;
};

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  fullName: string;
  score: number;
  avatarUrl: string | null;
};

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

function getSafeLimit(limit?: number): number {
  if (!limit || Number.isNaN(limit) || limit <= 0) return DEFAULT_LIMIT;
  return Math.min(limit, MAX_LIMIT);
}

export async function getLeaderboard(params: LeaderboardParams): Promise<LeaderboardEntry[]> {
  const limit = getSafeLimit(params.limit);

  switch (params.filterType) {
    case "OVERALL":
      return getOverallLeaderboard(limit);
    case "TRYOUT":
      if (!params.examId) {
        throw new HttpError(400, "examId is required when filterType is TRYOUT");
      }
      return getTryoutLeaderboard(params.examId, limit);
    case "SUBJECT":
      if (!params.subject) {
        throw new HttpError(400, "subject is required when filterType is SUBJECT");
      }
      return getSubjectLeaderboard(params.subject, limit);
    case "DREAM_MAJOR":
      if (!params.dreamMajor) {
        throw new HttpError(400, "dreamMajor is required when filterType is DREAM_MAJOR");
      }
      return getDreamMajorLeaderboard(params.dreamMajor, limit);
    default:
      throw new HttpError(400, "Invalid filterType");
  }
}

export async function getAvailableDreamMajors(): Promise<string[]> {
  const rows = await prisma.profile.findMany({
    where: {
      dreamMajor: { not: null }
    },
    select: { dreamMajor: true },
    distinct: ["dreamMajor"]
  });

  return rows
    .map((r) => r.dreamMajor as string)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "id"));
}

async function getOverallLeaderboard(limit: number): Promise<LeaderboardEntry[]> {
  const grouped = await prisma.tryoutSession.groupBy({
    by: ["userId"],
    where: {
      status: "completed",
      score: {
        not: null
      }
    },
    _avg: {
      score: true
    }
  });

  if (grouped.length === 0) return [];

  const sorted = grouped
    .map((g) => ({
      userId: g.userId,
      avgScore: g._avg.score ?? 0
    }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, limit);

  const userIds = sorted.map((g) => g.userId);
  const profiles = await prisma.profile.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      fullName: true
    }
  });

  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  const entries = sorted.map<LeaderboardEntry>((item, index) => {
    const profile = profileMap.get(item.userId);
    const score = item.avgScore;

    return {
      rank: index + 1,
      userId: item.userId,
      fullName: profile?.fullName ?? "Unknown",
      score: Number.isFinite(score) ? Number(score.toFixed(2)) : 0,
      avatarUrl: null
    };
  });

  return entries;
}

async function getTryoutLeaderboard(examId: string, limit: number): Promise<LeaderboardEntry[]> {
  const tryout = await prisma.tryout.findFirst({
    where: {
      id: examId,
      isActive: true
    },
    select: { id: true }
  });

  if (!tryout) {
    throw new HttpError(404, "Tryout not found or inactive");
  }

  const grouped = await prisma.tryoutSession.groupBy({
    by: ["userId"],
    where: {
      tryoutId: examId,
      status: "completed",
      score: {
        not: null
      }
    },
    _max: {
      score: true
    }
  });

  if (grouped.length === 0) return [];

  const sorted = grouped
    .map((g) => ({
      userId: g.userId,
      maxScore: g._max.score ?? 0
    }))
    .sort((a, b) => b.maxScore - a.maxScore)
    .slice(0, limit);

  const userIds = sorted.map((g) => g.userId);
  const profiles = await prisma.profile.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      fullName: true
    }
  });

  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  const entries = sorted.map<LeaderboardEntry>((item, index) => {
    const profile = profileMap.get(item.userId);
    const score = item.maxScore;

    return {
      rank: index + 1,
      userId: item.userId,
      fullName: profile?.fullName ?? "Unknown",
      score: Number.isFinite(score) ? Number(score.toFixed(2)) : 0,
      avatarUrl: null
    };
  });

  return entries;
}

async function getDreamMajorLeaderboard(dreamMajor: string, limit: number): Promise<LeaderboardEntry[]> {
  const profiles = await prisma.profile.findMany({
    where: {
      dreamMajor: {
        equals: dreamMajor,
        mode: "insensitive"
      }
    },
    select: { id: true }
  });

  if (profiles.length === 0) return [];

  const userIds = profiles.map((p) => p.id);

  const grouped = await prisma.tryoutSession.groupBy({
    by: ["userId"],
    where: {
      userId: { in: userIds },
      status: "completed",
      score: { not: null }
    },
    _avg: { score: true }
  });

  if (grouped.length === 0) return [];

  const sorted = grouped
    .map((g) => ({ userId: g.userId, avgScore: g._avg.score ?? 0 }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, limit);

  const sortedUserIds = sorted.map((g) => g.userId);
  const profileRows = await prisma.profile.findMany({
    where: { id: { in: sortedUserIds } },
    select: { id: true, fullName: true }
  });

  const profileMap = new Map(profileRows.map((p) => [p.id, p]));

  return sorted.map<LeaderboardEntry>((item, index) => {
    const profile = profileMap.get(item.userId);
    return {
      rank: index + 1,
      userId: item.userId,
      fullName: profile?.fullName ?? "Unknown",
      score: Number.isFinite(item.avgScore) ? Number(item.avgScore.toFixed(2)) : 0,
      avatarUrl: null
    };
  });
}

async function getSubjectLeaderboard(subject: SubjectFilter, limit: number): Promise<LeaderboardEntry[]> {
  const subjectName = subject === "MATHEMATICS" ? "Mathematics" : "Physics";

  const subjectRow = await prisma.subject.findFirst({
    where: { name: subjectName },
    select: { id: true }
  });

  if (!subjectRow) {
    throw new HttpError(404, `Subject '${subjectName}' not found`);
  }

  const answers = await prisma.userAnswer.findMany({
    where: {
      session: {
        status: "completed"
      },
      question: {
        subjectId: subjectRow.id
      }
    },
    select: {
      session: {
        select: {
          userId: true
        }
      },
      optionId: true,
      option: {
        select: {
          isCorrect: true
        }
      }
    }
  });

  if (answers.length === 0) return [];

  const stats = new Map<
    string,
    {
      answered: number;
      correct: number;
    }
  >();

  for (const a of answers) {
    const userId = a.session.userId;
    let s = stats.get(userId);
    if (!s) {
      s = { answered: 0, correct: 0 };
      stats.set(userId, s);
    }

    // Count every row as an answered question, even if optionId is null.
    s.answered += 1;

    if (a.option?.isCorrect === true) {
      s.correct += 1;
    }
  }

  const aggregates: Array<{ userId: string; score: number }> = [];

  for (const [userId, { answered, correct }] of stats.entries()) {
    if (answered === 0) continue;
    const rawScore = (correct / answered) * 100;
    const score = Number.isFinite(rawScore) ? Math.round(rawScore * 100) / 100 : 0;
    aggregates.push({ userId, score });
  }

  if (aggregates.length === 0) return [];

  aggregates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.userId.localeCompare(b.userId);
  });

  const limited = aggregates.slice(0, limit);
  const userIds = limited.map((x) => x.userId);

  const profiles = await prisma.profile.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      fullName: true
    }
  });

  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  const entries: LeaderboardEntry[] = limited.map((item, index) => {
    const profile = profileMap.get(item.userId);
    return {
      rank: index + 1,
      userId: item.userId,
      fullName: profile?.fullName ?? "Unknown",
      score: item.score,
      avatarUrl: null
    };
  });

  return entries;
}

