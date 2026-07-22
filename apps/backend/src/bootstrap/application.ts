import { OpenRouterProvider } from "../ai/providers/openrouter.provider.js";

import { ChatController } from "../modules/chat/chat.controller.js";
import { ChatService } from "../modules/chat/chat.service.js";

const provider = new OpenRouterProvider();

const chatService = new ChatService(provider);

const chatController = new ChatController(chatService);

export const application = {
  chatController,
};