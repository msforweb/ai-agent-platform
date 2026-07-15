import { HumanMessage } from "@langchain/core/messages";

import { OpenRouterProvider } from "../../ai/providers/openrouter.provider.js";

export class ChatService {
  private readonly provider = new OpenRouterProvider();

  async chat(message: string): Promise<string> {
    const response = await this.provider.invoke([
      new HumanMessage(message),
    ]);

    return response.content.toString();
  }
}