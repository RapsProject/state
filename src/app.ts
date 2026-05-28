import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import router from "./routes";
import { env } from "./config/env";
import { errorMiddleware } from "./middlewares/error";
import { ok } from "./utils/response";

export const app = express();
const allowedOrigins = (env.CORS_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (allowedOrigins.length === 0 || origin == null || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Return false instead of throwing an Error to prevent crashing the server on external requests
      return callback(null, false);
    },
    credentials: true
  })
);
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));

const healthPayload = () => ok("Operation successful", { status: "ok" });

app.get("/", (_req, res) => {
  res.json(healthPayload());
});

app.get("/health", (_req, res) => res.json(healthPayload()));
app.get("/api/health", (_req, res) => res.json(healthPayload()));

app.use(router);

app.use(errorMiddleware);

export default app;

//test for merging 5
