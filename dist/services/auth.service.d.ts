import type { AuthEnv } from "../config/env.js";
export declare function login(username: string, plainPassword: string, authEnv: AuthEnv): Promise<string>;
export declare function verifyAccessToken(token: string, authEnv: AuthEnv): {
    adminId: string;
};
//# sourceMappingURL=auth.service.d.ts.map