import * as z from "zod";
import { tool } from "ai";
import { validateFilePath } from "@/utils/file-validation";
import { err, ok, Result } from "neverthrow";
import type { FileDoesNotExistError, UnexpectedError } from "@/types";

export const readFileToolInputSchema = z.object({
  path: z
    .string()
    .min(1, "Path cannot be empty")
    .describe("The absolute path to the file to read."),
});

export type ReadFileToolInput = z.infer<typeof readFileToolInputSchema>;

export async function readFileToolExecuteFunction({
  path,
}: ReadFileToolInput): Promise<
  Result<string, FileDoesNotExistError | UnexpectedError>
> {
  const validatePathResult = await validateFilePath(path);
  if (validatePathResult.isErr()) {
    return err(validatePathResult.error);
  }
  const validPath = validatePathResult.value;

  try {
    const file = Bun.file(validPath);
    const content = await file.text();
    return ok(content);
  } catch (rawError) {
    const error: UnexpectedError = {
      code: "UNEXPECTED_ERROR",
      message: "Unexpected error occurred while reading file.",
      cause: rawError,
      context: {
        filePath: path,
      },
    };
    return err(error);
  }
}

export const readFileTool = tool({
  description: "Read the content of a file. Returns the file content as text.",
  inputSchema: readFileToolInputSchema,
  execute: readFileToolExecuteFunction,
  toModelOutput: ({ input, output }) => {
    if (output.isErr()) {
      console.error("\nRead file tool call failed with error:");
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
