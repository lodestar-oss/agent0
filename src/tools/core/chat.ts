import * as z from "zod";
import { tool } from "ai";
import { err, ok, type Result } from "neverthrow";
import type { UnexpectedError } from "@/types";

export const chatToolInputSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .describe("The message to send to the user."),
});

export type ChatToolInput = z.infer<typeof chatToolInputSchema>;

export async function chatToolExecuteFunction({
  message,
}: ChatToolInput): Promise<
  Result<
    { user: string | undefined; system: string | undefined },
    UnexpectedError
  >
> {
  try {
    console.write(`\nAI: ${message}`);
    console.write("\nYou: ");

    let isBusy = false;
    const consoleLines: string[] = [];
    for await (const line of console) {
      if (line === "/end") {
        break;
      }
      if (line === "/busy") {
        isBusy = true;
        break;
      }
      consoleLines.push(line);
    }

    if (isBusy) {
      return ok({
        user: undefined,
        system: "The user is busy right now. Please try again later.",
      });
    }

    const userMessage = consoleLines.join("\n").trim();
    if (!userMessage) {
      return ok({
        user: undefined,
        system: "The user did not provide a message.",
      });
    }

    return ok({
      user: userMessage,
      system: undefined,
    });
  } catch (rawError) {
    const error: UnexpectedError = {
      code: "UNEXPECTED_ERROR",
      message: "Unexpected error occurred while chatting to the user.",
      cause: rawError,
      context: {
        aiMessage: message,
      },
    };
    return err(error);
  }
}

export const chatTool = tool({
  description: "Send a message to the user and wait for their response.",
  inputSchema: chatToolInputSchema,
  execute: chatToolExecuteFunction,
  toModelOutput: ({ input, output }) => {
    if (output.isErr()) {
      console.error("\nChat tool call failed with error:");
      console.error(output.error);
      return {
        type: "error-json",
        value: {
          code: output.error.code,
          message: output.error.message,
          cause: String(output.error.cause),
          context: {
            aiMessage: input.message,
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
