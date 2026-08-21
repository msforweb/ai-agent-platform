import { AIMessageChunk } from "@langchain/core/messages";

import { AgentRuntime } from "../../ai/runtime/agent-runtime.js";
import { ChatStore } from "./interfaces/chat-store.interface.js";
import { MemoryManager } from "../../ai/memory/interfaces/memory-manager.interface.js";
//import { MemoryService } from "../memory/memory.service.js";
import { RuntimeContextBuilder } from "../../ai/runtime/runtime-context-builder.js";

export class ChatService {
  constructor(
    private readonly runtime: AgentRuntime,
    private readonly chatStore: ChatStore,
    private readonly memoryManager: MemoryManager,
    private readonly runtimeContextBuilder: RuntimeContextBuilder
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

    const runtimeContext = await this.runtimeContextBuilder.build(message, 5);

    const optimizedConversation = await this.memoryManager.prepareConversation(conversation);

    conversation = optimizedConversation;

    await this.chatStore.saveConversation(conversation);

    const reply = await this.runtime.chat(
      optimizedConversation,
      runtimeContext
    );

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

    const runtimeContext = await this.runtimeContextBuilder.build(message, 5);

    const optimizedConversation = await this.memoryManager.prepareConversation(conversation);

    conversation = optimizedConversation;

    await this.chatStore.saveConversation(conversation);

    let fullResponse = "";

    for await (const chunk of this.runtime.stream(
        optimizedConversation,
        runtimeContext
      )
    ) 
    {
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