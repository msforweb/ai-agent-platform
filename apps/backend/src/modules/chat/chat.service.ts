import { HumanMessage } from "@langchain/core/messages";

import { LLMProvider } from "../../ai/interfaces/llm-provider.interface.js";

export class ChatService {
  constructor(private readonly provider: LLMProvider) {}

  async chat(message: string): Promise<string> {
    const response = await this.provider.invoke([
      new HumanMessage(message),
    ]);

    return response.content.toString();
  }
}