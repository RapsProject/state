import type { RequestHandler } from "express";
import { prisma } from "../config/prisma";
import { ok } from "../utils/response";
import * as tryoutService from "../services/tryoutService";
import * as sessionService from "../services/sessionService";

export const listUsers: RequestHandler = async (_req, res, next) => {
  try {
    const users = await prisma.profile.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        dreamMajor: true,
        phoneNumber: true,
        schoolOrigin: true,
        createdAt: true,
        subscriptions: {
          select: {
            id: true,
            status: true,
            startDate: true,
            plan: {
              select: { id: true, name: true, price: true, durationDays: true },
            },
          },
          orderBy: { startDate: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json(ok("Operation successful", users));
  } catch (e) {
    return next(e);
  }
};

export const getUsersSummary: RequestHandler = async (_req, res, next) => {
  try {
    const [totalUsers, totalAdmin, paidSubscriptions] = await Promise.all([
      prisma.profile.count(),
      prisma.profile.count({ where: { role: "admin" } }),
      // Count only paid (non-Free) active subscriptions
      prisma.userSubscription.findMany({
        where: {
          status: "active",
          plan: { name: { not: "Free" } },
        },
        select: {
          plan: { select: { name: true } },
        },
      }),
    ]);

    // Build per-plan breakdown
    const planCounts: Record<string, number> = {};
    for (const sub of paidSubscriptions) {
      const name = sub.plan.name;
      planCounts[name] = (planCounts[name] || 0) + 1;
    }
    const subscriptionDetails = Object.entries(planCounts).map(([name, count]) => ({
      name,
      count,
    }));

    return res.json(
      ok("Operation successful", {
        totalUsers,
        totalActiveSubscriptions: paidSubscriptions.length,
        totalAdmins: totalAdmin,
        totalStudents: totalUsers - totalAdmin,
        subscriptionDetails,
      }),
    );
  } catch (e) {
    return next(e);
  }
};

export const getUserSessions: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params as { id: string };
    const sessions = await sessionService.listUserSessions(id);
    return res.json(ok("Operation successful", sessions));
  } catch (e) {
    return next(e);
  }
};

export const listTryouts: RequestHandler = async (_req, res, next) => {
  try {
    // Admin: lihat semua tryout, termasuk yang tidak aktif / belum published
    const data = await tryoutService.listTryouts({
      onlyPublished: false,
      includeInactive: true,
    });
    return res.json(ok("Operation successful", data));
  } catch (e) {
    return next(e);
  }
};

export const deleteTryout: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params as { id: string };
    const data = await tryoutService.deleteTryout(id);
    return res.json(ok("Tryout deleted", data));
  } catch (e) {
    return next(e);
  }
};
