import { EmbeddingProvider } from "./interfaces/embedding-provider.interface.js";
import { MemoryStore } from "./interfaces/memory-store.interface.js";
import { MemoryRecord } from "./types/memory-record.js";

export class MemoryService {
  constructor(
    private readonly memoryStore: MemoryStore,
    private readonly embeddingProvider: EmbeddingProvider
  ) {}

  async save(memory: MemoryRecord): Promise<void> {
    await this.memoryStore.save(memory);
  }

  async findRelevant(
    query: string,
    limit = 5
  ): Promise<MemoryRecord[]> {
    const embedding =
      await this.embeddingProvider.embed(query);

    return this.memoryStore.findRelevant(
      embedding,
      limit
    );
  }

  async remember(
    conversationId: string,
    content: string
  ): Promise<void> {
    const embedding =
      await this.embeddingProvider.embed(content);

    await this.memoryStore.save({
      id: crypto.randomUUID(),
      conversationId,
      content,
      embedding,
      createdAt: new Date(),
    });
  }
}