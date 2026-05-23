import { prisma } from "../config/prisma";
import { HttpError } from "../middlewares/error";
import { env } from "../config/env";

export type CreatePlanInput = {
  name: string;
  price: number;
  durationDays: number;
};

export type CreateTransactionInput = {
  userId: string;
  planId: string;
  email: string;
  fullName: string;
  phone?: string;
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

  if (!env.MIDTRANS_SERVER_KEY) {
    throw new HttpError(500, "Midtrans Server Key is not configured.");
  }

  const orderId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const midtransUrl = env.MIDTRANS_IS_PRODUCTION
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";

  const payload = {
    transaction_details: {
      order_id: orderId,
      gross_amount: plan.price,
    },
    customer_details: {
      first_name: input.fullName,
      email: input.email,
      phone: input.phone || "",
    },
    credit_card: { secure: true },
  };

  const response = await fetch(midtransUrl, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Basic ${Buffer.from(env.MIDTRANS_SERVER_KEY + ":").toString("base64")}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Midtrans Error:", errorText);
    throw new HttpError(500, "Failed to create transaction with Midtrans");
  }

  const midtransData = await response.json() as { token: string; redirect_url: string };

  const transaction = await prisma.transaction.create({
    data: {
      userId: input.userId,
      planId: input.planId,
      midtransOrderId: orderId,
      amount: plan.price,
      paymentUrl: midtransData.redirect_url,
    },
    include: { plan: true },
  });

  return {
    ...transaction,
    snapToken: midtransData.token,
  };
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

    const profile = await prisma.profile.findUnique({
      where: { id: transaction.userId },
      select: { fullName: true },
    });
    const userName = profile?.fullName ?? null;
    const planName = transaction.plan.name;

    await prisma.userSubscription.upsert({
      where: { transactionId: transaction.id },
      create: {
        userId: transaction.userId,
        userName,
        planId: transaction.planId,
        planName,
        transactionId: transaction.id,
        startDate,
        status: "active",
      },
      update: { status: "active", startDate, userName, planName },
    });

    // Expire previous active subscriptions for this user (excluding current)
    await prisma.userSubscription.updateMany({
      where: {
        userId: transaction.userId,
        status: "active",
        NOT: { transactionId: transaction.id },
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
