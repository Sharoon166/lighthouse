import "server-only";
import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL must be a valid URL"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const missing = parsedEnv.error.issues
    .map((issue) => issue.path.join("."))
    .join(", ");
  throw new Error(`Invalid server environment variables: ${missing}`);
}

export const env = parsedEnv.data;
