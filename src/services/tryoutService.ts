import type { Prisma, TryoutAccess, TryoutType } from "@prisma/client";
import { prisma } from "../config/prisma";
import { HttpError } from "../middlewares/error";

export type CreateTryoutInput = {
  title: string;
  type?: TryoutType;
  durationMinutes: number;
  maxAttempts?: number;
  isPremium?: boolean;
  isUltimate?: boolean;
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

function toTryoutAccess(isPremium?: boolean, isUltimate?: boolean): TryoutAccess | undefined {
  if (isPremium === undefined && isUltimate === undefined) return undefined;
  if (isPremium && isUltimate) return "premium_and_ultimate";
  if (isUltimate) return "ultimate";
  if (isPremium) return "premium";
  return "free";
}

function toTryoutResponse<T extends { access: TryoutAccess }>(tryout: T) {
  const { access, ...rest } = tryout;
  return {
    ...rest,
    isPremium: access === "premium" || access === "premium_and_ultimate",
    isUltimate: access === "ultimate" || access === "premium_and_ultimate",
  };
}

export type SubscriptionTier = "free" | "premium" | "ultimate";

function getSubscriptionTierFromPlanName(planName?: string | null): SubscriptionTier {
  const normalizedPlanName = planName?.trim().toLowerCase();
  if (normalizedPlanName === "ultimate") return "ultimate";
  if (normalizedPlanName === "premium") return "premium";
  return "free";
}

export function getAccessibleTryoutAccesses(tier: SubscriptionTier): TryoutAccess[] {
  switch (tier) {
    case "ultimate":
      return ["free", "premium", "ultimate", "premium_and_ultimate"];
    case "premium":
      return ["free", "premium", "premium_and_ultimate"];
    default:
      return ["free"];
  }
}

export function canAccessTryout(access: TryoutAccess, tier: SubscriptionTier): boolean {
  return getAccessibleTryoutAccesses(tier).includes(access);
}

export async function getUserTryoutAccessContext(userId: string) {
  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: {
      role: true,
      subscriptions: {
        where: { status: "active" },
        orderBy: { startDate: "desc" },
        take: 1,
        include: {
          // Keep planName fallback for older rows or stale relations.
          // The relation name is still preferred when present.
          plan: {
            select: { name: true },
          },
        },
      },
    },
  });

  const activeSubscription = profile?.subscriptions?.[0];
  const activePlanName = activeSubscription?.plan?.name ?? activeSubscription?.planName;

  return {
    role: profile?.role ?? null,
    tier: getSubscriptionTierFromPlanName(activePlanName),
  };
}

type ListTryoutsOptions = {
  onlyPublished?: boolean;
  includeInactive?: boolean;
  userId?: string;
};

export async function listTryouts(options?: ListTryoutsOptions) {
  const { onlyPublished = true, includeInactive = false, userId } = options ?? {};

  const where: Prisma.TryoutWhereInput = {};
  if (!includeInactive) where.isActive = true;
  if (onlyPublished) where.isPublished = true;
  if (userId) {
    const accessContext = await getUserTryoutAccessContext(userId);
    if (accessContext.role !== "admin") {
      where.access = { in: getAccessibleTryoutAccesses(accessContext.tier) };
    }
  }

  const tryouts = await prisma.tryout.findMany({
    where,
    orderBy: { title: "asc" },
    select: tryoutBaseSelect,
  });

  return tryouts.map(toTryoutResponse);
}

export async function getTryoutById(id: string, includeQuestions = false, userId?: string) {
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
  if (userId) {
    const accessContext = await getUserTryoutAccessContext(userId);
    if (accessContext.role !== "admin") {
      if (!tryout.isActive || !tryout.isPublished) {
        throw new HttpError(404, "Tryout not found");
      }
      if (!canAccessTryout(tryout.access, accessContext.tier)) {
        throw new HttpError(403, "Akses tryout ini memerlukan subscription yang sesuai.");
      }
    }
  }
  return toTryoutResponse(tryout);
}

export async function createTryout(input: CreateTryoutInput) {
  const { isPremium, isUltimate, ...rest } = input;
  const accessValue = toTryoutAccess(isPremium, isUltimate);
  return prisma.tryout.create({
    data: {
      ...rest,
      ...(accessValue !== undefined ? { access: accessValue } : {}),
    },
    select: tryoutBaseSelect,
  }).then(toTryoutResponse);
}

export async function updateTryout(id: string, input: UpdateTryoutInput) {
  await getTryoutById(id);
  const { isPremium, isUltimate, ...rest } = input;
  const accessValue = toTryoutAccess(isPremium, isUltimate);
  return prisma.tryout.update({
    where: { id },
    data: {
      ...rest,
      ...(accessValue !== undefined ? { access: accessValue } : {}),
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
