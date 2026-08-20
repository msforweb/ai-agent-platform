import { AIMessageChunk } from "@langchain/core/messages";
import { Conversation } from "../../modules/chat/types/conversation.js";

import { Agent } from "../interfaces/agent.interface.js";
import { AgentRuntime } from "./agent-runtime.js";
import { RuntimeContext } from "./runtime-context.js";

export class SimpleAgentRuntime implements AgentRuntime {
  constructor(
    private readonly agent: Agent
  ) {}

  async chat(
    conversation: Conversation,
    context?: RuntimeContext
  ): Promise<string> {
    return this.agent.chat(conversation, context);
  }

  stream(
    conversation: Conversation,
    context?: RuntimeContext
  ): AsyncGenerator<AIMessageChunk> {
    return this.agent.stream(conversation, context);
  }
}