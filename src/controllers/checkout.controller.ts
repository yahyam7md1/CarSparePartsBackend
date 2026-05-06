import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { whatsappCheckoutBodySchema } from "../schemas/whatsapp.schemas.js";
import { buildWhatsappCheckoutPayload } from "../services/whatsapp-order.service.js";

export async function postWhatsappCheckoutIntent(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = whatsappCheckoutBodySchema.parse(req.body);
    const result = buildWhatsappCheckoutPayload(body);
    res.status(200).json({
      message: result.message,
      waUrl: result.waUrl,
      total: result.total,
      currencySymbol: result.currencySymbol,
      ...(result.waUrl === null
        ? { waUrlConfigured: false as const }
        : { waUrlConfigured: true as const }),
    });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: "Invalid request", details: err.flatten() });
      return;
    }
    next(err);
  }
}
