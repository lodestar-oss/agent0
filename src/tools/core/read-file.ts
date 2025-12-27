import { readFileContent } from "@/utils/file-io";
import { validateFilePath } from "@/utils/file-validation";
import * as z from "zod";
import { tool } from "ai";

export const readFileToolInputSchema = z.object({
  path: z.string().describe("The absolute path to the file to read."),
});

export type ReadFileToolInput = z.infer<typeof readFileToolInputSchema>;

export async function readFileToolExecuteFunction({ path }: ReadFileToolInput) {
  const filePathValidationResult = await validateFilePath(path);

  if (filePathValidationResult.isErr()) {
    console.error(filePathValidationResult.error);
    return filePathValidationResult.error.message;
  }

  const validFilePath = filePathValidationResult.value;
  const fileContent = await readFileContent(validFilePath);
  return fileContent;
}

export const readFileTool = tool({
  description: "Read the content of a file.",
  inputSchema: readFileToolInputSchema,
  execute: readFileToolExecuteFunction,
});
