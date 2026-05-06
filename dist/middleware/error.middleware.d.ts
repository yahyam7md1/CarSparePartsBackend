import type { NextFunction, Request, Response } from "express";
/**
 * Central Express error handler: maps known error types to JSON; avoids crashing the process.
 */
export declare function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void;
//# sourceMappingURL=error.middleware.d.ts.map