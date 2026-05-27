import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Cek kondisi saat ini
  const existing = await prisma.subscriptionPlan.findMany();
  console.log("=== Plan yang ada sekarang ===");
  console.table(existing);

  // 2. Definisi plan yang seharusnya ada
  const expectedPlans = [
    { name: "Free", price: 0, durationDays: 0 },
    { name: "Premium", price: 99_000, durationDays: 30 },
    { name: "Ultimate", price: 129_000, durationDays: 30 },
  ];

  // 3. Upsert: buat yang hilang, update harga yang sudah ada
  for (const p of expectedPlans) {
    const found = existing.find((e) => e.name === p.name);
    if (!found) {
      console.log(`➕ Membuat plan "${p.name}" (belum ada)...`);
      await prisma.subscriptionPlan.create({
        data: { name: p.name, price: p.price, durationDays: p.durationDays, isActive: true },
      });
    } else {
      console.log(`✅ Plan "${p.name}" sudah ada (id: ${found.id}, price: ${found.price})`);
      // Update price jika berbeda
      if (found.price !== p.price) {
        console.log(`   🔄 Update harga dari ${found.price} ke ${p.price}`);
        await prisma.subscriptionPlan.update({
          where: { id: found.id },
          data: { price: p.price },
        });
      }
    }
  }

  // 4. Verifikasi hasil
  const result = await prisma.subscriptionPlan.findMany({ orderBy: { price: "asc" } });
  console.log("\n=== Plan setelah perbaikan ===");
  console.table(result);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
