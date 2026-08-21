import { MemoryService } from "../../modules/memory/memory.service.js";
import { RuntimeContext } from "./runtime-context.js";

export class RuntimeContextBuilder {
  constructor(
    private readonly memoryService: MemoryService
  ) {}

  async build(
    query: string,
    limit = 5
  ): Promise<RuntimeContext> {
    const memories =
      await this.memoryService.findRelevant(query, limit);

    return {
      memories,
    };
  }
}