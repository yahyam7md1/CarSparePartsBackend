import type { NextFunction, Request, Response } from "express";
import * as statsService from "../services/stats.service.js";

export async function getAdminStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await statsService.getAdminStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
}
