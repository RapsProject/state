import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),

  DATABASE_URL: z.string().min(1),
  // Prisma ORM v7 removed `directUrl` from schema/config.
  // Keep this optional for Supabase setups that still expose it.
  DIRECT_URL: z.string().min(1).optional(),

  SUPABASE_JWT_SECRET: z.string().min(1),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  CORS_ORIGIN: z.string().optional(),
  
  MIDTRANS_SERVER_KEY: z.string().optional(),
  MIDTRANS_CLIENT_KEY: z.string().optional(),
  MIDTRANS_IS_PRODUCTION: z.preprocess(
    (val) => val === "true" || val === "1" || val === true,
    z.boolean()
  ).default(false)
});

export const env = EnvSchema.parse(process.env);

export type Env = z.infer<typeof EnvSchema>;

