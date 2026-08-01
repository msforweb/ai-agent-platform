import {
  AIMessage,
  AIMessageChunk,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";

import { Agent } from "../interfaces/agent.interface.js";
import { ChatGraph } from "../graph/graphs/chat.graph.js";

import { Conversation } from "../../modules/chat/types/conversation.js";

export class LangGraphAgent implements Agent {
  constructor(
    private readonly graph: ChatGraph
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
    const result = await this.graph.invoke({
      messages: this.buildMessages(conversation),
    });

    const lastMessage = result.messages[result.messages.length - 1];

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