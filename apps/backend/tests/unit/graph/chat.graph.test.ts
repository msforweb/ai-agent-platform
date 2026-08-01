import { describe, expect, it, vi } from "vitest";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

import { ChatGraph } from "../../../src/ai/graph/graphs/chat.graph.js";
import { LLMNode } from "../../../src/ai/graph/nodes/llm.node.js";
import { LLMProvider } from "../../../src/ai/interfaces/llm-provider.interface.js";

describe("ChatGraph", () => {
  it("should execute the graph and append an AI message", async () => {
    const mockProvider: LLMProvider = {
      invoke: vi.fn().mockResolvedValue(
        new AIMessage("Hello from LangGraph")
      ),
      stream: vi.fn(),
    };

    const llmNode = new LLMNode(mockProvider);
    const graph = new ChatGraph(llmNode);

    const result = await graph.invoke({
      messages: [
        new HumanMessage("Hello")
      ],
    });

    expect(result.messages).toHaveLength(2);

    expect(result.messages[0].content).toBe("Hello");

    expect(result.messages[1].content).toBe(
      "Hello from LangGraph"
    );

    expect(mockProvider.invoke).toHaveBeenCalledTimes(1);
  });
});