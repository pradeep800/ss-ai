import z from "zod";
export const aiRouteValidator = z.object({
  message: z.string().max(1500).min(1),
  questionNumber: z.number(),
});
