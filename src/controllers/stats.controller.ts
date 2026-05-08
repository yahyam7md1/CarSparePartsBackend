import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import * as statsService from "../services/stats.service.js";
import { HttpError } from "../utils/errors.js";
import {
  adminLowStockListQuerySchema,
  lowStockProductParamsSchema,
} from "../schemas/stats.schemas.js";

export async function getAdminStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await statsService.getAdminStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

export async function listAdminLowStockRows(req: Request, res: Response, next: NextFunction) {
  try {
    const q = adminLowStockListQuerySchema.parse(req.query);
    const rows = await statsService.listAdminLowStockRows({
      ...(q.page !== undefined ? { page: q.page } : {}),
      ...(q.limit !== undefined ? { limit: q.limit } : {}),
      ...(q.q !== undefined ? { q: q.q } : {}),
    });
    res.json(rows);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: "Invalid request", details: err.flatten() });
      return;
    }
    next(err);
  }
}

export async function ignoreLowStockRow(req: Request, res: Response, next: NextFunction) {
  try {
    const params = lowStockProductParamsSchema.parse(req.params);
    await statsService.ignoreLowStockProduct(params.id);
    res.status(204).send();
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: "Invalid request", details: err.flatten() });
      return;
    }
    if (err instanceof HttpError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    next(err);
  }
}
