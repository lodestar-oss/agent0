import { readFileTool } from "@/tools/core/read-file";
import { groq } from "@/utils/ai-providers";
import {
  generateText,
  InvalidToolInputError,
  NoSuchToolError,
  stepCountIs,
} from "ai";
import { describe, expect, test } from "bun:test";

describe("Read file tool", () => {
  const validFilePath = "D:\\Ryan Luong\\dev\\agent0\\tsconfig.json";
  const invalidFilePath = "D:\\Ryan Luong\\dev\\agent0\\jsconfig.json";

  test(`should read file content from ${validFilePath}`, async () => {
    try {
      const { steps } = await generateText({
        model: groq("meta-llama/llama-4-maverick-17b-128e-instruct"),
        prompt: `Tell me what's in this file: ${validFilePath}`,
        tools: {
          readFileTool,
        },
        stopWhen: stepCountIs(5),
        prepareStep: ({ stepNumber }) => {
          console.log("Step:", stepNumber);
          return {};
        },
        onStepFinish({ text, toolCalls, toolResults, finishReason }) {
          console.log("Text:", text);
          console.log("Tool calls:", toolCalls);
          console.log("Tool results:", toolResults);
          console.log("Finish reason:", finishReason);
        },
      });

      const toolErrors = steps.flatMap((step) =>
        step.content.filter((part) => part.type === "tool-error")
      );

      toolErrors.forEach((toolError) => {
        console.error("Tool error:", toolError.error);
        console.error("Tool name:", toolError.toolName);
        console.error("Tool input:", toolError.input);
      });

      expect(toolErrors).toHaveLength(0);
    } catch (error) {
      if (NoSuchToolError.isInstance(error)) {
        console.error("No such tool error", error);
      } else if (InvalidToolInputError.isInstance(error)) {
        console.error("Invalid tool input error", error);
      } else {
        console.error("Unknown error", error);
      }
    }
  });

  test(`should has tool execution error for ${invalidFilePath}`, async () => {
    try {
      const { text, steps, finishReason } = await generateText({
        model: groq("meta-llama/llama-4-maverick-17b-128e-instruct"),
        prompt: `Tell me what's in this file: ${invalidFilePath}`,
        tools: {
          readFileTool,
        },
        stopWhen: stepCountIs(5),
        prepareStep: ({ stepNumber }) => {
          console.log("Step:", stepNumber);
          return {};
        },
        onStepFinish({ text, toolCalls, toolResults, finishReason }) {
          console.log("Text:", text);
          console.log("Tool calls:", toolCalls);
          console.log("Tool results:", toolResults);
          console.log("Finish reason:", finishReason);
        },
      });

      console.log("Final finish reason:", finishReason);
      console.log("Agent response:", text);

      const toolErrors = steps.flatMap((step) =>
        step.content.filter((part) => part.type === "tool-error")
      );

      toolErrors.forEach((toolError) => {
        console.error("Tool error:", toolError.error);
        console.error("Tool name:", toolError.toolName);
        console.error("Tool input:", toolError.input);
      });

      expect(toolErrors).toHaveLength(1);
    } catch (error) {
      if (NoSuchToolError.isInstance(error)) {
        console.error("No such tool error", error);
      } else if (InvalidToolInputError.isInstance(error)) {
        console.error("Invalid tool input error", error);
      } else {
        console.error("Unknown error", error);
      }
    }
  });
});
