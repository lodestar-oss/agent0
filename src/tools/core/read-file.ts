import { ValidFilePathSchema } from "@/utils/file-validation";
import * as z from "zod";
import { tool } from "ai";

export const readFileToolInputSchema = z.object({
  path: ValidFilePathSchema.describe("The absolute path to the file to read."),
});

export type ReadFileToolInput = z.infer<typeof readFileToolInputSchema>;

export async function readFileToolExecuteFunction({ path }: ReadFileToolInput) {
  const file = Bun.file(path);
  const content = await file.text();
  return content;
}

export const readFileTool = tool({
  description: "Read the content of a file.",
  inputSchema: readFileToolInputSchema,
  execute: readFileToolExecuteFunction,
});
