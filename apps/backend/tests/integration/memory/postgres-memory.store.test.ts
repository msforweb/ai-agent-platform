import { describe, it, expect, beforeAll, afterAll } from "vitest";

import { prisma } from "../../../src/infrastructure/database/prisma.service.js";
import { PostgresMemoryStore } from "../../../src/modules/memory/stores/postgres-memory.store.js";
import { LocalEmbeddingProvider } from "../../../src/modules/memory/providers/local-embedding.provider.js";

describe("PostgresMemoryStore", () => {
  let store: PostgresMemoryStore;
  let embeddingProvider: LocalEmbeddingProvider;

  beforeAll(() => {
    store = new PostgresMemoryStore(prisma);
    embeddingProvider = new LocalEmbeddingProvider();
  });

  it(
    "should save memories and return the most relevant memory",
    async () => {
      const conversationId = `test-conversation-${Date.now()}`;

      await prisma.conversation.create({
        data: {
          id: conversationId,
        },
      });

      const memories = [
        "The user knows PHP and JavaScript.",
        "The user prefers working on Ubuntu.",
        "The user is building an AI agent platform.",
      ];

      for (const content of memories) {
        const embedding =
          await embeddingProvider.embed(content);

        await store.save({
          id: `memory-${Date.now()}-${Math.random()}`,
          conversationId,
          content,
          embedding,
          createdAt: new Date(),
        });
      }

      const query =
        "Which programming languages does the user know?";

      const queryEmbedding =
        await embeddingProvider.embed(query);

      const results =
        await store.findRelevant(
          queryEmbedding,
          3
        );

      expect(results.length).toBeGreaterThan(0);

      expect(results[0].content).toContain(
        "PHP"
      );

      expect(results[0].content).toContain(
        "JavaScript"
      );

      await prisma.conversation.delete({
        where: {
          id: conversationId,
        },
      });
    },
    30000
  );
});