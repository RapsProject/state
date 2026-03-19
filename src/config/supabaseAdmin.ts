import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

export function getSupabaseAdmin() {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di .env. " +
      "Dapatkan service_role key dari: Supabase Dashboard → Settings → API."
    );
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
