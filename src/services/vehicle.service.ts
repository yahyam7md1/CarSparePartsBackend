import type { Vehicle } from "@prisma/client";
import { HttpError } from "../utils/errors.js";
import * as productRepository from "../repositories/product.repository.js";
import * as vehicleRepository from "../repositories/vehicle.repository.js";

export type VehicleAdminDto = Vehicle & { fitmentCount: number };

export async function listVehicles(q: {
  page?: number;
  limit?: number;
  brand?: string;
  q?: string;
}): Promise<{ items: VehicleAdminDto[]; total: number; page: number; limit: number }> {
  const limit = Math.min(Math.max(q.limit ?? 50, 1), 200);
  const page = Math.max(q.page ?? 1, 1);
  const skip = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    vehicleRepository.listVehiclesAdmin({
      skip,
      take: limit,
      ...(q.brand !== undefined ? { brand: q.brand } : {}),
      ...(q.q !== undefined ? { q: q.q } : {}),
    }),
    vehicleRepository.countVehiclesAdmin({
      ...(q.brand !== undefined ? { brand: q.brand } : {}),
      ...(q.q !== undefined ? { q: q.q } : {}),
    }),
  ]);
  const items = rows.map(({ _count, ...vehicle }) => ({
    ...vehicle,
    fitmentCount: _count.fitments,
  }));
  return { items, total, page, limit };
}

export async function getVehicle(id: number): Promise<Vehicle> {
  const v = await vehicleRepository.findVehicleById(id);
  if (!v) {
    throw new HttpError(404, "Vehicle not found");
  }
  return v;
}

export async function createVehicle(input: {
  nameEn?: string;
  nameAr?: string;
  brand: string;
  series: string;
  specifics: string;
  chassisCode: string;
  yearRange: string;
}): Promise<Vehicle> {
  return vehicleRepository.createVehicle({
    nameEn: (input.nameEn ?? "").trim(),
    nameAr: (input.nameAr ?? "").trim(),
    brand: input.brand.trim(),
    series: input.series.trim(),
    specifics: input.specifics.trim(),
    chassisCode: input.chassisCode.trim(),
    yearRange: input.yearRange.trim(),
  });
}

export async function updateVehicle(
  id: number,
  input: {
    nameEn?: string;
    nameAr?: string;
    brand?: string;
    series?: string;
    specifics?: string;
    chassisCode?: string;
    yearRange?: string;
  },
): Promise<Vehicle> {
  await getVehicle(id);
  const data: Parameters<typeof vehicleRepository.updateVehicle>[1] = {};
  if (input.nameEn !== undefined) {
    data.nameEn = input.nameEn.trim();
  }
  if (input.nameAr !== undefined) {
    data.nameAr = input.nameAr.trim();
  }
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

export async function deleteVehicle(id: number): Promise<void> {
  await getVehicle(id);
  await vehicleRepository.deleteVehicle(id);
}

export async function mergeVehicleFitments(
  sourceVehicleId: number,
  targetVehicleId: number,
): Promise<{ fitmentsCreated: number }> {
  if (sourceVehicleId === targetVehicleId) {
    throw new HttpError(400, "sourceVehicleId and targetVehicleId must differ");
  }
  await getVehicle(sourceVehicleId);
  await getVehicle(targetVehicleId);
  return productRepository.mergeFitmentsFromSourceVehicleToTargetVehicle(
    sourceVehicleId,
    targetVehicleId,
  );
}
