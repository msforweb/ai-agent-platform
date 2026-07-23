import { Conversation } from "../../modules/chat/types/conversation.js";

export interface Agent {
  chat(conversation: Conversation): Promise<string>;
}