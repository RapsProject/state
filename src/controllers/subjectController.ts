import type { RequestHandler } from "express";
import { ok } from "../utils/response";
import * as subjectService from "../services/subjectService";

export const listSubjects: RequestHandler = async (_req, res, next) => {
  try {
    const data = await subjectService.listSubjects();
    return res.json(ok("Operation successful", data));
  } catch (e) {
    return next(e);
  }
};

export const createSubject: RequestHandler = async (req, res, next) => {
  try {
    const data = await subjectService.createSubject(req.body as { name: string; description?: string });
    return res.status(201).json(ok("Subject created", data));
  } catch (e) {
    return next(e);
  }
};

export const listTopics: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params as { id: string };
    const data = await subjectService.listTopics(id);
    return res.json(ok("Operation successful", data));
  } catch (e) {
    return next(e);
  }
};

export const createTopic: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params as { id: string };
    const { name } = req.body as { name: string };
    const data = await subjectService.createTopic(id, name);
    return res.status(201).json(ok("Topic created", data));
  } catch (e) {
    return next(e);
  }
};
