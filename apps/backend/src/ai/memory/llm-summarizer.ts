import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import { LLMProvider } from "../interfaces/llm-provider.interface.js";
import { Summarizer } from "./interfaces/summarizer.interface.js";

export class LLMSummarizer implements Summarizer {
  constructor(
    private readonly provider: LLMProvider
  ) {}

  async summarize(text: string): Promise<string> {
    const response = await this.provider.invoke([
      new SystemMessage(
      `You are maintaining long-term memory for an AI assistant.

      Create a concise summary of the conversation.

      Keep:
      - user goals
      - user preferences
      - important facts
      - important decisions
      - unresolved questions
      - context that will help future conversations

      Remove:
      - greetings
      - repetition
      - small talk
      - filler text

      Write the summary as a short factual paragraph.
      Do not invent information.
      Preserve important technical details when relevant.`
      ),
      new HumanMessage(text),
    ]);

    return response.content.toString();
  }
}