import { describe, expect, it, vi } from "vitest";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

import { LangGraphAgent } from "../../../src/ai/agents/langgraph.agent.js";
import { ChatGraph } from "../../../src/ai/graph/graphs/chat.graph.js";
import { RuntimeContext } from "../../../src/ai/runtime/runtime-context.js";

describe("LangGraphAgent", () => {
  it("should return the assistant response from the graph", async () => {
    const graph = {
      invoke: vi.fn().mockResolvedValue({
        messages: [
          new HumanMessage("Hello"),
          new AIMessage("Hi there!"),
        ],
      }),
    } as unknown as ChatGraph;

    const agent = new LangGraphAgent(graph);

    const reply = await agent.chat({
      id: "1",
      messages: [
        {
          role: "user",
          content: "Hello",
        },
      ],
    });

    expect(reply).toBe("Hi there!");

    expect(graph.invoke).toHaveBeenCalledOnce();
  });

  it("should include runtime memories when invoking the graph", async () => {
      const graph = {
        invoke: vi.fn().mockResolvedValue({
          messages: [
            new HumanMessage("What are we building?"),
            new AIMessage("An AI agent platform."),
          ],
        }),
      } as unknown as ChatGraph;

      const agent = new LangGraphAgent(graph);

      const context: RuntimeContext = {
        memories: [
          {
            id: "memory-1",
            conversationId: "conversation-1",
            content: "The user is building an AI agent platform.",
            embedding: [0.1, 0.2],
            createdAt: new Date(),
          },
        ],
      };

      await agent.chat(
        {
          id: "conversation-1",
          messages: [
            {
              role: "user",
              content: "What are we building?",
            },
          ],
        },
        context
      );

      expect(graph.invoke)
        .toHaveBeenCalledOnce();

      const input =
        vi.mocked(graph.invoke).mock.calls[0][0];

      expect(input.messages).toHaveLength(2);

      expect(input.messages[0].constructor.name)
        .toBe("SystemMessage");

      expect(input.messages[0].content.toString())
        .toContain(
          "The user is building an AI agent platform."
        );

      expect(input.messages[1].constructor.name)
        .toBe("HumanMessage");

      expect(input.messages[1].content.toString())
        .toBe("What are we building?");
    });
});