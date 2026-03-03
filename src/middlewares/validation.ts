import type { RequestHandler } from "express";
import type { ZodSchema } from "zod";

export function validateBody<T>(schema: ZodSchema<T>): RequestHandler {
  return (req, _res, next) => {
    req.body = schema.parse(req.body);
    next();
  };
}

export function validateQuery<T>(schema: ZodSchema<T>): RequestHandler {
  return (req, _res, next) => {
    const parsed = schema.parse(req.query) as any;

    // Mutate the existing query object instead of reassigning the property.
    // This avoids "Cannot set property query of #<IncomingMessage>" errors
    // when `req.query` is defined with a getter but no setter.
    Object.keys(req.query as any).forEach((key) => {
      // Remove existing keys so we fully respect the Zod schema shape
      delete (req.query as any)[key];
    });
    Object.assign(req.query as any, parsed);

    next();
  };
}

export function validateParams<T>(schema: ZodSchema<T>): RequestHandler {
  return (req, _res, next) => {
    req.params = schema.parse(req.params) as any;
    next();
  };
}

