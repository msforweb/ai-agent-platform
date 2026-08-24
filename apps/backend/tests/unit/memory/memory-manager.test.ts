import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from "vitest";

import { DefaultMemoryManager } from "../../../src/ai/memory/memory-manager.js";
import { TokenCounter } from "../../../src/ai/memory/interfaces/token-counter.interface.js";
import { Summarizer } from "../../../src/ai/memory/interfaces/summarizer.interface.js";
import { Conversation } from "../../../src/modules/chat/types/conversation.js";

describe("DefaultMemoryManager", () => {
  let mockTokenCounter: TokenCounter;
  let mockSummarizer: Summarizer;
  let manager: DefaultMemoryManager;

  beforeEach(() => {
    mockTokenCounter = {
      count: vi.fn(),
    };

    mockSummarizer = {
      summarize: vi.fn(),
    };

    manager = new DefaultMemoryManager(
      mockTokenCounter,
      mockSummarizer
    );
  });

  it("should return the conversation without summarizing when there are not enough messages", async () => {
    const conversation: Conversation = {
      id: "conversation-1",
      messages: [
        {
          role: "user",
          content: "Hello",
        },
      ],
    };

    const result =
      await manager.prepareConversation(conversation);

    expect(result).toEqual(conversation);

    expect(mockSummarizer.summarize)
      .not.toHaveBeenCalled();

    expect(mockTokenCounter.count)
      .not.toHaveBeenCalled();
  });

  it("should return the conversation when token count is below the context limit", async () => {
    const conversation: Conversation = {
      id: "conversation-1",
      messages: Array.from(
        { length: 12 },
        (_, index) => ({
          role: "user" as const,
          content: `Message ${index}`,
        })
      ),
    };

    vi.mocked(mockTokenCounter.count)
      .mockResolvedValue(100);

    const result =
      await manager.prepareConversation(conversation);

    expect(result).toEqual(conversation);

    expect(mockTokenCounter.count)
      .toHaveBeenCalledTimes(1);

    expect(mockSummarizer.summarize)
      .not.toHaveBeenCalled();
  });

  it("should summarize the conversation when token count exceeds the context limit", async () => {
    const conversation: Conversation = {
      id: "conversation-1",
      messages: Array.from(
        { length: 16 },
        (_, index) => ({
          role: index % 2 === 0 ? "user" as const : "assistant" as const,
          content: `Message ${index}`,
        })
      ),
    };

    vi.mocked(mockTokenCounter.count)
      .mockResolvedValue(5000);

    vi.mocked(mockSummarizer.summarize)
      .mockResolvedValue(
        "This is the conversation summary."
      );

    const result =
      await manager.prepareConversation(conversation);

    expect(mockTokenCounter.count)
      .toHaveBeenCalledTimes(1);

    expect(mockSummarizer.summarize)
      .toHaveBeenCalledTimes(1);

    expect(result.messages[0]).toEqual({
      role: "system",
      content:
        "Conversation summary:\n\nThis is the conversation summary.",
      isSummary: true,
    });

    expect(result.messages).toHaveLength(9);

    expect(result.messages.slice(1))
      .toEqual(conversation.messages.slice(-8));
  });
});