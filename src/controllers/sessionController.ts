import type { RequestHandler } from "express";
import { ok } from "../utils/response";
import * as sessionService from "../services/sessionService";

export const startSession: RequestHandler = async (req, res, next) => {
  try {
    const { tryoutId } = req.body as { tryoutId: string };
    const user = req.user!;
    const session = await sessionService.startSession(user.id, tryoutId, {
      email: user.email,
      fullName: user.fullName,
    });
    return res.status(201).json(ok("Session started", session));
  } catch (e) {
    return next(e);
  }
};

export const saveAnswer: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params as { id: string };
    const { questionId, optionId, isMarkedForReview } = req.body as {
      questionId: string;
      optionId: string | null;
      isMarkedForReview?: boolean;
    };
    const answer = await sessionService.saveAnswer(
      id,
      req.user!.id,
      questionId,
      optionId ?? null,
      isMarkedForReview ?? false
    );
    return res.json(ok("Answer saved", answer));
  } catch (e) {
    return next(e);
  }
};

export const submitSession: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params as { id: string };
    const result = await sessionService.submitSession(id, req.user!.id);
    return res.json(ok("Session submitted", result));
  } catch (e) {
    return next(e);
  }
};

export const getSession: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params as { id: string };
    const session = await sessionService.getSession(id, req.user!.id);
    return res.json(ok("Operation successful", session));
  } catch (e) {
    return next(e);
  }
};

export const listSessions: RequestHandler = async (req, res, next) => {
  try {
    const sessions = await sessionService.listUserSessions(req.user!.id);
    return res.json(ok("Operation successful", sessions));
  } catch (e) {
    return next(e);
  }
};
