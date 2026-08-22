import {
  START,
  END,
  StateGraph,
} from "@langchain/langgraph";

import { GraphState } from "../state.js";
import { LLMNode } from "../nodes/llm.node.js";

export class ChatGraph {
  private readonly graph;
  private readonly streamGraph;

  constructor(
    private readonly llmNode: LLMNode
  ) {
    this.graph = new StateGraph(GraphState)
      .addNode(
        "llm",
        this.llmNode.execute.bind(this.llmNode)
      )
      .addEdge(START, "llm")
      .addEdge("llm", END)
      .compile();

    this.streamGraph = new StateGraph(GraphState)
      .addNode(
        "llm",
        this.llmNode.stream.bind(this.llmNode)
      )
      .addEdge(START, "llm")
      .addEdge("llm", END)
      .compile();
  }

  async invoke(
    input: typeof GraphState.State
  ) {
    return this.graph.invoke(input);
  }

  async *stream(
    input: typeof GraphState.State
  ) {
    const stream = await this.streamGraph.stream(
      input,
      {
        streamMode: "custom",
      }
    );

    for await (const chunk of stream) {
      yield chunk;
    }
  }
}