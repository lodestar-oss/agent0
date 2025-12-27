import type { ValidFilePath } from "@/utils/file-validation";

export async function readFileContent(validFilePath: ValidFilePath) {
  const file = Bun.file(validFilePath);
  const content = await file.text();
  return content;
}
