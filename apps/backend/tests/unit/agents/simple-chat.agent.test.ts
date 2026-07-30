import { describe, it, expect, vi, beforeEach } from "vitest";
import { AIMessage, AIMessageChunk } from "@langchain/core/messages";

import { SimpleChatAgent } from "../../../src/ai/agents/simple-chat.agent.js";
import { LLMProvider } from "../../../src/ai/interfaces/llm-provider.interface.js";
import { Conversation } from "../../../src/modules/chat/types/conversation.js";

describe("SimpleChatAgent", () => {
  let mockProvider: LLMProvider;
  let agent: SimpleChatAgent;

  beforeEach(() => {
    mockProvider = {
      invoke: vi.fn(),
      stream: vi.fn(),
    };

    agent = new SimpleChatAgent(mockProvider);
  });

  it("should convert conversation messages and return the AI response", async () => {

    // Arrange

    const conversation: Conversation = {
      id: "conversation-1",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        {
          role: "user",
          content: "Hello",
        },
        {
          role: "assistant",
          content: "Hi!",
        },
      ],
    };

    vi.mocked(mockProvider.invoke)
      .mockResolvedValue(
        new AIMessage("Hello from AI")
      );

    // Act

    const reply = await agent.chat(conversation);

    // Assert

    expect(reply).toBe("Hello from AI");

    expect(mockProvider.invoke)
      .toHaveBeenCalledTimes(1);

    const messages =
      vi.mocked(mockProvider.invoke).mock.calls[0][0];

    expect(messages).toHaveLength(3);

    expect(messages[0].constructor.name)
      .toBe("SystemMessage");

    expect(messages[1].constructor.name)
      .toBe("HumanMessage");

    expect(messages[2].constructor.name)
      .toBe("AIMessage");

  });

  it("should stream AI response chunks", async () => {

    // Arrange

    const conversation: Conversation = {
      id: "conversation-1",
      messages: [
        {
          role: "user",
          content: "Hello",
        },
      ],
    };

    async function* fakeStream() {
      yield new AIMessageChunk({
        content: "Hello ",
      });

      yield new AIMessageChunk({
        content: "World",
      });

      yield new AIMessageChunk({
        content: "!",
      });
    }

    vi.mocked(mockProvider.stream)
      .mockReturnValue(fakeStream());

    // Act

    const chunks: string[] = [];

    for await (const chunk of agent.stream(conversation)) {
      chunks.push(chunk.content.toString());
    }

    // Assert

    expect(mockProvider.stream)
      .toHaveBeenCalledTimes(1);

    expect(chunks).toEqual([
      "Hello ",
      "World",
      "!",
    ]);

  });

});