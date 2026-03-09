import type { Prisma, TryoutAccess, TryoutType } from "@prisma/client";
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

const tryoutBaseSelect = {
  id: true,
  title: true,
  type: true,
  durationMinutes: true,
  maxAttempts: true,
  access: true,
  isPublished: true,
  isActive: true,
} satisfies Prisma.TryoutSelect;

function toTryoutAccess(isPremium?: boolean): TryoutAccess | undefined {
  if (isPremium === undefined) return undefined;
  return isPremium ? "premium" : "free";
}

function toTryoutResponse<T extends { access: TryoutAccess }>(tryout: T) {
  const { access, ...rest } = tryout;
  return {
    ...rest,
    isPremium: access !== "free",
  };
}

type ListTryoutsOptions = {
  onlyPublished?: boolean;
  includeInactive?: boolean;
};

export async function listTryouts(options?: ListTryoutsOptions) {
  const { onlyPublished = true, includeInactive = false } = options ?? {};

  const where: Prisma.TryoutWhereInput = {};
  if (!includeInactive) where.isActive = true;
  if (onlyPublished) where.isPublished = true;

  const tryouts = await prisma.tryout.findMany({
    where,
    orderBy: { title: "asc" },
    select: tryoutBaseSelect,
  });

  return tryouts.map(toTryoutResponse);
}

export async function getTryoutById(id: string, includeQuestions = false) {
  const tryout = await prisma.tryout.findUnique({
    where: { id },
    select: includeQuestions
      ? {
          ...tryoutBaseSelect,
          questions: {
            where: { isActive: true },
            orderBy: { sequenceNumber: "asc" },
            select: publicQuestionSelect,
          },
        }
      : tryoutBaseSelect,
  });
  if (!tryout) throw new HttpError(404, "Tryout not found");
  return toTryoutResponse(tryout);
}

export async function createTryout(input: CreateTryoutInput) {
  const { isPremium, ...rest } = input;
  return prisma.tryout.create({
    data: {
      ...rest,
      ...(isPremium !== undefined ? { access: toTryoutAccess(isPremium) } : {}),
    },
    select: tryoutBaseSelect,
  }).then(toTryoutResponse);
}

export async function updateTryout(id: string, input: UpdateTryoutInput) {
  await getTryoutById(id);
  const { isPremium, ...rest } = input;
  return prisma.tryout.update({
    where: { id },
    data: {
      ...rest,
      ...(isPremium !== undefined ? { access: toTryoutAccess(isPremium) } : {}),
    },
    select: tryoutBaseSelect,
  }).then(toTryoutResponse);
}

export async function deleteTryout(id: string) {
  await getTryoutById(id);
  await prisma.tryout.delete({
    where: { id },
    select: { id: true },
  });
  return { id };
}
