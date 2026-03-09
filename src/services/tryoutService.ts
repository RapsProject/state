import type { Prisma, TryoutType } from "@prisma/client";
import { prisma } from "../config/prisma";
import { HttpError } from "../middlewares/error";

export type CreateTryoutInput = {
  title: string;
  type?: TryoutType;
  durationMinutes: number;
  maxAttempts?: number;
  isPremium?: boolean;
  isPublished?: boolean;
};

export type UpdateTryoutInput = Partial<CreateTryoutInput> & {
  isActive?: boolean;
};

const publicQuestionSelect = {
  id: true,
  sequenceNumber: true,
  text: true,
  imageUrl: true,
  subjectId: true,
  topicId: true,
  isActive: true,
  options: {
    select: {
      id: true,
      sequenceNumber: true,
      text: true,
      imageUrl: true,
      // isCorrect intentionally omitted for public responses
    },
    orderBy: { sequenceNumber: "asc" as const },
  },
} satisfies Prisma.QuestionSelect;

type ListTryoutsOptions = {
  onlyPublished?: boolean;
  includeInactive?: boolean;
};

export async function listTryouts(options?: ListTryoutsOptions) {
  const { onlyPublished = true, includeInactive = false } = options ?? {};

  const where: Prisma.TryoutWhereInput = {};
  if (!includeInactive) where.isActive = true;
  if (onlyPublished) where.isPublished = true;

  return prisma.tryout.findMany({ where, orderBy: { title: "asc" } });
}

export async function getTryoutById(id: string, includeQuestions = false) {
  const tryout = await prisma.tryout.findUnique({
    where: { id },
    include: includeQuestions
      ? {
          questions: {
            where: { isActive: true },
            orderBy: { sequenceNumber: "asc" },
            select: publicQuestionSelect,
          },
        }
      : null,
  });
  if (!tryout) throw new HttpError(404, "Tryout not found");
  return tryout;
}

export async function createTryout(input: CreateTryoutInput) {
  return prisma.tryout.create({ data: input });
}

export async function updateTryout(id: string, input: UpdateTryoutInput) {
  await getTryoutById(id);
  return prisma.tryout.update({ where: { id }, data: input });
}

export async function deleteTryout(id: string) {
  await getTryoutById(id);
  await prisma.tryout.delete({ where: { id } });
  return { id };
}
