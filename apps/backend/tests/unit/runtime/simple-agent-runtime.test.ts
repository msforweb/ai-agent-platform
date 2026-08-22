import {
  describe,
  it,
  expect,
  vi,
    beforeEach,
} from "vitest";

import { AIMessageChunk } from "@langchain/core/messages";

import { SimpleAgentRuntime } from "../../../src/ai/runtime/simple-agent-runtime.js";
import { Agent } from "../../../src/ai/interfaces/agent.interface.js";
import { Conversation } from "../../../src/modules/chat/types/conversation.js";
import { RuntimeContext } from "../../../src/ai/runtime/runtime-context.js";

describe("SimpleAgentRuntime", () => {
  let mockAgent: Agent;
  let runtime: SimpleAgentRuntime;

  const conversation: Conversation = {
    id: "conversation-1",
    messages: [
      {
        role: "user",
        content: "Hello",
      },
    ],
  };

  const context: RuntimeContext = {
    memories: [],
  };

  beforeEach(() => {
    mockAgent = {
      chat: vi.fn().mockResolvedValue("Hello from AI"),
      stream: vi.fn(),
    };

    runtime = new SimpleAgentRuntime(mockAgent);
  });

  it("should delegate chat to the agent", async () => {
    const reply = await runtime.chat(
      conversation,
      context
    );

    expect(reply).toBe("Hello from AI");

    expect(mockAgent.chat)
      .toHaveBeenCalledTimes(1);

    expect(mockAgent.chat)
      .toHaveBeenCalledWith(
        conversation,
        context
      );
  });

  it("should delegate streaming to the agent", async () => {
    async function* fakeStream() {
      yield new AIMessageChunk({
        content: "Hello ",
      });

      yield new AIMessageChunk({
        content: "World",
      });
    }

    vi.mocked(mockAgent.stream)
      .mockReturnValue(fakeStream());

    const chunks: string[] = [];

    for await (
      const chunk of runtime.stream(
        conversation,
        context
      )
    ) {
      chunks.push(chunk.content.toString());
    }

    expect(chunks).toEqual([
      "Hello ",
      "World",
    ]);

    expect(mockAgent.stream)
      .toHaveBeenCalledTimes(1);

    expect(mockAgent.stream)
      .toHaveBeenCalledWith(
        conversation,
        context
      );
  });
});