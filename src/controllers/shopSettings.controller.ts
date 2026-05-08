import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { patchShopSettingsBodySchema } from "../schemas/shopSettings.schemas.js";
import * as shopSettingsService from "../services/shopSettings.service.js";
import { HttpError } from "../utils/errors.js";

export async function getShopSettings(_req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await shopSettingsService.getAdminShopSettings();
    res.json({ settings });
  } catch (err) {
    next(err);
  }
}

export async function patchShopSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const body = patchShopSettingsBodySchema.parse(req.body);
    const settings = await shopSettingsService.patchAdminShopSettings(body);
    res.json({ settings });
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
