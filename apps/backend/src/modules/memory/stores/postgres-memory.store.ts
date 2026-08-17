import { PrismaClient } from "../../../generated/prisma/client.js";

import { MemoryStore } from "../interfaces/memory-store.interface.js";
import { MemoryRecord } from "../types/memory-record.js";

export class PostgresMemoryStore implements MemoryStore {
  constructor(
    private readonly prisma: PrismaClient
  ) {}

  async save(memory: MemoryRecord): Promise<void> {
    await this.prisma.$executeRaw`
      INSERT INTO "Memory"
        ("id", "conversationId", "content", "embedding", "createdAt")
      VALUES
        (${memory.id},
         ${memory.conversationId},
         ${memory.content},
         ${JSON.stringify(memory.embedding)}::vector,
         ${memory.createdAt})
    `;
  }

  async findRelevant(
  embedding: number[],
  limit = 5
    ): Promise<MemoryRecord[]> {
    const vector = `[${embedding.join(",")}]`;

    const rows = await this.prisma.$queryRaw<
        Array<{
        id: string;
        conversationId: string;
        content: string;
        createdAt: Date;
        distance: number;
        }>
    >`
        SELECT
        "id",
        "conversationId",
        "content",
        "createdAt",
        "embedding" <=> ${vector}::vector AS distance
        FROM "Memory"
        WHERE "embedding" IS NOT NULL
        ORDER BY "embedding" <=> ${vector}::vector
        LIMIT ${limit}
    `;

    return rows.map(row => ({
        id: row.id,
        conversationId: row.conversationId,
        content: row.content,
        embedding: [],
        createdAt: row.createdAt,
    }));
    }
}