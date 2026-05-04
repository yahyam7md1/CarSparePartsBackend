import type { NextFunction, Request, Response } from "express";
import type { AuthEnv } from "../config/env.js";
import * as authService from "../services/auth.service.js";
import { UnauthorizedError } from "../utils/errors.js";

function getBearerToken(header: string | undefined): string | null {
  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }
  const token = header.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}

export function createRequireAuth(authEnv: AuthEnv) {
  return function requireAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const token = getBearerToken(req.headers.authorization);
      if (!token) {
        throw new UnauthorizedError("Missing or invalid Authorization header");
      }
      const { adminId } = authService.verifyAccessToken(token, authEnv);
      req.adminId = adminId;
      next();
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        res.status(401).json({ error: err.message });
        return;
      }
      next(err);
    }
  };
}
