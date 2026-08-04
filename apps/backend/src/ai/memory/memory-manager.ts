import { Conversation } from "../../modules/chat/types/conversation.js";
import { TokenCounter } from "./interfaces/token-counter.interface.js";
import { MemoryManager } from "./interfaces/memory-manager.interface.js";
import { MEMORY_CONFIG } from "./memory.config.js";

export class DefaultMemoryManager implements MemoryManager {

  constructor(
    private readonly tokenCounter: TokenCounter
  ) {}

  async prepareConversation(
    conversation: Conversation
  ): Promise<Conversation> {

    const text = conversation.messages
      .map(message => message.content)
      .join("\n");

    const tokens =
      await this.tokenCounter.count(text);

    if (tokens < MEMORY_CONFIG.MAX_CONTEXT_TOKENS) {
      console.log(
        `Conversation contains ${tokens} tokens. No summarization required.`
      );
      
      return conversation;
    }  

    console.log(`Conversation tokens: ${tokens}`);

    return conversation;
  }

}