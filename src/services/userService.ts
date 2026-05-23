import { prisma } from "../config/prisma";
import { HttpError } from "../middlewares/error";

export type SyncProfileInput = {
  id: string;
  email: string;
  fullName: string;
  schoolOrigin?: string;
};

export async function syncProfile(input: SyncProfileInput) {
  // Check if user already exists to determine if this is a new registration
  const existing = await prisma.profile.findUnique({ where: { id: input.id } });

  const profile = await prisma.profile.upsert({
    where: { id: input.id },
    create: {
      id: input.id,
      email: input.email,
      fullName: input.fullName,
      ...(input.schoolOrigin != null && { schoolOrigin: input.schoolOrigin }),
    },
    update: {
      email: input.email,
      fullName: input.fullName,
      ...(input.schoolOrigin != null && { schoolOrigin: input.schoolOrigin }),
    },
  });

  // If this is a brand-new user, assign the "Free" subscription plan
  if (!existing) {
    const freePlan = await prisma.subscriptionPlan.findFirst({
      where: { name: "Free", isActive: true },
    });

    if (freePlan) {
      // Only create if no active subscription already exists
      const activeSub = await prisma.userSubscription.findFirst({
        where: { userId: input.id, status: "active" },
      });

      if (!activeSub) {
        await prisma.userSubscription.create({
          data: {
            userId: input.id,
            userName: input.fullName,
            planId: freePlan.id,
            planName: freePlan.name,
            startDate: new Date(),
            status: "active",
          },
        });
      }
    }
  }

  return profile;
}

export async function getProfileById(id: string) {
  const profile = await prisma.profile.findUnique({
    where: { id },
    include: {
      subscriptions: {
        where: { status: "active" },
        orderBy: { startDate: "desc" },
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
  data: { phoneNumber?: string; dreamMajor?: string; fullName?: string; schoolOrigin?: string }
) {
  const profile = await prisma.profile.findUnique({ where: { id } });
  if (!profile) throw new HttpError(404, "Profile not found");
  return prisma.profile.update({ where: { id }, data });
}
