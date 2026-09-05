import { Conversation } from "../../../modules/chat/types/conversation.js";

export interface MemoryExtractor {
  extract(
    conversation: Conversation
  ): Promise<string[]>;
}