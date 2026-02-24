/**
 * Cek env state (backend). Jalankan dari folder state: node scripts/check-env.js
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const required = ["DATABASE_URL", "SUPABASE_JWT_SECRET"];
const optional = ["PORT", "NODE_ENV", "DIRECT_URL", "CORS_ORIGIN"];

const missing = required.filter((k) => !process.env[k]?.trim());
if (missing.length > 0) {
  console.error("❌ state env: missing required:", missing.join(", "));
  process.exit(1);
}

console.log("✅ state env OK");
console.log("   DATABASE_URL: set (" + (process.env.DATABASE_URL?.length ?? 0) + " chars)");
console.log("   SUPABASE_JWT_SECRET: set (" + (process.env.SUPABASE_JWT_SECRET?.length ?? 0) + " chars)");
optional.forEach((k) => {
  const v = process.env[k];
  console.log("   " + k + ":", v ? (k.includes("URL") || k.includes("SECRET") ? "set" : v) : "(not set)");
});
