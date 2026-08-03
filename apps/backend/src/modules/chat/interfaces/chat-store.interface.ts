import { Conversation } from "../types/conversation.js";

export interface ChatStore {
  getConversation(
    id: string
  ): Promise<Conversation | undefined>;

  saveConversation(
    conversation: Conversation
  ): Promise<void>;

  createConversation(
    id: string
  ): Promise<Conversation>;
}