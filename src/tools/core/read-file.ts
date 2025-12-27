import * as z from "zod";
import { tool } from "ai";
import { validateFilePath } from "@/utils/file-validation";

export const readFileToolInputSchema = z.object({
  path: z
    .string()
    .min(1, "Path cannot be empty")
    .describe("The absolute path to the file to read."),
});

export type ReadFileToolInput = z.infer<typeof readFileToolInputSchema>;

export async function readFileToolExecuteFunction({ path }: ReadFileToolInput) {
  const validatePathResult = await validateFilePath(path);
  if (validatePathResult.isErr()) {
    throw new Error(validatePathResult.error.message);
  }
  const validPath = validatePathResult.value;

  const file = Bun.file(validPath);
  const content = await file.text();
  return content;
}

export const readFileTool = tool({
  description: "Read the content of a file.",
  inputSchema: readFileToolInputSchema,
  execute: readFileToolExecuteFunction,
});
