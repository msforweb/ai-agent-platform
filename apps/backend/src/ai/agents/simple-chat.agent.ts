import {
  AIMessage,
  AIMessageChunk,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";

import { LLMProvider } from "../interfaces/llm-provider.interface.js";
import { Agent } from "../interfaces/agent.interface.js";

import { Conversation } from "../../modules/chat/types/conversation.js";
import { RuntimeContext } from "../runtime/runtime-context.js";

export class SimpleChatAgent implements Agent {
  constructor(
    private readonly provider: LLMProvider
  ) {}

  private buildMemoryMessage(context?: RuntimeContext): SystemMessage | null {
    const memories = context?.memories;

    if (!memories || memories.length === 0) {
      return null;
    }

    const memoryContent = memories
      .map((memory) => `- ${memory.content}`)
      .join("\n");

    return new SystemMessage(
      `Relevant conversation memories:\n${memoryContent}`
    );
  }

  private buildMessages(
    conversation: Conversation,
    context?: RuntimeContext
  ) {
    const messages = conversation.messages.map((message) => {
      switch (message.role) {
        case "system":
          return new SystemMessage(message.content);

        case "assistant":
          return new AIMessage(message.content);

        default:
          return new HumanMessage(message.content);
      }
    });

    const memoryMessage = this.buildMemoryMessage(context);

    if (memoryMessage) {
      messages.unshift(memoryMessage);
    }

    return messages;
  }

  async chat(
    conversation: Conversation,
    context?: RuntimeContext
  ): Promise<string> {
    const messages = this.buildMessages(conversation, context);

    const response = await this.provider.invoke(messages);

    return response.content.toString();
  }

  async *stream(
    conversation: Conversation,
    context?: RuntimeContext
  ): AsyncGenerator<AIMessageChunk> {
    const messages = this.buildMessages(conversation, context);

    for await (const chunk of this.provider.stream(messages)) {
      yield chunk;
    }
  }
}