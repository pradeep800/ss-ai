import z from "zod";
export const userValidator = z.object({
  email: z.string().min(1),
  id: z.string().min(1),
});
