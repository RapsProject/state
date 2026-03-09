/// <reference types="node" />
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import {
  mockSubjects,
  mockTopics,
  mockTryout,
  mockQuestions,
} from "../src/lib/mockData";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Memulai proses seeding...");

  // 1. Insert Subjects (Tidak perlu mapping karena key-nya sudah sama: id, name, description)
  console.log("Memasukkan data Subjects...");
  await prisma.subject.createMany({
    data: mockSubjects,
    skipDuplicates: true,
  });

  // 2. Insert Topics (Mapping subject_id -> subjectId)
  console.log("Memasukkan data Topics...");
  const mappedTopics = mockTopics.map((t) => ({
    id: t.id,
    name: t.name,
    subjectId: t.subject_id,
  }));
  await prisma.topic.createMany({
    data: mappedTopics,
    skipDuplicates: true,
  });

  // 3. Insert Tryout (Mapping camelCase keys)
  console.log("Memasukkan data Tryout...");
  await prisma.tryout.upsert({
    where: { id: mockTryout.id },
    update: {},
    create: {
      id: mockTryout.id,
      title: mockTryout.title,
      type: mockTryout.type as any, // 'simulation'
      durationMinutes: mockTryout.duration_minutes,
      maxAttempts: mockTryout.max_attempts,
      access: mockTryout.is_premium ? "premium" : "free",
      isPublished: mockTryout.is_published,
    },
  });

  // 4. Insert Questions & Options (Nested mapping)
  console.log("Memasukkan data Questions & Options...");
  for (const q of mockQuestions) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: {
        id: q.id,
        tryoutId: q.tryout_id,
        subjectId: q.subject_id,
        topicId: q.topic_id,
        sequenceNumber: q.sequence_number,
        text: q.text,
        imageUrl: q.image_url,
        explanation: q.explanation,
        // Insert opsi sekaligus mapping
        options: {
          create: q.options.map((o) => ({
            id: o.id,
            sequenceNumber: o.sequence_number,
            text: o.text,
            isCorrect: o.is_correct,
          })),
        },
      },
    });
  }

  // 5. Subscription plans: Free, Premium, Ultimate
  console.log("Memasukkan data Subscription Plans...");
  const planData = [
    { name: "Free", price: 0, durationDays: 0 },
    { name: "Premium", price: 349_000, durationDays: 30 },
    { name: "Ultimate", price: 599_000, durationDays: 30 },
  ];
  for (const p of planData) {
    const existing = await prisma.subscriptionPlan.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.subscriptionPlan.create({
        data: { name: p.name, price: p.price, durationDays: p.durationDays, isActive: true },
      });
    }
  }

  // 6. Beri Premium ke semua user yang ada (untuk testing)
  console.log("Memberi subscription Premium ke semua user...");
  const premiumPlan = await prisma.subscriptionPlan.findFirst({
    where: { name: "Premium", isActive: true },
  });
  if (!premiumPlan) {
    console.log("  (Plan Premium tidak ditemukan, skip.)");
  } else {
    const profiles = await prisma.profile.findMany({
      select: { id: true, fullName: true },
    });
    let granted = 0;
    for (const profile of profiles) {
      const existingActive = await prisma.userSubscription.findFirst({
        where: { userId: profile.id, status: "active" },
      });
      if (existingActive) {
        continue;
      }
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + premiumPlan.durationDays);
      const midtransOrderId = `manual-test-${profile.id}-${Date.now()}-${granted}`;
      const transaction = await prisma.transaction.create({
        data: {
          userId: profile.id,
          planId: premiumPlan.id,
          midtransOrderId,
          amount: 0,
          status: "settlement",
          paymentUrl: null,
        },
      });
      await prisma.userSubscription.create({
        data: {
          userId: profile.id,
          userName: profile.fullName ?? null,
          planId: premiumPlan.id,
          planName: premiumPlan.name,
          transactionId: transaction.id,
          startDate,
          endDate,
          status: "active",
        },
      });
      granted += 1;
    }
    console.log(`  Diberikan Premium ke ${granted} user.`);
  }

  // 7. Backfill userName & planName untuk subscription yang masih null
  const toBackfill = await prisma.userSubscription.findMany({
    where: { OR: [{ userName: null }, { planName: null }] },
    include: { profile: { select: { fullName: true } }, plan: { select: { name: true } } },
  });
  for (const sub of toBackfill) {
    await prisma.userSubscription.update({
      where: { id: sub.id },
      data: {
        userName: sub.profile.fullName ?? sub.userName,
        planName: sub.plan.name,
      },
    });
  }
  if (toBackfill.length > 0) {
    console.log(`  Backfill nama untuk ${toBackfill.length} subscription.`);
  }

  console.log("✅ Seeding selesai dengan sukses!");
}

main()
  .catch((e) => {
    console.error("❌ Terjadi kesalahan saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
