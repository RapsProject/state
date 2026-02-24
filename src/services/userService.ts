import { prisma } from "../config/prisma";
import { HttpError } from "../middlewares/error";

export type SyncProfileInput = {
  id: string;
  email: string;
  fullName: string;
};

export async function syncProfile(input: SyncProfileInput) {
  return prisma.profile.upsert({
    where: { id: input.id },
    create: {
      id: input.id,
      email: input.email,
      fullName: input.fullName,
    },
    update: {
      email: input.email,
      fullName: input.fullName,
    },
  });
}

export async function getProfileById(id: string) {
  const profile = await prisma.profile.findUnique({
    where: { id },
    include: {
      subscriptions: {
        where: { status: "active" },
        orderBy: { endDate: "desc" },
        take: 1,
        include: { plan: true },
      },
    },
  });
  if (!profile) throw new HttpError(404, "Profile not found");
  return profile;
}

export async function updateProfile(
  id: string,
  data: { phoneNumber?: string; dreamMajor?: string; fullName?: string }
) {
  const profile = await prisma.profile.findUnique({ where: { id } });
  if (!profile) throw new HttpError(404, "Profile not found");
  return prisma.profile.update({ where: { id }, data });
}
