import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../../middlewares/auth";
import { validateBody } from "../../middlewares/validation";
import * as subscriptionController from "../../controllers/subscriptionController";

const router = Router();

const createPlanSchema = z.object({
  name: z.string().min(1),
  price: z.number().int().positive(),
  durationDays: z.number().int().positive(),
});

const createTransactionSchema = z.object({
  planId: z.string().uuid(),
  midtransOrderId: z.string().min(1),
  amount: z.number().int().positive(),
  paymentUrl: z.string().url().optional(),
});

const webhookSchema = z.object({
  order_id: z.string().min(1),
  transaction_status: z.string().min(1),
  fraud_status: z.string().optional(),
});

// Plans (public read, auth for create)
router.get("/plans", subscriptionController.listPlans);
router.post("/plans", authMiddleware, validateBody(createPlanSchema), subscriptionController.createPlan);

// Transactions (auth required)
router.get("/transactions", authMiddleware, subscriptionController.listTransactions);
router.post("/transactions", authMiddleware, validateBody(createTransactionSchema), subscriptionController.createTransaction);

// Midtrans webhook (no auth — called by Midtrans server)
router.post("/transactions/webhook", validateBody(webhookSchema), subscriptionController.midtransWebhook);

export default router;
