import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import type { AuthEnv } from "../config/env.js";
import * as adminRepository from "../repositories/admin.repository.js";
import { UnauthorizedError } from "../utils/errors.js";

export async function login(
  username: string,
  plainPassword: string,
  authEnv: AuthEnv,
): Promise<string> {
  const admin = await adminRepository.findAdminByUsername(username);
  if (!admin) {
    throw new UnauthorizedError();
  }
  const match = await bcrypt.compare(plainPassword, admin.passwordHash);
  if (!match) {
    throw new UnauthorizedError();
  }

  return jwt.sign({ sub: admin.id }, authEnv.jwtSecret, {
    expiresIn: authEnv.jwtExpiresIn,
  } as SignOptions);
}

export function verifyAccessToken(
  token: string,
  authEnv: AuthEnv,
): { adminId: string } {
  try {
    const decoded = jwt.verify(token, authEnv.jwtSecret);
    if (
      typeof decoded !== "object" ||
      decoded === null ||
      typeof decoded.sub !== "string"
    ) {
      throw new UnauthorizedError("Invalid or expired token");
    }
    return { adminId: decoded.sub };
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
}
