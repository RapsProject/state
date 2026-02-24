import type { RequestHandler } from "express";
import { ok } from "../utils/response";
import * as questionService from "../services/questionService";

export const listQuestions: RequestHandler = async (req, res, next) => {
  try {
    const { tryoutId, subjectId, topicId, limit } = req.query as Record<
      string,
      string | undefined
    >;

    // 1. Buat penampung filter kosong dengan tipe data yang sesuai
    const filters: {
      tryoutId?: string;
      subjectId?: string;
      topicId?: string;
      limit?: number;
    } = {};

    // 2. Isi penampung HANYA jika nilainya ada (tidak undefined)
    if (tryoutId) filters.tryoutId = tryoutId;
    if (subjectId) filters.subjectId = subjectId;
    if (topicId) filters.topicId = topicId;
    if (limit) filters.limit = Number(limit);

    // 3. Kirim objek filter yang sudah bersih
    const data = await questionService.listQuestions(filters);

    return res.json(ok("Operation successful", data));
  } catch (e) {
    return next(e);
  }
};

export const getQuestion: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params as { id: string };
    const data = await questionService.getQuestionById(id);
    return res.json(ok("Operation successful", data));
  } catch (e) {
    return next(e);
  }
};

export const createQuestion: RequestHandler = async (req, res, next) => {
  try {
    const data = await questionService.createQuestion(
      req.body as Parameters<typeof questionService.createQuestion>[0],
    );
    return res.status(201).json(ok("Question created", data));
  } catch (e) {
    return next(e);
  }
};

export const updateQuestion: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params as { id: string };
    const data = await questionService.updateQuestion(
      id,
      req.body as Parameters<typeof questionService.updateQuestion>[1],
    );
    return res.json(ok("Question updated", data));
  } catch (e) {
    return next(e);
  }
};

export const deleteQuestion: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params as { id: string };
    const data = await questionService.deleteQuestion(id);
    return res.json(ok("Question deleted", data));
  } catch (e) {
    return next(e);
  }
};
