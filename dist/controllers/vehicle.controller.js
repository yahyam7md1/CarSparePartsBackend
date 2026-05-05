import { ZodError } from "zod";
import { HttpError } from "../utils/errors.js";
import * as vehicleService from "../services/vehicle.service.js";
import { createVehicleBodySchema, updateVehicleBodySchema, vehicleIdParamsSchema, vehicleListQuerySchema, } from "../schemas/vehicle.schemas.js";
export async function listVehicles(req, res, next) {
    try {
        const q = vehicleListQuerySchema.parse(req.query);
        const result = await vehicleService.listVehicles({
            ...(q.page !== undefined ? { page: q.page } : {}),
            ...(q.limit !== undefined ? { limit: q.limit } : {}),
            ...(q.brand !== undefined ? { brand: q.brand } : {}),
        });
        res.json({
            vehicles: result.items,
            total: result.total,
            page: result.page,
            limit: result.limit,
        });
    }
    catch (err) {
        if (err instanceof ZodError) {
            res.status(400).json({ error: "Invalid request", details: err.flatten() });
            return;
        }
        next(err);
    }
}
export async function getVehicle(req, res, next) {
    try {
        const params = vehicleIdParamsSchema.parse(req.params);
        const vehicle = await vehicleService.getVehicle(params.id);
        res.json({ vehicle });
    }
    catch (err) {
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
export async function createVehicle(req, res, next) {
    try {
        const body = createVehicleBodySchema.parse(req.body);
        const vehicle = await vehicleService.createVehicle(body);
        res.status(201).json({ vehicle });
    }
    catch (err) {
        if (err instanceof ZodError) {
            res.status(400).json({ error: "Invalid request", details: err.flatten() });
            return;
        }
        next(err);
    }
}
export async function updateVehicle(req, res, next) {
    try {
        const params = vehicleIdParamsSchema.parse(req.params);
        const body = updateVehicleBodySchema.parse(req.body);
        const vehicle = await vehicleService.updateVehicle(params.id, {
            ...(body.brand !== undefined ? { brand: body.brand } : {}),
            ...(body.series !== undefined ? { series: body.series } : {}),
            ...(body.specifics !== undefined ? { specifics: body.specifics } : {}),
            ...(body.chassisCode !== undefined ? { chassisCode: body.chassisCode } : {}),
            ...(body.yearRange !== undefined ? { yearRange: body.yearRange } : {}),
        });
        res.json({ vehicle });
    }
    catch (err) {
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
export async function deleteVehicle(req, res, next) {
    try {
        const params = vehicleIdParamsSchema.parse(req.params);
        await vehicleService.deleteVehicle(params.id);
        res.status(204).send();
    }
    catch (err) {
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
//# sourceMappingURL=vehicle.controller.js.map