import * as authService from "../services/auth.service.js";
import { UnauthorizedError } from "../utils/errors.js";
function getBearerToken(header) {
    if (!header || !header.startsWith("Bearer ")) {
        return null;
    }
    const token = header.slice("Bearer ".length).trim();
    return token.length > 0 ? token : null;
}
export function createRequireAuth(authEnv) {
    return function requireAuth(req, res, next) {
        try {
            const token = getBearerToken(req.headers.authorization);
            if (!token) {
                throw new UnauthorizedError("Missing or invalid Authorization header");
            }
            const { adminId } = authService.verifyAccessToken(token, authEnv);
            req.adminId = adminId;
            next();
        }
        catch (err) {
            if (err instanceof UnauthorizedError) {
                res.status(401).json({ error: err.message });
                return;
            }
            next(err);
        }
    };
}
//# sourceMappingURL=auth.middleware.js.map