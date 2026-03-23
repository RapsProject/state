import { prisma } from "../config/prisma";
import { HttpError } from "../middlewares/error";
import { gradeSession } from "./gradingService";
import * as userService from "./userService";
import { canAccessTryout, getUserTryoutAccessContext } from "./tryoutService";

export type StartSessionOptions = {
  email?: string;
  fullName?: string;
};

export async function startSession(
  userId: string,
  tryoutId: string,
  options: StartSessionOptions = {},
) {
  await userService.syncProfile({
    id: userId,
    email: options.email ?? "",
    fullName: options.fullName ?? "User",
  });

  const tryout = await prisma.tryout.findUnique({
    where: { id: tryoutId, isActive: true, isPublished: true },
    select: {
      id: true,
      access: true,
      maxAttempts: true,
    },
  });
  if (!tryout) throw new HttpError(404, "Tryout not found or not published");

  const accessContext = await getUserTryoutAccessContext(userId);
  if (
    accessContext.role !== "admin" &&
    !canAccessTryout(tryout.access, accessContext.tier)
  ) {
    throw new HttpError(
      403,
      "Akses tryout ini memerlukan subscription yang sesuai.",
    );
  }

  const ongoingSession = await prisma.tryoutSession.findFirst({
    where: { userId, tryoutId, status: "ongoing" },
  });
  if (ongoingSession) {
    return ongoingSession;
  }

  if (tryout.maxAttempts !== null) {
    const completedAttemptCount = await prisma.tryoutSession.count({
      where: { userId, tryoutId, status: "completed" },
    });
    if (completedAttemptCount >= tryout.maxAttempts) {
      throw new HttpError(403, "Maximum attempts reached for this tryout");
    }
  }

  return prisma.tryoutSession.create({
    data: { userId, tryoutId },
  });
}

export async function saveAnswer(
  sessionId: string,
  userId: string,
  questionId: string,
  optionId: string | null,
  isMarkedForReview = false,
) {
  const session = await prisma.tryoutSession.findUnique({
    where: { id: sessionId },
  });
  if (!session) throw new HttpError(404, "Session not found");
  if (session.userId !== userId) throw new HttpError(403, "Forbidden");
  if (session.status === "completed")
    throw new HttpError(400, "Session is already completed");

  if (optionId !== null) {
    const option = await prisma.option.findUnique({
      where: { id: optionId },
      select: { id: true },
    });
    if (!option) {
      throw new HttpError(400, "Option not found");
    }
  }

  const existing = await prisma.userAnswer.findFirst({
    where: { sessionId, questionId },
    select: { id: true },
  });

  if (existing) {
    return prisma.userAnswer.update({
      where: { id: existing.id },
      data: { optionId, isMarkedForReview },
    });
  }

  return prisma.userAnswer.create({
    data: { sessionId, questionId, optionId, isMarkedForReview },
  });
}

export async function submitSession(sessionId: string, userId: string) {
  const session = await prisma.tryoutSession.findUnique({
    where: { id: sessionId },
  });
  if (!session) throw new HttpError(404, "Session not found");
  if (session.userId !== userId) throw new HttpError(403, "Forbidden");
  if (session.status === "completed")
    throw new HttpError(400, "Session is already completed");

  const result = await gradeSession(sessionId);

  const updatedSession = await prisma.tryoutSession.update({
    where: { id: sessionId },
    data: {
      status: "completed",
      endTime: new Date(),
      score: result.score,
    },
    include: {
      answers: {
        include: {
          option: {
            select: {
              id: true,
              sequenceNumber: true,
              text: true,
              isCorrect: true,
            },
          },
          question: {
            select: {
              id: true,
              sequenceNumber: true,
              explanation: true,
              options: {
                select: {
                  id: true,
                  sequenceNumber: true,
                  text: true,
                  isCorrect: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return appendMissingAnswers(updatedSession);
}

export async function getSession(sessionId: string, userId: string) {
  const session = await prisma.tryoutSession.findUnique({
    where: { id: sessionId },
    include: {
      answers: {
        include: {
          option: {
            select: {
              id: true,
              sequenceNumber: true,
              text: true,
              isCorrect: true,
            },
          },
          question: {
            select: {
              id: true,
              sequenceNumber: true,
              explanation: true,
              options: {
                select: {
                  id: true,
                  sequenceNumber: true,
                  text: true,
                  isCorrect: true,
                },
              },
            },
          },
        },
        orderBy: { question: { sequenceNumber: "asc" } },
      },
      tryout: { select: { id: true, title: true, durationMinutes: true } },
    },
  });
  if (!session) throw new HttpError(404, "Session not found");
  if (session.userId !== userId) throw new HttpError(403, "Forbidden");

  if (session.status !== "completed") {
    return {
      ...session,
      answers: session.answers.map((a) => ({
        ...a,
        option: a.option
          ? {
              id: a.option.id,
              sequenceNumber: a.option.sequenceNumber,
              text: a.option.text,
            }
          : null,
        // For ongoing sessions we don't expose explanations or correct options.
        question: {
          id: a.question.id,
          sequenceNumber: a.question.sequenceNumber,
        },
      })),
    };
  }

  return appendMissingAnswers(session);
}

export async function listUserSessions(userId: string) {
  return prisma.tryoutSession.findMany({
    where: { userId },
    orderBy: { startTime: "desc" },
    include: {
      tryout: { select: { id: true, title: true, type: true } },
    },
  });
}

async function appendMissingAnswers(session: any) {
  const answeredQuestionIds = new Set<string>(session.answers.map((a: any) => String(a.question.id)));

  const missingQuestions = await prisma.question.findMany({
    where: {
      tryoutId: session.tryoutId,
      isActive: true,
      id: { notIn: Array.from(answeredQuestionIds) },
    },
    select: {
      id: true,
      sequenceNumber: true,
      explanation: true,
      options: {
        select: {
          id: true,
          sequenceNumber: true,
          text: true,
          isCorrect: true,
        },
      },
    },
  });

  const missingAnswers = missingQuestions.map((q) => ({
    id: `unanswered-${q.id}`,
    questionId: q.id,
    optionId: null,
    isMarkedForReview: false,
    option: null,
    question: q,
  }));

  return {
    ...session,
    answers: [...session.answers, ...missingAnswers].sort(
      (a, b) => a.question.sequenceNumber - b.question.sequenceNumber
    ),
  };
}
