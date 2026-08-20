import { MemoryRecord } from "../../modules/memory/types/memory-record.js";

export interface RuntimeContext {
  memories?: MemoryRecord[];
}