export type ChatRole = "system" | "user" | "assistant";

export interface ConversationMessage {
  role: ChatRole;
  content: string;
}

export interface Conversation {
  id: string;
  messages: ConversationMessage[];
}