import {
  START,
  END,
  StateGraph,
} from "@langchain/langgraph";

import { GraphState } from "../state.js";
import { LLMNode } from "../nodes/llm.node.js";

export class ChatGraph {
  private readonly graph;

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
  }

  async invoke(input: typeof GraphState.State) {
    return this.graph.invoke(input);
  }
}