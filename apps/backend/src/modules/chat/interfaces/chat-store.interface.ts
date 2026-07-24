import { Conversation } from "../types/conversation.js";

export interface ChatStore {
  getConversation(id: string): Conversation | undefined;

  saveConversation(conversation: Conversation): void;

  createConversation(id: string): Conversation;
}