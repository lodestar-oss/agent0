import * as z from "zod";
import { tool } from "ai";
import { type Result, ok, err } from "neverthrow";
import type { UnexpectedError } from "@/types";

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
}: WriteFileToolInput): Promise<Result<string, UnexpectedError>> {
  try {
    await Bun.write(path, content);
    return ok(`File is successfully written to ${path}.`);
  } catch (rawError) {
    const error: UnexpectedError = {
      code: "UNEXPECTED_ERROR",
      message: "Unexpected error occurred while writing file.",
      cause: rawError,
      context: {
        filePath: path,
      },
    };
    return err(error);
  }
}

export const writeFileTool = tool({
  description:
    "Write content to a file. Creates a new file or overwrites an existing file.",
  inputSchema: writeFileToolInputSchema,
  execute: writeFileToolExecuteFunction,
  toModelOutput: ({ input, output }) => {
    if (output.isErr()) {
      console.error("\nWrite file tool call failed with error:");
      console.error(output.error);
      return {
        type: "error-json",
        value: {
          code: output.error.code,
          message: output.error.message,
          cause: String(output.error.cause),
          context: {
            path: input.path,
          },
        },
      };
    }

    return {
      type: "text",
      value: output.value,
    };
  },
});
