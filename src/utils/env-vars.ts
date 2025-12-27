import { createEnv } from "@t3-oss/env-core";
import * as z from "zod";

export const envVars = createEnv({
  server: {
    GROQ_API_KEY: z.string().min(1),
  },
  runtimeEnv: Bun.env,
});
