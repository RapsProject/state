import { prisma } from "../config/prisma";
import { HttpError } from "../middlewares/error";

export type CreatePlanInput = {
  name: string;
  price: number;
  durationDays: number;
};

export type CreateTransactionInput = {
  userId: string;
  planId: string;
  midtransOrderId: string;
  amount: number;
  paymentUrl?: string;
};

export type MidtransWebhookPayload = {
  order_id: string;
  transaction_status: string;
  fraud_status?: string;
};

export async function listPlans(onlyActive = true) {
  return prisma.subscriptionPlan.findMany({
    where: onlyActive ? { isActive: true } : undefined,
    orderBy: { price: "asc" },
  });
}

export async function createPlan(input: CreatePlanInput) {
  return prisma.subscriptionPlan.create({ data: input });
}

export async function createTransaction(input: CreateTransactionInput) {
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: input.planId, isActive: true },
  });
  if (!plan) throw new HttpError(404, "Subscription plan not found or inactive");

  return prisma.transaction.create({
    data: {
      userId: input.userId,
      planId: input.planId,
      midtransOrderId: input.midtransOrderId,
      amount: input.amount,
      paymentUrl: input.paymentUrl ?? null,
    },
    include: { plan: true },
  });
}

export async function listUserTransactions(userId: string) {
  return prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { plan: true, subscription: true },
  });
}

export async function handleMidtransWebhook(payload: MidtransWebhookPayload) {
  const transaction = await prisma.transaction.findUnique({
    where: { midtransOrderId: payload.order_id },
    include: { plan: true },
  });
  if (!transaction) throw new HttpError(404, "Transaction not found");

  const status = resolveStatus(payload.transaction_status, payload.fraud_status);

  await prisma.transaction.update({
    where: { id: transaction.id },
    data: { status },
  });

  if (status === "settlement") {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + transaction.plan.durationDays);

    await prisma.userSubscription.upsert({
      where: { transactionId: transaction.id },
      create: {
        userId: transaction.userId,
        planId: transaction.planId,
        transactionId: transaction.id,
        startDate,
        endDate,
        status: "active",
      },
      update: { status: "active", startDate, endDate },
    });

    // Expire previous active subscriptions for this user (excluding current)
    await prisma.userSubscription.updateMany({
      where: {
        userId: transaction.userId,
        status: "active",
        NOT: { transactionId: transaction.id },
        endDate: { lt: new Date() },
      },
      data: { status: "expired" },
    });
  }

  return { orderId: payload.order_id, status };
}

function resolveStatus(
  transactionStatus: string,
  fraudStatus?: string
): "pending" | "settlement" | "expire" | "cancel" {
  if (transactionStatus === "capture" && fraudStatus === "accept") return "settlement";
  if (transactionStatus === "settlement") return "settlement";
  if (transactionStatus === "expire") return "expire";
  if (transactionStatus === "cancel" || transactionStatus === "deny") return "cancel";
  return "pending";
}
