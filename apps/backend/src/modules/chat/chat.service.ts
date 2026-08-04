import { AIMessageChunk } from "@langchain/core/messages";

import { AgentRuntime } from "../../ai/runtime/agent-runtime.js";
import { ChatStore } from "./interfaces/chat-store.interface.js";
import { MemoryManager } from "../../ai/memory/interfaces/memory-manager.interface.js";

export class ChatService {
  constructor(
    private readonly runtime: AgentRuntime,
    private readonly chatStore: ChatStore,
    private readonly memoryManager: MemoryManager
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
    const optimizedConversation = await this.memoryManager.prepareConversation(conversation);

    const reply = await this.runtime.chat(optimizedConversation);

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

    const optimizedConversation = await this.memoryManager.prepareConversation(conversation);

    let fullResponse = "";

    for await (const chunk of this.runtime.stream(optimizedConversation)) {
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