import * as z from "zod";
import { tool } from "ai";
import { validateFilePath } from "@/utils/file-validation";

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
}: ExecuteScriptToolInput) {
  const validatePathResult = await validateFilePath(path);
  if (validatePathResult.isErr()) {
    throw new Error(validatePathResult.error.message);
  }
  const validPath = validatePathResult.value;

  try {
    const process = Bun.spawnSync(["bun", "run", validPath]);

    const stdout = process.stdout.toString();
    const stderr = process.stderr.toString();

    return {
      stdout,
      stderr,
      exitCode: process.exitCode,
    };
  } catch (error) {
    throw new Error(
      `Unexpected error occurred while executing script at ${validPath}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export const executeScriptTool = tool({
  description:
    "Execute a TypeScript file as a script in the Bun runtime. This process is blocking and will wait for completion. Returns stdout, stderr, and exit code.",
  inputSchema: executeScriptToolInputSchema,
  execute: executeScriptToolExecuteFunction,
});
