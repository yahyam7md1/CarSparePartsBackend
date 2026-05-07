import type { Prisma, Vehicle } from "@prisma/client";
import { prisma } from "../lib/prisma.js";


const fitmentActiveProduct = {
  some: { product: { isActive: true } },
};

function buildVehicleAdminWhere(params: { brand?: string; q?: string }): Prisma.VehicleWhereInput {
  const and: Prisma.VehicleWhereInput[] = [];
  if (params.brand !== undefined) {
    and.push({ brand: { equals: params.brand, mode: "insensitive" } });
  }
  if (params.q !== undefined) {
    const s = params.q.trim();
    and.push({
      OR: [
        { brand: { contains: s, mode: "insensitive" } },
        { series: { contains: s, mode: "insensitive" } },
        { specifics: { contains: s, mode: "insensitive" } },
        { chassisCode: { contains: s, mode: "insensitive" } },
        { yearRange: { contains: s, mode: "insensitive" } },
        { nameEn: { contains: s, mode: "insensitive" } },
        { nameAr: { contains: s, mode: "insensitive" } },
      ],
    });
  }
  if (and.length === 0) {
    return {};
  }
  if (and.length === 1) {
    return and[0]!;
  }
  return { AND: and };
}

const adminListInclude = {
  _count: { select: { fitments: true } },
} satisfies Prisma.VehicleInclude;

export type VehicleAdminListRow = Prisma.VehicleGetPayload<{ include: typeof adminListInclude }>;

export async function findVehicleById(id: number): Promise<Vehicle | null> {
  return prisma.vehicle.findUnique({ where: { id } });
}

export async function listVehiclesAdmin(params: {
  skip?: number;
  take?: number;
  brand?: string;
  q?: string;
}): Promise<VehicleAdminListRow[]> {
  const where = buildVehicleAdminWhere({
    ...(params.brand !== undefined ? { brand: params.brand } : {}),
    ...(params.q !== undefined ? { q: params.q } : {}),
  });
  return prisma.vehicle.findMany({
    where,
    orderBy: [{ brand: "asc" }, { series: "asc" }, { id: "asc" }],
    ...(params.skip !== undefined ? { skip: params.skip } : {}),
    ...(params.take !== undefined ? { take: params.take } : {}),
    include: adminListInclude,
  });
}

export async function countVehiclesAdmin(params: { brand?: string; q?: string }): Promise<number> {
  const where = buildVehicleAdminWhere({
    ...(params.brand !== undefined ? { brand: params.brand } : {}),
    ...(params.q !== undefined ? { q: params.q } : {}),
  });
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

export async function listVehicleBrandsWithActiveCatalog(): Promise<string[]> {
  const rows = await prisma.vehicle.groupBy({
    by: ["brand"],
    where: { fitments: fitmentActiveProduct },
    orderBy: { brand: "asc" },
  });
  return rows.map((r) => r.brand);
}

export async function listVehicleSeriesForBrandWithActiveCatalog(brand: string): Promise<string[]> {
  const rows = await prisma.vehicle.groupBy({
    by: ["series"],
    where: {
      brand: { equals: brand, mode: "insensitive" },
      fitments: fitmentActiveProduct,
    },
    orderBy: { series: "asc" },
  });
  return rows.map((r) => r.series);
}

export type VehicleFacetRow = {
  id: number;
  brand: string;
  series: string;
  specifics: string;
  chassisCode: string;
  yearRange: string;
  nameEn: string;
  nameAr: string;
};

export async function listVehiclesForFacets(brand: string, series: string): Promise<VehicleFacetRow[]> {
  return prisma.vehicle.findMany({
    where: {
      brand: { equals: brand, mode: "insensitive" },
      series: { equals: series, mode: "insensitive" },
      fitments: fitmentActiveProduct,
    },
    select: {
      id: true,
      brand: true,
      series: true,
      specifics: true,
      chassisCode: true,
      yearRange: true,
      nameEn: true,
      nameAr: true,
    },
    orderBy: [{ chassisCode: "asc" }, { id: "asc" }],
  });
}
