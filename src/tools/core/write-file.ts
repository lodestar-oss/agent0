import * as z from "zod";
import { tool } from "ai";

export const writeFileToolInputSchema = z.object({
  path: z
    .string()
    .min(1, "Path cannot be empty")
    .describe(
      "The absolute path to the file to write. It will be created if it does not exist."
    ),
  content: z
    .string()
    .min(1, "Content cannot be empty")
    .describe("The content to write to the file."),
});

export type WriteFileToolInput = z.infer<typeof writeFileToolInputSchema>;

export async function writeFileToolExecuteFunction({
  path,
  content,
}: WriteFileToolInput) {
  try {
    await Bun.write(path, content);
  } catch (error) {
    throw new Error(`Unexpected error while writing file to ${path}.`);
  }
  return `File is successfully written to ${path}.`;
}

export const writeFileTool = tool({
  description:
    "Write content to a file. Creates a new file or overwrites an existing file.",
  inputSchema: writeFileToolInputSchema,
  execute: writeFileToolExecuteFunction,
});
