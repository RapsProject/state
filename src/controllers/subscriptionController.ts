import type { RequestHandler } from "express";
import { ok } from "../utils/response";
import * as subscriptionService from "../services/subscriptionService";

export const listPlans: RequestHandler = async (_req, res, next) => {
  try {
    const data = await subscriptionService.listPlans();
    return res.json(ok("Operation successful", data));
  } catch (e) {
    return next(e);
  }
};

export const createPlan: RequestHandler = async (req, res, next) => {
  try {
    const data = await subscriptionService.createPlan(
      req.body as Parameters<typeof subscriptionService.createPlan>[0]
    );
    return res.status(201).json(ok("Plan created", data));
  } catch (e) {
    return next(e);
  }
};

export const createTransaction: RequestHandler = async (req, res, next) => {
  try {
    const { planId } = req.body as { planId: string };
    const user = req.user!;
    
    const data = await subscriptionService.createTransaction({
      userId: user.id,
      email: user.email || "",
      fullName: user.fullName || "User",
      phone: user.claims?.phone_number ? String(user.claims.phone_number) : undefined,
      planId,
    });
    return res.status(201).json(ok("Transaction created", data));
  } catch (e) {
    return next(e);
  }
};

export const listTransactions: RequestHandler = async (req, res, next) => {
  try {
    const data = await subscriptionService.listUserTransactions(req.user!.id);
    return res.json(ok("Operation successful", data));
  } catch (e) {
    return next(e);
  }
};

export const midtransWebhook: RequestHandler = async (req, res, next) => {
  try {
    const result = await subscriptionService.handleMidtransWebhook(
      req.body as Parameters<typeof subscriptionService.handleMidtransWebhook>[0]
    );
    return res.json(ok("Webhook processed", result));
  } catch (e) {
    return next(e);
  }
};
