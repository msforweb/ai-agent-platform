import { AIMessageChunk } from "@langchain/core/messages";
import { Conversation } from "../../modules/chat/types/conversation.js";
import { RuntimeContext } from "../runtime/runtime-context.js";

export interface Agent {
  chat(
    conversation: Conversation,
    context?: RuntimeContext
  ): Promise<string>;

  stream(
    conversation: Conversation,
    context?: RuntimeContext
  ): AsyncGenerator<AIMessageChunk>;
}