import type { RequestHandler } from "express";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const jwksRsa = require("jwks-rsa") as (options: { jwksUri: string; cache?: boolean; cacheMaxAge?: number }) => {
  getSigningKey: (kid: string) => Promise<{ getPublicKey: () => string }>;
};
import { env } from "../config/env";
import { HttpError } from "./error";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        claims: Record<string, unknown>;
        email?: string;
        fullName?: string;
        role?: string;
      };
    }
  }
}

type SupabaseJwtPayload = jwt.JwtPayload & {
  sub?: string;
  email?: string;
  role?: string;
};

const JWT_SECRET_HINT =
  "Pastikan SUPABASE_JWT_SECRET di backend .env sama dengan JWT Secret dari Supabase (Project Settings > API > JWT Secret), atau untuk Supabase Cloud pakai RS256 (issuer dari token).";

function getJwksUri(iss: string): string {
  const base = iss.replace(/\/$/, "");
  return `${base}/.well-known/jwks.json`;
}

export const authMiddleware: RequestHandler = async (req, _res, next) => {
  const header = req.header("authorization") ?? req.header("Authorization");
  if (!header) return next(new HttpError(401, "Missing Authorization header"));

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return next(new HttpError(401, "Invalid Authorization header format"));
  }

  try {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || typeof decoded === "string") {
      return next(new HttpError(401, "Invalid token format"));
    }

    const alg = (decoded.header as { alg?: string }).alg;
    const kid = (decoded.header as { kid?: string }).kid;
    const payload = decoded.payload as { iss?: string };

    if (alg === "RS256" || alg === "ES256") {
      const iss = payload?.iss;
      if (!iss || !kid) {
        return next(new HttpError(401, "Invalid token (missing iss or kid)"));
      }
      if (!iss.includes("supabase.co")) {
        return next(new HttpError(401, "Invalid token issuer"));
      }

      const jwksUri = getJwksUri(iss);
      const client = jwksRsa({ jwksUri, cache: true, cacheMaxAge: 600000 });
      const key = await client.getSigningKey(kid);
      const signingKey = key.getPublicKey();

      const verified = jwt.verify(token, signingKey, {
        algorithms: [alg as "RS256" | "ES256"],
      }) as SupabaseJwtPayload;

      const userId = verified.sub;
      if (!userId) return next(new HttpError(401, "Invalid token (missing sub)"));

      const claims = verified as Record<string, unknown>;
      const userMetadata = claims.user_metadata as Record<string, unknown> | undefined;
      req.user = {
        id: userId,
        claims,
        ...(verified.email ? { email: verified.email } : {}),
        ...(userMetadata?.full_name != null ? { fullName: String(userMetadata.full_name) } : {}),
        ...(verified.role ? { role: verified.role } : {}),
      };
      return next();
    }

    const verified = jwt.verify(token, env.SUPABASE_JWT_SECRET, {
      algorithms: ["HS256"],
    }) as SupabaseJwtPayload;
    const userId = verified.sub;
    if (!userId) return next(new HttpError(401, "Invalid token (missing sub)"));

    const claims = verified as Record<string, unknown>;
    const userMetadata = claims.user_metadata as Record<string, unknown> | undefined;
    req.user = {
      id: userId,
      claims,
      ...(verified.email ? { email: verified.email } : {}),
      ...(userMetadata?.full_name != null ? { fullName: String(userMetadata.full_name) } : {}),
      ...(verified.role ? { role: verified.role } : {}),
    };
    return next();
  } catch (e) {
    if (e instanceof TokenExpiredError) {
      return next(new HttpError(401, "Token expired. Please sign in again."));
    }
    if (e instanceof JsonWebTokenError) {
      const msg =
        env.NODE_ENV === "development"
          ? `Invalid token: ${e.message}. ${JWT_SECRET_HINT}`
          : "Invalid or expired token. Please sign in again.";
      return next(new HttpError(401, msg));
    }
    return next(e as Error);
  }
};
