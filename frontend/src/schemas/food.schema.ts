import { z } from "zod";
z.config(z.locales.fr());

export const foodSchema = z.object({
  name : z.string().min(1).max(35),
  category: z.string().min(1).max(30),
  quantity: z.number().min(0),
  unit: z.string().min(1).max(20),
  expirationDate: z.iso.date(),
  location: z.string().min(1).max(50),
  minimumQuantity: z.number().min(0),
  notes: z.string().max(200).optional(),
})