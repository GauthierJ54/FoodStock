import { z } from "zod";
z.config(z.locales.fr()); // Set the locale to French for error messages

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});