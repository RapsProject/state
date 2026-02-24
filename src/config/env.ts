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
  CORS_ORIGIN: z.string().optional()
});

export const env = EnvSchema.parse(process.env);

export type Env = z.infer<typeof EnvSchema>;

