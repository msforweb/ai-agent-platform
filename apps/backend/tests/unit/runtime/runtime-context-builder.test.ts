import { describe, it, expect, vi } from "vitest";

import { RuntimeContextBuilder } from "../../../src/ai/runtime/runtime-context-builder.js";
import { MemoryService } from "../../../src/modules/memory/memory.service.js";

describe("RuntimeContextBuilder", () => {
  it("should build runtime context from relevant memories", async () => {
    const memories = [
      {
        id: "memory-1",
        conversationId: "conversation-1",
        content: "The user is building an AI agent platform.",
        embedding: [0.1, 0.2],
        createdAt: new Date(),
      },
    ];

    const memoryService = {
      findRelevant: vi.fn().mockResolvedValue(memories),
    } as unknown as MemoryService;

    const builder =
      new RuntimeContextBuilder(memoryService);

    const context =
      await builder.build("What are we building?", 5);

    expect(memoryService.findRelevant)
      .toHaveBeenCalledWith(
        "What are we building?",
        5
      );

    expect(context).toEqual({
      memories,
    });
  });

  it("should return an empty memory context when no memories are found", async () => {
    const memoryService = {
      findRelevant: vi.fn().mockResolvedValue([]),
    } as unknown as MemoryService;

    const builder =
      new RuntimeContextBuilder(memoryService);

    const context =
      await builder.build("Hello");

    expect(memoryService.findRelevant)
      .toHaveBeenCalledWith(
        "Hello",
        5
      );

    expect(context).toEqual({
      memories: [],
    });
  });
});