import { prisma } from "../lib/prisma.js";
export async function findVehicleById(id) {
    return prisma.vehicle.findUnique({ where: { id } });
}
export async function listVehicles(params) {
    const where = params?.brand
        ? { brand: { equals: params.brand, mode: "insensitive" } }
        : {};
    return prisma.vehicle.findMany({
        where,
        orderBy: [{ brand: "asc" }, { series: "asc" }, { id: "asc" }],
        ...(params?.skip !== undefined ? { skip: params.skip } : {}),
        ...(params?.take !== undefined ? { take: params.take } : {}),
    });
}
export async function countVehicles(brand) {
    const where = brand
        ? { brand: { equals: brand, mode: "insensitive" } }
        : {};
    return prisma.vehicle.count({ where });
}
export async function createVehicle(data) {
    return prisma.vehicle.create({ data });
}
export async function updateVehicle(id, data) {
    return prisma.vehicle.update({ where: { id }, data });
}
export async function deleteVehicle(id) {
    await prisma.vehicle.delete({ where: { id } });
}
//# sourceMappingURL=vehicle.repository.js.map