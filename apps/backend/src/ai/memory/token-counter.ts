import { TokenCounter } from "./interfaces/token-counter.interface.js";

export class SimpleTokenCounter implements TokenCounter {
  async count(text: string): Promise<number> {
    // Temporary approximation.
    // We'll replace this later with tiktoken.
    return Math.ceil(text.length / 4);
  }
}