import { describe, expect, it, vi } from "vitest";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

import { LangGraphAgent } from "../../../src/ai/agents/langgraph.agent.js";
import { ChatGraph } from "../../../src/ai/graph/graphs/chat.graph.js";

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
});