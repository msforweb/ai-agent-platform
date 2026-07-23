import { SimpleChatAgent } from "../ai/agents/simple-chat.agent.js";
import { OpenRouterProvider } from "../ai/providers/openrouter.provider.js";

import { ChatController } from "../modules/chat/chat.controller.js";
import { InMemoryChatStore } from "../modules/chat/memory/in-memory-chat-store.js";
import { ChatService } from "../modules/chat/chat.service.js";

// Infrastructure
const provider = new OpenRouterProvider();
const chatStore = new InMemoryChatStore();

// AI
const chatAgent = new SimpleChatAgent(provider);

// Services
const chatService = new ChatService(
  chatAgent,
  chatStore
);

// Controllers
const chatController = new ChatController(chatService);

export const application = {
  chatController,
};