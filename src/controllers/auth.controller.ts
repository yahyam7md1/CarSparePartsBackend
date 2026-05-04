import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import type { AuthEnv } from "../config/env.js";
import * as authService from "../services/auth.service.js";
import { loginBodySchema } from "../schemas/auth.schemas.js";
import { UnauthorizedError } from "../utils/errors.js";

export function createAuthController(authEnv: AuthEnv) {
  return {
    async login(req: Request, res: Response, next: NextFunction) {
      try {
        const body = loginBodySchema.parse(req.body);
        const token = await authService.login(
          body.username,
          body.password,
          authEnv,
        );
        res.json({ token });
      } catch (err) {
        if (err instanceof ZodError) {
          res.status(400).json({
            error: "Invalid request",
            details: err.flatten(),
          });
          return;
        }
        if (err instanceof UnauthorizedError) {
          res.status(401).json({ error: err.message });
          return;
        }
        next(err);
      }
    },
  };
}
