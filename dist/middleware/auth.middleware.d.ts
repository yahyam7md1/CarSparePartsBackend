import type { NextFunction, Request, Response } from "express";
import type { AuthEnv } from "../config/env.js";
export declare function createRequireAuth(authEnv: AuthEnv): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map