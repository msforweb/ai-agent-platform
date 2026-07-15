import { z } from "zod";

export const ChatRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(10000, "Message is too long"),
});

export type ChatRequestDto = z.infer<typeof ChatRequestSchema>;