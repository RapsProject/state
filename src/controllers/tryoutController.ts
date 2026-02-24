import type { RequestHandler } from "express";
import { ok } from "../utils/response";
import * as tryoutService from "../services/tryoutService";

export const listTryouts: RequestHandler = async (req, res, next) => {
  try {
    const isAdmin = req.user?.role === "admin";
    const data = await tryoutService.listTryouts(!isAdmin);
    return res.json(ok("Operation successful", data));
  } catch (e) {
    return next(e);
  }
};

export const getTryout: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params as { id: string };
    const data = await tryoutService.getTryoutById(id, true);
    return res.json(ok("Operation successful", data));
  } catch (e) {
    return next(e);
  }
};

export const createTryout: RequestHandler = async (req, res, next) => {
  try {
    const data = await tryoutService.createTryout(req.body as Parameters<typeof tryoutService.createTryout>[0]);
    return res.status(201).json(ok("Tryout created", data));
  } catch (e) {
    return next(e);
  }
};

export const updateTryout: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params as { id: string };
    const data = await tryoutService.updateTryout(id, req.body as Parameters<typeof tryoutService.updateTryout>[1]);
    return res.json(ok("Tryout updated", data));
  } catch (e) {
    return next(e);
  }
};
