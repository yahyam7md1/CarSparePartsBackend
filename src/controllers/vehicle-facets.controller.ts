import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import * as vehicleRepository from "../repositories/vehicle.repository.js";
import {
  vehicleFacetsSeriesQuerySchema,
  vehicleFacetsVehiclesQuerySchema,
} from "../schemas/vehicle.schemas.js";

export async function listVehicleFacetBrands(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const brands = await vehicleRepository.listVehicleBrandsWithActiveCatalog();
    res.json({ brands });
  } catch (err) {
    next(err);
  }
}

export async function listVehicleFacetSeries(req: Request, res: Response, next: NextFunction) {
  try {
    const q = vehicleFacetsSeriesQuerySchema.parse(req.query);
    const series = await vehicleRepository.listVehicleSeriesForBrandWithActiveCatalog(q.brand);
    res.json({ series });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: "Invalid request", details: err.flatten() });
      return;
    }
    next(err);
  }
}

export async function listVehicleFacetVehicles(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const q = vehicleFacetsVehiclesQuerySchema.parse(req.query);
    const vehicles = await vehicleRepository.listVehiclesForFacets(q.brand, q.series);
    res.json({ vehicles });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: "Invalid request", details: err.flatten() });
      return;
    }
    next(err);
  }
}
