import { z } from "zod";
export declare const chatSchema: z.ZodObject<{
    message: z.ZodString;
    sessionId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=chat.validator.d.ts.map