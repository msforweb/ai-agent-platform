import { ChatStore } from "../interfaces/chat-store.interface.js";
import { Conversation } from "../types/conversation.js";

export class InMemoryChatStore implements ChatStore {
  private readonly conversations = new Map<string, Conversation>();

  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async saveConversation(conversation: Conversation): Promise<void> {
    this.conversations.set(conversation.id, conversation);
  }

  async createConversation(id: string): Promise<Conversation> {
    const conversation: Conversation = {
      id,
      messages: [],
    };

    await this.saveConversation(conversation);

    return conversation;
  }
}