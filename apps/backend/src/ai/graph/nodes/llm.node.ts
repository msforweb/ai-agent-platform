import { getWriter } from "@langchain/langgraph";

import { LLMProvider } from "../../interfaces/llm-provider.interface.js";
import { GraphStateType } from "../state.js";

export class LLMNode {
  constructor(
    private readonly provider: LLMProvider
  ) {}

  async execute(state: GraphStateType) {
    const response =
      await this.provider.invoke(state.messages);

    return {
      messages: [response],
    };
  }

  async stream(state: GraphStateType) {
    const writer = getWriter();

    if (!writer) {
      throw new Error("LangGraph stream writer is not available.");
    }
    
    for await (
      const chunk of this.provider.stream(state.messages)
    ) {
      writer(chunk);
    }

    return {
      messages: [],
    };
  }
}