import { Agent } from "../../ai/interfaces/agent.interface.js";
import { ChatStore } from "./interfaces/chat-store.interface.js";

export class ChatService {
  constructor(
    private readonly agent: Agent,
    private readonly chatStore: ChatStore
  ) {}

  async chat(
    conversationId: string,
    message: string
  ): Promise<string> {

    let conversation =
      this.chatStore.getConversation(conversationId);

    if (!conversation) {
      conversation =
        this.chatStore.createConversation(conversationId);
    }

    conversation.messages.push({
      role: "user",
      content: message,
    });

    const reply =
      await this.agent.chat(conversation);

    conversation.messages.push({
      role: "assistant",
      content: reply,
    });

    this.chatStore.saveConversation(conversation);

    return reply;
  }
}