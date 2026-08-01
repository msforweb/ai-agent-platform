import { AIMessageChunk } from "@langchain/core/messages";
import { Conversation } from "../../modules/chat/types/conversation.js";

import { Agent } from "../interfaces/agent.interface.js";
import { AgentRuntime } from "./agent-runtime.js";

export class SimpleAgentRuntime implements AgentRuntime {
  constructor(
    private readonly agent: Agent
  ) {}

  async chat(conversation: Conversation): Promise<string> {
    return this.agent.chat(conversation);
  }

  stream(
    conversation: Conversation
  ): AsyncGenerator<AIMessageChunk> {
    return this.agent.stream(conversation);
  }
}