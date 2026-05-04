import { prisma } from "../lib/prisma.js";
export async function findAdminByUsername(username) {
    return prisma.admin.findUnique({ where: { username } });
}
export async function findAdminById(id) {
    return prisma.admin.findUnique({ where: { id } });
}
//# sourceMappingURL=admin.repository.js.map