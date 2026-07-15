import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  PORT: z.coerce.number().default(3000),

  OPENROUTER_API_KEY: z.string().min(1),

  OPENROUTER_BASE_URL: z.string().url(),

  OPENROUTER_MODEL: z.string().min(1),
});

export const env = envSchema.parse(process.env);