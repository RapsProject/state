import type { Role } from "@prisma/client";

export type AuthUser = {
  id: string;
  email?: string;
  role?: Role;
  claims?: Record<string, unknown>;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

