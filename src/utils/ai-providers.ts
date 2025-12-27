import { envVars } from "@/utils/env-vars";
import { createGroq } from "@ai-sdk/groq";

export const groq = createGroq({
  apiKey: envVars.GROQ_API_KEY,
});
