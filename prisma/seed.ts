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
      isPremium: mockTryout.is_premium,
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
