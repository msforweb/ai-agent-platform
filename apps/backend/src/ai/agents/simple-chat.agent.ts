import {
  AIMessage,
  AIMessageChunk,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";

import { LLMProvider } from "../interfaces/llm-provider.interface.js";
import { Agent } from "../interfaces/agent.interface.js";

import { Conversation } from "../../modules/chat/types/conversation.js";

export class SimpleChatAgent implements Agent {
  constructor(
    private readonly provider: LLMProvider
  ) {}

  private buildMessages(conversation: Conversation) {
    return conversation.messages.map((message) => {
      switch (message.role) {
        case "system":
          return new SystemMessage(message.content);

        case "assistant":
          return new AIMessage(message.content);

        default:
          return new HumanMessage(message.content);
      }
    });
  }

  async chat(conversation: Conversation): Promise<string> {
    const messages = this.buildMessages(conversation);

    const response = await this.provider.invoke(messages);

    return response.content.toString();
  }

  async *stream(
    conversation: Conversation
  ): AsyncGenerator<AIMessageChunk> {
    const messages = this.buildMessages(conversation);

    for await (const chunk of this.provider.stream(messages)) {
      yield chunk;
    }
  }
}