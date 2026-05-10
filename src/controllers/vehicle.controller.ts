import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/errors.js";
import * as vehicleService from "../services/vehicle.service.js";
import {
  createVehicleBodySchema,
  mergeVehicleFitmentsBodySchema,
  updateVehicleBodySchema,
  vehicleIdParamsSchema,
  vehicleListQuerySchema,
} from "../schemas/vehicle.schemas.js";

export async function listVehicles(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const q = vehicleListQuerySchema.parse(req.query);
    const result = await vehicleService.listVehicles({
      ...(q.page !== undefined ? { page: q.page } : {}),
      ...(q.limit !== undefined ? { limit: q.limit } : {}),
      ...(q.brand !== undefined ? { brand: q.brand } : {}),
      ...(q.q !== undefined ? { q: q.q } : {}),
    });
    res.json({
      vehicles: result.items,
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: "Invalid request", details: err.flatten() });
      return;
    }
    next(err);
  }
}

export async function mergeVehicleFitments(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = mergeVehicleFitmentsBodySchema.parse(req.body);
    const result = await vehicleService.mergeVehicleFitments(
      body.sourceVehicleId,
      body.targetVehicleId,
    );
    res.json(result);
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

export async function getVehicle(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const params = vehicleIdParamsSchema.parse(req.params);
    const vehicle = await vehicleService.getVehicle(params.id);
    res.json({ vehicle });
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

export async function createVehicle(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = createVehicleBodySchema.parse(req.body);
    const vehicle = await vehicleService.createVehicle({
      brand: body.brand,
      series: body.series,
      specifics: body.specifics,
      yearRange: body.yearRange,
      ...(body.chassisCode !== undefined ? { chassisCode: body.chassisCode } : {}),
      ...(body.nameEn !== undefined ? { nameEn: body.nameEn } : {}),
      ...(body.nameAr !== undefined ? { nameAr: body.nameAr } : {}),
      ...(body.generation !== undefined ? { generation: body.generation } : {}),
    });
    res.status(201).json({ vehicle });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: "Invalid request", details: err.flatten() });
      return;
    }
    next(err);
  }
}

export async function updateVehicle(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const params = vehicleIdParamsSchema.parse(req.params);
    const body = updateVehicleBodySchema.parse(req.body);
    const vehicle = await vehicleService.updateVehicle(params.id, {
      ...(body.nameEn !== undefined ? { nameEn: body.nameEn } : {}),
      ...(body.nameAr !== undefined ? { nameAr: body.nameAr } : {}),
      ...(body.brand !== undefined ? { brand: body.brand } : {}),
      ...(body.series !== undefined ? { series: body.series } : {}),
      ...(body.specifics !== undefined ? { specifics: body.specifics } : {}),
      ...(body.chassisCode !== undefined ? { chassisCode: body.chassisCode } : {}),
      ...(body.yearRange !== undefined ? { yearRange: body.yearRange } : {}),
      ...(body.generation !== undefined ? { generation: body.generation } : {}),
    });
    res.json({ vehicle });
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

export async function deleteVehicle(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const params = vehicleIdParamsSchema.parse(req.params);
    await vehicleService.deleteVehicle(params.id);
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
