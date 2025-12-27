import { ok, err, type Result } from "neverthrow";
import type { FileDoesNotExistError, UnexpectedError } from "@/types";

export type ValidFilePath = string & { __brand: "ValidFilePath" };

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
      console.error(error);
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
    console.error(error);
    return err(error);
  }
}
