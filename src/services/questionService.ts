import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { HttpError } from "../middlewares/error";

export type CreateQuestionInput = {
  tryoutId: string;
  subjectId: string;
  topicId?: string;
  sequenceNumber: number;
  text: string;
  imageUrl?: string;
  explanation?: string;
  options: {
    sequenceNumber: number;
    text: string;
    imageUrl?: string;
    isCorrect?: boolean;
  }[];
};

export type UpdateQuestionInput = Partial<Omit<CreateQuestionInput, "options">> & {
  options?: CreateQuestionInput["options"];
  isActive?: boolean;
};

const publicSelect = {
  id: true,
  tryoutId: true,
  subjectId: true,
  topicId: true,
  sequenceNumber: true,
  text: true,
  imageUrl: true,
  explanation: true,
  isActive: true,
  options: {
    select: {
      id: true,
      sequenceNumber: true,
      text: true,
      imageUrl: true,
      // isCorrect intentionally omitted
    },
    orderBy: { sequenceNumber: "asc" as const },
  },
} satisfies Prisma.QuestionSelect;

export async function listQuestions(params: {
  tryoutId?: string;
  subjectId?: string;
  topicId?: string;
  limit?: number;
}) {
  const where: Prisma.QuestionWhereInput = { isActive: true };
  if (params.tryoutId) where.tryoutId = params.tryoutId;
  if (params.subjectId) where.subjectId = params.subjectId;
  if (params.topicId) where.topicId = params.topicId;

  return prisma.question.findMany({
    where,
    orderBy: { sequenceNumber: "asc" },
    take: params.limit ?? 50,
    select: publicSelect,
  });
}

export async function getQuestionById(id: string) {
  const q = await prisma.question.findUnique({ where: { id }, select: publicSelect });
  if (!q) throw new HttpError(404, "Question not found");
  return q;
}

export async function getQuestionWithAnswer(id: string) {
  const q = await prisma.question.findUnique({
    where: { id },
    include: {
      options: { orderBy: { sequenceNumber: "asc" } },
    },
  });
  if (!q) throw new HttpError(404, "Question not found");
  return q;
}

export async function createQuestion(input: CreateQuestionInput) {
  const created = await prisma.question.create({
    data: {
      tryoutId: input.tryoutId,
      subjectId: input.subjectId,
      topicId: input.topicId ?? null,
      sequenceNumber: input.sequenceNumber,
      text: input.text,
      imageUrl: input.imageUrl ?? null,
      explanation: input.explanation ?? null,
      options: {
        create: input.options.map((o) => ({
          sequenceNumber: o.sequenceNumber,
          text: o.text,
          imageUrl: o.imageUrl ?? null,
          isCorrect: Boolean(o.isCorrect),
        })),
      },
    },
  });
  return getQuestionById(created.id);
}

export async function updateQuestion(id: string, input: UpdateQuestionInput) {
  const exists = await prisma.question.findUnique({ where: { id }, select: { id: true } });
  if (!exists) throw new HttpError(404, "Question not found");

  const updateData: Prisma.QuestionUpdateInput = {
    ...(input.text !== undefined ? { text: input.text } : {}),
    ...(input.sequenceNumber !== undefined ? { sequenceNumber: input.sequenceNumber } : {}),
    ...(input.subjectId !== undefined ? { subject: { connect: { id: input.subjectId } } } : {}),
    ...(input.topicId !== undefined ? { topic: input.topicId ? { connect: { id: input.topicId } } : { disconnect: true } } : {}),
    ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl ?? null } : {}),
    ...(input.explanation !== undefined ? { explanation: input.explanation ?? null } : {}),
    ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
  };

  if (Array.isArray(input.options)) {
    await prisma.$transaction([
      prisma.option.deleteMany({ where: { questionId: id } }),
      prisma.question.update({
        where: { id },
        data: {
          ...updateData,
          options: {
            create: input.options.map((o) => ({
              sequenceNumber: o.sequenceNumber,
              text: o.text,
              imageUrl: o.imageUrl ?? null,
              isCorrect: Boolean(o.isCorrect),
            })),
          },
        },
      }),
    ]);
  } else {
    await prisma.question.update({ where: { id }, data: updateData });
  }

  return getQuestionById(id);
}

export async function deleteQuestion(id: string) {
  const exists = await prisma.question.findUnique({ where: { id }, select: { id: true } });
  if (!exists) throw new HttpError(404, "Question not found");
  await prisma.question.delete({ where: { id } });
  return { id };
}
