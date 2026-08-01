import { LLMProvider } from "../../interfaces/llm-provider.interface.js";
import { GraphStateType } from "../state.js";

export class LLMNode {
  constructor(
    private readonly provider: LLMProvider
  ) {}

  async execute(state: GraphStateType) {
    const response = await this.provider.invoke(state.messages);

    return {
      messages: [response],
    };
  }
}