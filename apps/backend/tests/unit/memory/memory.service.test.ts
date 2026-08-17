import { describe, it, expect, vi } from "vitest";

import { MemoryService } from "../../../src/modules/memory/memory.service.js";
import { EmbeddingProvider } from "../../../src/modules/memory/interfaces/embedding-provider.interface.js";
import { MemoryStore } from "../../../src/modules/memory/interfaces/memory-store.interface.js";

describe("MemoryService", () => {
  it("should generate an embedding and save a memory", async () => {
    const embedding = [0.1, 0.2, 0.3];

    const mockEmbeddingProvider: EmbeddingProvider = {
      embed: vi.fn().mockResolvedValue(embedding),
    };

    const mockMemoryStore: MemoryStore = {
      save: vi.fn().mockResolvedValue(undefined),
      findRelevant: vi.fn(),
    };

    const service = new MemoryService(
      mockMemoryStore,
      mockEmbeddingProvider
    );

    await service.remember(
      "conversation-1",
      "The user knows PHP and JavaScript."
    );

    expect(mockEmbeddingProvider.embed).toHaveBeenCalledWith(
      "The user knows PHP and JavaScript."
    );

    expect(mockMemoryStore.save).toHaveBeenCalledTimes(1);

    const savedMemory =
      vi.mocked(mockMemoryStore.save).mock.calls[0][0];

    expect(savedMemory.conversationId).toBe(
      "conversation-1"
    );

    expect(savedMemory.content).toBe(
      "The user knows PHP and JavaScript."
    );

    expect(savedMemory.embedding).toEqual(
      embedding
    );
  });

  it("should generate an embedding before searching memories", async () => {
    const embedding = [0.1, 0.2, 0.3];

    const mockEmbeddingProvider: EmbeddingProvider = {
      embed: vi.fn().mockResolvedValue(embedding),
    };

    const relevantMemories = [
      {
        id: "memory-1",
        conversationId: "conversation-1",
        content: "The user knows PHP and JavaScript.",
        embedding: [],
        createdAt: new Date(),
      },
    ];

    const mockMemoryStore: MemoryStore = {
      save: vi.fn(),
      findRelevant: vi
        .fn()
        .mockResolvedValue(relevantMemories),
    };

    const service = new MemoryService(
      mockMemoryStore,
      mockEmbeddingProvider
    );

    const result = await service.findRelevant(
      "What programming languages does the user know?",
      5
    );

    expect(mockEmbeddingProvider.embed).toHaveBeenCalledWith(
      "What programming languages does the user know?"
    );

    expect(mockMemoryStore.findRelevant).toHaveBeenCalledWith(
      embedding,
      5
    );

    expect(result).toEqual(relevantMemories);
  });
});