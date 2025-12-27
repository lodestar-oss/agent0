import { ok, err, type Result } from "neverthrow";
import type { FileDoesNotExistError, UnexpectedError } from "@/types";
import * as z from "zod";

export const ValidFilePathSchema = z
  .string()
  .superRefine(async (value, ctx) => {
    const validationResult = await validateFilePath(value);

    if (validationResult.isErr()) {
      ctx.addIssue({
        code: "custom",
        message: validationResult.error.message,
        input: value,
      });
    }
  })
  .brand("ValidFilePath");

export type ValidFilePath = z.infer<typeof ValidFilePathSchema>;

export async function validateFilePath(
  filePath: string
): Promise<Result<ValidFilePath, FileDoesNotExistError | UnexpectedError>> {
  try {
    const isValid = await Bun.file(filePath).exists();
    if (isValid) {
      return ok(filePath as ValidFilePath);
    } else {
      const error: FileDoesNotExistError = {
        code: "FILE_DOES_NOT_EXIST",
        message: "File path does not exist.",
        context: {
          invalidFilePath: filePath,
        },
      };
      return err(error);
    }
  } catch (rawError) {
    const error: UnexpectedError = {
      code: "UNEXPECTED_ERROR",
      message: "Unexpected error occurred while validating file path.",
      cause: rawError,
      context: {
        filePath,
      },
    };
    return err(error);
  }
}
