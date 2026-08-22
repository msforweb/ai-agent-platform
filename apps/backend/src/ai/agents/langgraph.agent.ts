import {
  AIMessage,
  AIMessageChunk,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";

import { Agent } from "../interfaces/agent.interface.js";
import { ChatGraph } from "../graph/graphs/chat.graph.js";
import { RuntimeContext } from "../runtime/runtime-context.js";

import { Conversation } from "../../modules/chat/types/conversation.js";

export class LangGraphAgent implements Agent {
  constructor(
    private readonly graph: ChatGraph
  ) {}

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

    if (context?.memories?.length) {
      messages.unshift(
        new SystemMessage(
          `Relevant memories:\n${context.memories
            .map((memory) => `- ${memory.content}`)
            .join("\n")}`
        )
      );
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
    conversation: Conversation,
    context?: RuntimeContext
  ): AsyncGenerator<AIMessageChunk> {
    for await (
      const chunk of this.graph.stream({
        messages: this.buildMessages(
          conversation,
          context
        ),
      })
    ) {
      yield chunk as AIMessageChunk;
    }
  }
}