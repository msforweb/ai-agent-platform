//import { SimpleChatAgent } from "../ai/agents/simple-chat.agent.js";
import { LangGraphAgent } from "../ai/agents/langgraph.agent.js";
import { LLMNode } from "../ai/graph/nodes/llm.node.js";
import { ChatGraph } from "../ai/graph/graphs/chat.graph.js";

import { SimpleAgentRuntime } from "../ai/runtime/simple-agent-runtime.js";
import { OpenRouterProvider } from "../ai/providers/openrouter.provider.js";

import { ChatController } from "../modules/chat/chat.controller.js";
import { ChatStreamController } from "../modules/chat/chat-stream.controller.js";
//import { InMemoryChatStore } from "../modules/chat/memory/in-memory-chat-store.js";
import { prisma } from "../infrastructure/database/prisma.service.js";
import { PostgresChatStore } from "../modules/chat/memory/postgres-chat-store.js";
import { ChatService } from "../modules/chat/chat.service.js";

// Infrastructure
const provider = new OpenRouterProvider();
const chatStore = new PostgresChatStore(prisma);

// Graph
const llmNode = new LLMNode(provider);
const chatGraph = new ChatGraph(llmNode);

// AI
const chatAgent = new LangGraphAgent(chatGraph);

// Runtime
const agentRuntime = new SimpleAgentRuntime(chatAgent);

// Services
const chatService = new ChatService(
  agentRuntime,
  chatStore
);

// Controllers
const chatController = new ChatController(chatService);

const chatStreamController = new ChatStreamController(chatService);

export const application = {
  chatController,
  chatStreamController,
};