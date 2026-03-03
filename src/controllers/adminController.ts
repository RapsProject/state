import type { RequestHandler } from "express";
import { prisma } from "../config/prisma";
import { ok } from "../utils/response";
import * as tryoutService from "../services/tryoutService";

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
        createdAt: true,
        subscriptions: {
          select: {
            id: true,
            status: true,
            startDate: true,
            endDate: true,
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
    const [totalUsers, totalActive, totalAdmin] = await Promise.all([
      prisma.profile.count(),
      prisma.userSubscription.count({ where: { status: "active" } }),
      prisma.profile.count({ where: { role: "admin" } }),
    ]);

    return res.json(
      ok("Operation successful", {
        totalUsers,
        totalActiveSubscriptions: totalActive,
        totalAdmins: totalAdmin,
        totalStudents: totalUsers - totalAdmin,
      }),
    );
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
