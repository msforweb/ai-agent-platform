import { MemoryRecord } from "../types/memory-record.js";

export interface MemoryStore {
  save(memory: MemoryRecord): Promise<void>;

  findRelevant(
    embedding: number[],
    limit?: number
  ): Promise<MemoryRecord[]>;
}