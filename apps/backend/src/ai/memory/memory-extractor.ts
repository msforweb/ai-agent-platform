import { Conversation } from "../../modules/chat/types/conversation.js";
import { MemoryExtractor } from "./interfaces/memory-extractor.interface.js";

export class SimpleMemoryExtractor
  implements MemoryExtractor {

  async extract(
    conversation: Conversation
  ): Promise<string[]> {

    const lastUserMessage =
      [...conversation.messages]
        .reverse()
        .find(
          message => message.role === "user"
        );

    if (!lastUserMessage) {
      return [];
    }

    return [
      lastUserMessage.content,
    ];
  }
}