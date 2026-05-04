import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Username requis"),
  password: z.string().min(1, "Password requis"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;