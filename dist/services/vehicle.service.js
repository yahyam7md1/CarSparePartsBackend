import { HttpError } from "../utils/errors.js";
import * as vehicleRepository from "../repositories/vehicle.repository.js";
export async function listVehicles(q) {
    const limit = Math.min(Math.max(q.limit ?? 50, 1), 200);
    const page = Math.max(q.page ?? 1, 1);
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
        vehicleRepository.listVehicles({
            skip,
            take: limit,
            ...(q.brand !== undefined ? { brand: q.brand } : {}),
        }),
        vehicleRepository.countVehicles(q.brand),
    ]);
    return { items, total, page, limit };
}
export async function getVehicle(id) {
    const v = await vehicleRepository.findVehicleById(id);
    if (!v) {
        throw new HttpError(404, "Vehicle not found");
    }
    return v;
}
export async function createVehicle(input) {
    return vehicleRepository.createVehicle({
        brand: input.brand.trim(),
        series: input.series.trim(),
        specifics: input.specifics.trim(),
        chassisCode: input.chassisCode.trim(),
        yearRange: input.yearRange.trim(),
    });
}
export async function updateVehicle(id, input) {
    await getVehicle(id);
    const data = {};
    if (input.brand !== undefined) {
        data.brand = input.brand.trim();
    }
    if (input.series !== undefined) {
        data.series = input.series.trim();
    }
    if (input.specifics !== undefined) {
        data.specifics = input.specifics.trim();
    }
    if (input.chassisCode !== undefined) {
        data.chassisCode = input.chassisCode.trim();
    }
    if (input.yearRange !== undefined) {
        data.yearRange = input.yearRange.trim();
    }
    return vehicleRepository.updateVehicle(id, data);
}
export async function deleteVehicle(id) {
    await getVehicle(id);
    await vehicleRepository.deleteVehicle(id);
}
//# sourceMappingURL=vehicle.service.js.map