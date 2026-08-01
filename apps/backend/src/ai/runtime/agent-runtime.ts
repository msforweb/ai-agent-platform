import { AIMessageChunk } from "@langchain/core/messages";
import { Conversation } from "../../modules/chat/types/conversation.js";

export interface AgentRuntime {
  chat(conversation: Conversation): Promise<string>;

  stream(
    conversation: Conversation
  ): AsyncGenerator<AIMessageChunk>;
}