import { z } from "zod";
export declare const loginBodySchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type LoginBody = z.infer<typeof loginBodySchema>;
//# sourceMappingURL=auth.schemas.d.ts.map