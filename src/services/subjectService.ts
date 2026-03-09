import { prisma } from "../config/prisma";
import { HttpError } from "../middlewares/error";

export async function listSubjects() {
  return prisma.subject.findMany({ orderBy: { name: "asc" } });
}

export async function getSubjectById(id: string) {
  const subject = await prisma.subject.findUnique({ where: { id } });
  if (!subject) throw new HttpError(404, "Subject not found");
  return subject;
}

export async function createSubject(input: { name: string; description?: string }) {
  return prisma.subject.create({ data: input });
}

export async function listTopics(subjectId: string) {
  await getSubjectById(subjectId);
  return prisma.topic.findMany({ where: { subjectId }, orderBy: { name: "asc" } });
}

export async function createTopic(subjectId: string, name: string) {
  await getSubjectById(subjectId);
  return prisma.topic.create({ data: { subjectId, name } });
}

export async function deleteSubject(id: string) {
  await getSubjectById(id);
  return prisma.subject.delete({ where: { id } });
}

export async function deleteTopic(subjectId: string, topicId: string) {
  await getSubjectById(subjectId);
  const topic = await prisma.topic.findFirst({ where: { id: topicId, subjectId } });
  if (!topic) {
    throw new HttpError(404, "Topic not found");
  }
  return prisma.topic.delete({ where: { id: topicId } });
}
