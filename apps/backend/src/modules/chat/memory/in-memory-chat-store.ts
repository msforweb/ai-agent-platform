import { ChatStore } from "../../../ai/interfaces/chat-store.interface.js";
import { Conversation } from "../types/conversation.js";

export class InMemoryChatStore implements ChatStore {
  private readonly conversations = new Map<string, Conversation>();

  getConversation(id: string): Conversation | undefined {
    return this.conversations.get(id);
  }

  saveConversation(conversation: Conversation): void {
    this.conversations.set(conversation.id, conversation);
  }

  createConversation(id: string): Conversation {
    const conversation: Conversation = {
      id,
      messages: [],
    };

    this.saveConversation(conversation);

    return conversation;
  }
}