import { describe, it, expect, beforeAll, afterAll } from "vitest";

import {
  AIMessage,
  AIMessageChunk,
  BaseMessage,
} from "@langchain/core/messages";

import { prisma } from "../../src/infrastructure/database/prisma.service.js";

import { PostgresChatStore } from "../../src/modules/chat/memory/postgres-chat-store.js";
import { PostgresMemoryStore } from "../../src/modules/memory/stores/postgres-memory.store.js";
import { LocalEmbeddingProvider } from "../../src/modules/memory/providers/local-embedding.provider.js";
import { MemoryService } from "../../src/modules/memory/memory.service.js";

import { RuntimeContextBuilder } from "../../src/ai/runtime/runtime-context-builder.js";

import { DefaultMemoryManager } from "../../src/ai/memory/memory-manager.js";
import { SimpleTokenCounter } from "../../src/ai/memory/token-counter.js";

import { LangGraphAgent } from "../../src/ai/agents/langgraph.agent.js";
import { LLMNode } from "../../src/ai/graph/nodes/llm.node.js";
import { ChatGraph } from "../../src/ai/graph/graphs/chat.graph.js";

import { SimpleAgentRuntime } from "../../src/ai/runtime/simple-agent-runtime.js";

import { ChatService } from "../../src/modules/chat/chat.service.js";

import { LLMProvider } from "../../src/ai/interfaces/llm-provider.interface.js";
import { Summarizer } from "../../src/ai/memory/interfaces/summarizer.interface.js";


class FakeLLMProvider implements LLMProvider {
  public lastMessages: BaseMessage[] = [];

  async invoke(
    messages: BaseMessage[]
  ): Promise<AIMessage> {
    this.lastMessages = messages;

    return new AIMessage(
      "The AI agent platform uses PHP and JavaScript."
    );
  }

  async *stream(
    messages: BaseMessage[]
  ): AsyncGenerator<AIMessageChunk> {
    this.lastMessages = messages;

    yield new AIMessageChunk({
      content: "The AI agent platform ",
    });

    yield new AIMessageChunk({
      content: "uses PHP and JavaScript.",
    });
  }
}


describe("Chat memory integration", () => {
  const conversationId =
    `integration-memory-${Date.now()}`;

  let fakeProvider: FakeLLMProvider;
  let chatService: ChatService;

  beforeAll(async () => {
    fakeProvider =
      new FakeLLMProvider();

    const chatStore =
      new PostgresChatStore(prisma);

    const embeddingProvider =
      new LocalEmbeddingProvider();

    const memoryStore =
      new PostgresMemoryStore(prisma);

    const memoryService =
      new MemoryService(
        memoryStore,
        embeddingProvider
      );

    const runtimeContextBuilder =
      new RuntimeContextBuilder(
        memoryService
      );

    const tokenCounter =
      new SimpleTokenCounter();

    const summarizer =
        new FakeSummarizer();

    const memoryManager =
        new DefaultMemoryManager(
            tokenCounter,
            summarizer
        );

    const llmNode =
      new LLMNode(fakeProvider);

    const chatGraph =
      new ChatGraph(llmNode);

    const chatAgent =
      new LangGraphAgent(chatGraph);

    const agentRuntime =
      new SimpleAgentRuntime(chatAgent);

    chatService =
      new ChatService(
        agentRuntime,
        chatStore,
        memoryManager,
        runtimeContextBuilder
      );

    await prisma.conversation.create({
      data: {
        id: conversationId,
      },
    });

    await memoryService.remember(
      conversationId,
      "The user knows PHP and JavaScript."
    );
  });


  afterAll(async () => {
    await prisma.conversation.delete({
      where: {
        id: conversationId,
      },
    });
  });


  it(
    "should retrieve a stored memory and pass it to the LLM",
    async () => {
      const reply =
        await chatService.chat(
          conversationId,
          "Which programming languages does the user know?"
        );

      expect(reply)
        .toContain("PHP");

      expect(reply)
        .toContain("JavaScript");

      expect(fakeProvider.lastMessages.length)
        .toBeGreaterThan(0);

      const memoryMessage =
        fakeProvider.lastMessages.find(
          (message) =>
            message.content
              .toString()
              .includes(
                "The user knows PHP and JavaScript."
              )
        );

      expect(memoryMessage)
          .toBeDefined();
    },
    30000
  );
});

class FakeSummarizer implements Summarizer {
  async summarize(): Promise<string> {
    return "Summary";
  }
}