import {
  describe,
  expect,
  it,
} from "vitest";

import { SimpleMemoryExtractor } from "../../../src/ai/memory/memory-extractor.js";

describe("SimpleMemoryExtractor", () => {

  it("should extract the latest user message", async () => {

    const extractor =
      new SimpleMemoryExtractor();

    const result =
      await extractor.extract({
        id: "conversation-1",
        messages: [
          {
            role: "user",
            content: "I am building an AI agent platform.",
          },
          {
            role: "assistant",
            content: "That sounds interesting.",
          },
        ],
      });

    expect(result).toEqual([
      "I am building an AI agent platform.",
    ]);
  });

  it("should return an empty array when there is no user message", async () => {

    const extractor =
      new SimpleMemoryExtractor();

    const result =
      await extractor.extract({
        id: "conversation-1",
        messages: [
          {
            role: "assistant",
            content: "Hello.",
          },
        ],
      });

    expect(result).toEqual([]);
  });

});