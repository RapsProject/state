import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import router from "./routes";
import { env } from "./config/env";
import { errorMiddleware } from "./middlewares/error";
import { ok } from "./utils/response";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN ?? true,
    credentials: true
  })
);
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));

const healthPayload = () => ok("Operation successful", { status: "ok" });
app.get("/health", (_req, res) => res.json(healthPayload()));
app.get("/api/health", (_req, res) => res.json(healthPayload()));

app.use(router);

app.use(errorMiddleware);

