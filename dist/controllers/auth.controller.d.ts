import type { NextFunction, Request, Response } from "express";
import type { AuthEnv } from "../config/env.js";
export declare function createAuthController(authEnv: AuthEnv): {
    login(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=auth.controller.d.ts.map