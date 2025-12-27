import * as z from "zod";
import { tool } from "ai";
import { validateFilePath } from "@/utils/file-validation";
import { err, ok, type Result } from "neverthrow";
import type { FileDoesNotExistError, UnexpectedError } from "@/types";

export const executeScriptToolInputSchema = z.object({
  path: z
    .string()
    .min(1, "Path cannot be empty")
    .describe("The absolute path to the TypeScript file to execute."),
});

export type ExecuteScriptToolInput = z.infer<
  typeof executeScriptToolInputSchema
>;

export async function executeScriptToolExecuteFunction({
  path,
}: ExecuteScriptToolInput): Promise<
  Result<
    { stdout: string; stderr: string; exitCode: number },
    FileDoesNotExistError | UnexpectedError
  >
> {
  const validatePathResult = await validateFilePath(path);
  if (validatePathResult.isErr()) {
    return err(validatePathResult.error);
  }
  const validPath = validatePathResult.value;

  try {
    const process = Bun.spawnSync(["bun", "run", validPath]);

    const stdout = process.stdout.toString();
    const stderr = process.stderr.toString();

    return ok({
      stdout,
      stderr,
      exitCode: process.exitCode,
    });
  } catch (rawError) {
    const error: UnexpectedError = {
      code: "UNEXPECTED_ERROR",
      message: "Unexpected error occurred while executing script.",
      cause: rawError,
      context: {
        filePath: path,
      },
    };
    return err(error);
  }
}

export const executeScriptTool = tool({
  description:
    "Execute a TypeScript file as a script in the Bun runtime. This process is blocking and will wait for completion. Returns stdout, stderr, and exit code.",
  inputSchema: executeScriptToolInputSchema,
  execute: executeScriptToolExecuteFunction,
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
      type: "json",
      value: output.value,
    };
  },
});
