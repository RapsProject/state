import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { fail } from "../utils/response";

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json(
      fail(
        err.issues
          .map((e) => {
            const path = e.path.map((p) => String(p)).join(".");
            return `${path || "request"}: ${e.message}`;
          })
          .join("; ")
      )
    );
  }

  const status =
    typeof err?.status === "number"
      ? err.status
      : err instanceof HttpError
        ? err.status
        : 500;

  const message =
    typeof err?.message === "string" && err.message.length > 0
      ? err.message
      : "Internal server error";

  return res.status(status).json(fail(message));
};

