import type { Admin } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export async function findAdminByUsername(
  username: string,
): Promise<Admin | null> {
  return prisma.admin.findUnique({ where: { username } });
}

export async function findAdminById(id: string): Promise<Admin | null> {
  return prisma.admin.findUnique({ where: { id } });
}
