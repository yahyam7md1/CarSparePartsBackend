import type { Vehicle } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export async function findVehicleById(id: number): Promise<Vehicle | null> {
  return prisma.vehicle.findUnique({ where: { id } });
}

export async function listVehicles(params?: {
  skip?: number;
  take?: number;
  brand?: string;
}): Promise<Vehicle[]> {
  const where = params?.brand
    ? { brand: { equals: params.brand, mode: "insensitive" as const } }
    : {};
  return prisma.vehicle.findMany({
    where,
    orderBy: [{ brand: "asc" }, { series: "asc" }, { id: "asc" }],
    ...(params?.skip !== undefined ? { skip: params.skip } : {}),
    ...(params?.take !== undefined ? { take: params.take } : {}),
  });
}

export async function countVehicles(brand?: string): Promise<number> {
  const where = brand
    ? { brand: { equals: brand, mode: "insensitive" as const } }
    : {};
  return prisma.vehicle.count({ where });
}

export async function createVehicle(data: {
  nameEn: string;
  nameAr: string;
  brand: string;
  series: string;
  specifics: string;
  chassisCode: string;
  yearRange: string;
}): Promise<Vehicle> {
  return prisma.vehicle.create({ data });
}

export async function updateVehicle(
  id: number,
  data: {
    nameEn?: string;
    nameAr?: string;
    brand?: string;
    series?: string;
    specifics?: string;
    chassisCode?: string;
    yearRange?: string;
  },
): Promise<Vehicle> {
  return prisma.vehicle.update({ where: { id }, data });
}

export async function deleteVehicle(id: number): Promise<void> {
  await prisma.vehicle.delete({ where: { id } });
}
