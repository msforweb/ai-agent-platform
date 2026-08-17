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
import { DefaultMemoryManager } from "../ai/memory/memory-manager.js";
import { SimpleTokenCounter } from "../ai/memory/token-counter.js";
import { LLMSummarizer } from "../ai/memory/llm-summarizer.js";
import { LocalEmbeddingProvider } from "../modules/memory/providers/local-embedding.provider.js";
import { PostgresMemoryStore } from "../modules/memory/stores/postgres-memory.store.js";
import { MemoryService } from "../modules/memory/memory.service.js";

// Infrastructure
const provider = new OpenRouterProvider();
const chatStore = new PostgresChatStore(prisma);
const tokenCounter = new SimpleTokenCounter();
const summarizer = new LLMSummarizer(provider);
const memoryManager = new DefaultMemoryManager(tokenCounter, summarizer);

// Graph
const llmNode = new LLMNode(provider);
const chatGraph = new ChatGraph(llmNode);

// AI
const chatAgent = new LangGraphAgent(chatGraph);

// Runtime
const agentRuntime = new SimpleAgentRuntime(chatAgent);

const embeddingProvider =
  new LocalEmbeddingProvider();

const memoryStore =
  new PostgresMemoryStore(prisma);

const memoryService =
  new MemoryService(
    memoryStore,
    embeddingProvider
  );

// Services
const chatService = new ChatService(
  agentRuntime,
  chatStore,
  memoryManager,
  memoryService
);

// Controllers
const chatController = new ChatController(chatService);

const chatStreamController = new ChatStreamController(chatService);

export const application = {
  chatController,
  chatStreamController,
};