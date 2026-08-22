import {
  AIMessage,
  AIMessageChunk,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";

import { Agent } from "../interfaces/agent.interface.js";
import { ChatGraph } from "../graph/graphs/chat.graph.js";

import { Conversation } from "../../modules/chat/types/conversation.js";
import { RuntimeContext } from "../runtime/runtime-context.js";

export class LangGraphAgent implements Agent {
  constructor(
    private readonly graph: ChatGraph
  ) {}

  private buildMemoryMessage(
    context?: RuntimeContext
  ): SystemMessage | null {
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

    const memoryMessage =
      this.buildMemoryMessage(context);

    if (memoryMessage) {
      messages.unshift(memoryMessage);
    }

    return messages;
  }

  async chat(
    conversation: Conversation,
    context?: RuntimeContext
  ): Promise<string> {
    const result = await this.graph.invoke({
      messages: this.buildMessages(
        conversation,
        context
      ),
    });

    const lastMessage =
      result.messages[result.messages.length - 1];

    return lastMessage.content.toString();
  }

  async *stream(
    _conversation: Conversation
  ): AsyncGenerator<AIMessageChunk> {
    throw new Error(
      "Streaming is not implemented for LangGraphAgent yet."
    );
  }
}