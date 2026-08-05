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
        `You summarize conversations for long-term memory.
Keep important facts, decisions, user preferences, and unresolved tasks.
Produce a concise summary.`
      ),
      new HumanMessage(text),
    ]);

    return response.content.toString();
  }
}