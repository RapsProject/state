import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { handleMidtransWebhook } from "../src/services/subscriptionService";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Mencari transaksi pending terbaru...");
  
  const latestPending = await prisma.transaction.findFirst({
    where: { status: "pending" },
    orderBy: { createdAt: "desc" },
    include: { plan: true },
  });

  if (!latestPending) {
    console.log("❌ Tidak ditemukan transaksi berstatus 'pending'.");
    await prisma.$disconnect();
    return;
  }

  console.log(`\n📦 Transaksi Pending Ditemukan:`);
  console.log(`   - ID Transaksi: ${latestPending.id}`);
  console.log(`   - Order ID Midtrans: ${latestPending.midtransOrderId}`);
  console.log(`   - Paket: ${latestPending.plan.name}`);
  console.log(`   - Harga: Rp${latestPending.amount.toLocaleString("id-ID")}`);
  console.log(`   - Dibuat: ${latestPending.createdAt}`);

  console.log("\n⚡ Mensimulasikan webhook Midtrans (status: settlement)...");
  
  const result = await handleMidtransWebhook({
    order_id: latestPending.midtransOrderId,
    transaction_status: "settlement",
  });

  console.log(`\n✅ Webhook Sukses Disimulasikan!`);
  console.log(`   - Order ID: ${result.orderId}`);
  console.log(`   - Status Akhir Transaksi: ${result.status}`);
  console.log(`\n🎉 Langganan user sekarang aktif! Silakan refresh halaman profil di frontend.`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
