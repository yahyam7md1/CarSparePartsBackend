import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { HttpError, UnauthorizedError } from "../utils/errors.js";
function prismaClientMessage(code) {
    switch (code) {
        case "P2002":
            return "A record with this value already exists.";
        case "P2003":
            return "Invalid reference (related record missing).";
        case "P2025":
            return "Record not found.";
        case "P2014":
            return "Invalid relation on this record.";
        default:
            return "Database request could not be completed.";
    }
}
function prismaClientStatus(code) {
    switch (code) {
        case "P2002":
            return 409;
        case "P2003":
            return 400;
        case "P2025":
            return 404;
        default:
            return 400;
    }
}
/**
 * Central Express error handler: maps known error types to JSON; avoids crashing the process.
 */
export function errorHandler(err, _req, res, _next) {
    if (res.headersSent) {
        return;
    }
    if (err instanceof HttpError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
    }
    if (err instanceof UnauthorizedError) {
        res.status(401).json({ error: err.message });
        return;
    }
    if (err instanceof ZodError) {
        res.status(400).json({ error: "Invalid request", details: err.flatten() });
        return;
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        const status = prismaClientStatus(err.code);
        res.status(status).json({ error: prismaClientMessage(err.code) });
        return;
    }
    if (err instanceof Prisma.PrismaClientValidationError) {
        res.status(400).json({ error: "Invalid data or query" });
        return;
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
}
//# sourceMappingURL=error.middleware.js.map