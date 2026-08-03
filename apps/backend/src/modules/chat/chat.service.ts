import { AIMessageChunk } from "@langchain/core/messages";

import { AgentRuntime } from "../../ai/runtime/agent-runtime.js";
import { ChatStore } from "./interfaces/chat-store.interface.js";

export class ChatService {
  constructor(
    private readonly runtime: AgentRuntime,
    private readonly chatStore: ChatStore
  ) {}

  async chat(
    conversationId: string,
    message: string
  ): Promise<string> {

    let conversation = await this.chatStore.getConversation(conversationId);

    if (!conversation) {
      conversation = await this.chatStore.createConversation(conversationId);
    }

    conversation.messages.push({
      role: "user",
      content: message,
    });

    const reply = await this.runtime.chat(conversation);

    conversation.messages.push({
      role: "assistant",
      content: reply,
    });

    await this.chatStore.saveConversation(conversation);

    return reply;
  }

  async *streamChat(
    conversationId: string,
    message: string
  ): AsyncGenerator<AIMessageChunk> {

    let conversation = await this.chatStore.getConversation(conversationId);

    if (!conversation) {
      conversation = await this.chatStore.createConversation(conversationId);
    }

    conversation.messages.push({
      role: "user",
      content: message,
    });

    let fullResponse = "";

    for await (const chunk of this.runtime.stream(conversation)) {
      const content =
        typeof chunk.content === "string"
          ? chunk.content
          : "";

      fullResponse += content;

      yield chunk;
    }

    conversation.messages.push({
      role: "assistant",
      content: fullResponse,
    });

    await this.chatStore.saveConversation(conversation);
  }
}