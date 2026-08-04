import { Conversation } from "../../../modules/chat/types/conversation.js";

export interface MemoryManager {
  prepareConversation(
    conversation: Conversation
  ): Promise<Conversation>;
}