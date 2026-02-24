import { prisma } from "../config/prisma";

export type GradingResult = {
  score: number;
  totalCorrect: number;
  totalWrong: number;
  totalUnanswered: number;
};

export async function gradeSession(sessionId: string): Promise<GradingResult> {
  const answers = await prisma.userAnswer.findMany({
    where: { sessionId },
    include: {
      option: { select: { isCorrect: true } },
    },
  });

  let totalCorrect = 0;
  let totalWrong = 0;
  let totalUnanswered = 0;

  for (const answer of answers) {
    if (answer.optionId === null) {
      totalUnanswered++;
    } else if (answer.option?.isCorrect) {
      totalCorrect++;
    } else {
      totalWrong++;
    }
  }

  // Any questions in the tryout not touched at all count as unanswered
  const session = await prisma.tryoutSession.findUnique({
    where: { id: sessionId },
    select: { tryoutId: true },
  });

  if (session) {
    const tryoutQuestionCount = await prisma.question.count({
      where: { tryoutId: session.tryoutId, isActive: true },
    });
    const answeredCount = answers.length;
    totalUnanswered += Math.max(0, tryoutQuestionCount - answeredCount);
  }

  const answered = totalCorrect + totalWrong;
  const score = answered > 0 ? Math.round((totalCorrect / (answered + totalUnanswered)) * 100) : 0;

  return { score, totalCorrect, totalWrong, totalUnanswered };
}
