import { describe, it, expect, vi, beforeEach } from "vitest";

import { ChatService } from "../../../src/modules/chat/chat.service.js";
import { Conversation } from "../../../src/modules/chat/types/conversation.js";
import { Agent } from "../../../src/ai/interfaces/agent.interface.js";
import { ChatStore } from "../../../src/modules/chat/interfaces/chat-store.interface.js";
import { MemoryManager } from "../../../src/ai/memory/interfaces/memory-manager.interface.js";
import { RuntimeContextBuilder } from "../../../src/ai/runtime/runtime-context-builder.js";

describe("ChatService", () => {
  let mockAgent: Agent;
  let mockStore: ChatStore;
  let service: ChatService;
  let mockMemoryManager: MemoryManager;
  let mockRuntimeContextBuilder: RuntimeContextBuilder;

  beforeEach(() => {
    mockAgent = {
      chat: vi.fn().mockResolvedValue("Hello from AI"),
      stream: vi.fn(),
    };

    mockStore = {
      getConversation: vi.fn().mockReturnValue(undefined),

      createConversation: vi.fn().mockReturnValue({
        id: "conversation-1",
        messages: [],
      } as Conversation),

      saveConversation: vi.fn(),
    };

    mockMemoryManager = {
      prepareConversation: vi.fn(async conversation => conversation),
    };
    
    mockRuntimeContextBuilder = {
      build: vi.fn().mockResolvedValue({
        memories: [],
      }),
    } as unknown as RuntimeContextBuilder;

    service = new ChatService(
      mockAgent,
      mockStore,
      mockMemoryManager,
      mockRuntimeContextBuilder
    );
  });

  it("should create a new conversation and return the AI reply", async () => {
    const reply = await service.chat(
      "conversation-1",
      "Hello"
    );
    
    expect(reply).toBe("Hello from AI");

    expect(mockStore.getConversation)
      .toHaveBeenCalledWith("conversation-1");

    expect(mockStore.createConversation)
      .toHaveBeenCalledWith("conversation-1");

    expect(mockAgent.chat)
      .toHaveBeenCalledTimes(1);
    
    expect(mockMemoryManager.prepareConversation)
      .toHaveBeenCalledTimes(1);  

    const savedConversation =
      vi.mocked(mockStore.saveConversation).mock.calls[1][0];

    expect(savedConversation.messages).toHaveLength(2);

    expect(savedConversation.messages[0]).toEqual({
      role: "user",
      content: "Hello",
    });

    expect(savedConversation.messages[1]).toEqual({
      role: "assistant",
      content: "Hello from AI",
    });

    expect(mockStore.saveConversation)
      .toHaveBeenCalledTimes(2);
  });

  it("should use an existing conversation", async () => {
    const existingConversation: Conversation = {
      id: "conversation-1",
      messages: [],
    };

    vi.mocked(mockStore.getConversation)
      .mockReturnValue(existingConversation);

    await service.chat(
      "conversation-1",
      "Hello again"
    );

    expect(mockStore.createConversation)
      .not.toHaveBeenCalled();

    expect(mockRuntimeContextBuilder.build)
      .toHaveBeenCalledWith("Hello again", 5);

    expect(mockAgent.chat)
      .toHaveBeenCalledWith(
        existingConversation,
        {
          memories: [],
        }
      );
  });

  it("should pass relevant memories from the runtime context builder to the agent", async () => {
      const existingConversation: Conversation = {
        id: "conversation-1",
        messages: [],
      };

      const memories = [
        {
          id: "memory-1",
          conversationId: "conversation-1",
          content: "The user is building an AI agent platform.",
          embedding: [0.1, 0.2],
          createdAt: new Date(),
        },
      ];

      vi.mocked(mockStore.getConversation)
        .mockReturnValue(existingConversation);

      vi.mocked(mockRuntimeContextBuilder.build)
        .mockResolvedValue({
          memories,
        });

      await service.chat(
        "conversation-1",
        "What are we building?"
      );

      expect(mockRuntimeContextBuilder.build)
        .toHaveBeenCalledWith(
          "What are we building?",
          5
        );

      expect(mockAgent.chat)
        .toHaveBeenCalledWith(
          existingConversation,
          {
            memories,
          }
        );
    });

  it("should stream the AI reply and save the complete response", async () => {

    // Arrange

    const conversation: Conversation = {
      id: "conversation-1",
      messages: [],
    };

    vi.mocked(mockStore.getConversation)
      .mockReturnValue(conversation);

    async function* streamGenerator() {
      yield { content: "Hello " };
      yield { content: "World" };
      yield { content: "!" };
    }

    vi.mocked(mockAgent.stream)
      .mockReturnValue(streamGenerator() as any);

    // Act

    const chunks: string[] = [];

    for await (const chunk of service.streamChat(
      "conversation-1",
      "Hi"
    )) {
      chunks.push(chunk.content as string);
    }

    // Assert

    expect(chunks).toEqual([
      "Hello ",
      "World",
      "!",
    ]);

    expect(mockStore.saveConversation)
      .toHaveBeenCalledTimes(2);

    const savedConversation =
      vi.mocked(mockStore.saveConversation).mock.calls[1][0];

    expect(savedConversation.messages).toHaveLength(2);

    expect(savedConversation.messages[0]).toEqual({
      role: "user",
      content: "Hi",
    });

    expect(savedConversation.messages[1]).toEqual({
      role: "assistant",
      content: "Hello World!",
    });

    expect(mockMemoryManager.prepareConversation)
      .toHaveBeenCalledTimes(1);  

    expect(mockRuntimeContextBuilder.build)
      .toHaveBeenCalledWith("Hi", 5);

    expect(mockAgent.stream)
      .toHaveBeenCalledWith(
        conversation,
        {
          memories: [],
        }
      );  
  });
});