import { prisma } from "../config/prisma";
import { HttpError } from "../middlewares/error";

export async function getDashboardStats(userId: string) {
  const profile = await prisma.profile.findUnique({ where: { id: userId } });
  if (!profile) throw new HttpError(404, "Profile not found");

  const completedSessions = await prisma.tryoutSession.findMany({
    where: { userId, status: "completed" },
    select: {
      id: true,
      score: true,
      startTime: true,
      endTime: true,
      tryout: { select: { id: true, title: true, type: true } },
    },
    orderBy: { startTime: "desc" },
  });

  // Compute lastSession with correct / wrong / unanswered breakdown
  let lastSession: {
    id: string;
    tryoutId: string;
    tryoutTitle: string;
    score: number | null;
    correct: number;
    wrong: number;
    unanswered: number;
    startTime: Date;
  } | null = null;

  if (completedSessions.length > 0) {
    const latest = completedSessions[0]!;
    const answers = await prisma.userAnswer.findMany({
      where: { sessionId: latest.id },
      select: {
        optionId: true,
        option: { select: { isCorrect: true } },
      },
    });
    const correct = answers.filter((a) => a.option?.isCorrect === true).length;
    const wrong = answers.filter(
      (a) => a.optionId != null && a.option?.isCorrect === false
    ).length;
    const unanswered = answers.filter((a) => a.optionId == null).length;

    lastSession = {
      id: latest.id,
      tryoutId: latest.tryout.id,
      tryoutTitle: latest.tryout.title,
      score: latest.score,
      correct,
      wrong,
      unanswered,
      startTime: latest.startTime,
    };
  }

  return {
    fullName: profile.fullName,
    lastSession,
  };
}
