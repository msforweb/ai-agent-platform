import { ChatOpenAI } from "@langchain/openai";
import {
  AIMessage,
  AIMessageChunk,
  BaseMessage,
} from "@langchain/core/messages";

import { env } from "../../config/env.js";
import { LLMProvider } from "../interfaces/llm-provider.interface.js";

export class OpenRouterProvider implements LLMProvider {
  private readonly model: ChatOpenAI;

  constructor() {
    this.model = new ChatOpenAI({
      apiKey: env.OPENROUTER_API_KEY,

      model: env.OPENROUTER_MODEL,

      configuration: {
        baseURL: env.OPENROUTER_BASE_URL,
      },
    });
  }

  async invoke(messages: BaseMessage[]): Promise<AIMessage> {
    return await this.model.invoke(messages);
  }

  async *stream(
    messages: BaseMessage[]
  ): AsyncGenerator<AIMessageChunk> {
    const stream = await this.model.stream(messages);

    for await (const chunk of stream) {
      yield chunk;
    }
  }
}