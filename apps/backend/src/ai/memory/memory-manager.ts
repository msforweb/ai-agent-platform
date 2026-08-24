import { Conversation, ConversationMessage } from "../../modules/chat/types/conversation.js";
import { TokenCounter } from "./interfaces/token-counter.interface.js";
import { MemoryManager } from "./interfaces/memory-manager.interface.js";
import { MEMORY_CONFIG } from "./memory.config.js";
import { Summarizer } from "./interfaces/summarizer.interface.js";


const RECENT_MESSAGE_COUNT = 8;

export class DefaultMemoryManager implements MemoryManager {

  constructor(
    private readonly tokenCounter: TokenCounter,
    private readonly summarizer: Summarizer
  ) {}
  

  async prepareConversation(
    conversation: Conversation
  ): Promise<Conversation> {

    console.log(">>> MemoryManager.prepareConversation()");

    console.log(
      "Message count:",
      conversation.messages.length
    );

    console.log(
      "Minimum required:",
      MEMORY_CONFIG.MIN_MESSAGES_BEFORE_SUMMARY
    );

    // 1. Not enough messages → nothing to summarize
    if (
      conversation.messages.length <
      MEMORY_CONFIG.MIN_MESSAGES_BEFORE_SUMMARY
    ) {
      console.log(
        "Returning early: not enough messages"
      );

      return conversation;
    }

    // 2. Build the text used for token counting
    const text = conversation.messages
      .map(
        message =>
          `${message.role}: ${message.content}`
      )
      .join("\n");

    // 3. Check token usage before calling the LLM
    const tokens =
      await this.tokenCounter.count(text);

    console.log("Token count:", tokens);

    if (
      tokens <
      MEMORY_CONFIG.MAX_CONTEXT_TOKENS
    ) {
      console.log(
        `Conversation contains ${tokens} tokens. No summarization required.`
      );

      return conversation;
    }

    // 4. Only now prepare the summarization input
    const existingSummary =
      conversation.messages.find(
        message => message.isSummary
      );

    const messagesWithoutSummary =
      conversation.messages.filter(
        message => !message.isSummary
      );

    const recentMessages =
      messagesWithoutSummary.slice(
        -RECENT_MESSAGE_COUNT
      );

    const oldMessages =
      messagesWithoutSummary.slice(
        0,
        -RECENT_MESSAGE_COUNT
      );

    let summaryInput = "";

    if (existingSummary) {
      summaryInput +=
        `Previous summary:\n${existingSummary.content}\n\n`;
    }

    summaryInput +=
      oldMessages
        .map(
          message =>
            `${message.role}: ${message.content}`
        )
        .join("\n");

    // 5. Expensive operation only when actually required
    const summary =
      await this.summarizer.summarize(
        summaryInput
      );

    console.log(
      "\n===== GENERATED SUMMARY ====="
    );

    console.log(summary);

    console.log(
      "=============================\n"
    );

    const summaryMessage: ConversationMessage = {
      role: "system",
      content:
        `Conversation summary:\n\n${summary}`,
      isSummary: true,
    };

    return {
      ...conversation,
      messages: [
        summaryMessage,
        ...recentMessages,
      ],
    };
  }
}