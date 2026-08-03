import { describe, it, expect } from "vitest";

import { InMemoryChatStore } from "../../../src/modules/chat/memory/in-memory-chat-store.js";

describe("InMemoryChatStore", () => {

  it("should create a new conversation", async () => {

    // Arrange
    const store = new InMemoryChatStore();

    // Act
    const conversation = await store.createConversation("conversation-1");

    // Assert
    expect(conversation.id).toBe("conversation-1");
    expect(conversation.messages).toEqual([]);

  });

  it("should save and retrieve a conversation", async () => {

    // Arrange
    const store = new InMemoryChatStore();

    const conversation = await store.createConversation("conversation-1");

    conversation.messages.push({
      role: "user",
      content: "Hello",
    });

    // Act
    await store.saveConversation(conversation);

    const loadedConversation =
      await store.getConversation("conversation-1");

    // Assert
    expect(loadedConversation).toEqual(conversation);

  });

  it("should return undefined for an unknown conversation", async () => {

    // Arrange
    const store = new InMemoryChatStore();

    // Act
    const conversation =
      await store.getConversation("unknown");

    // Assert
    expect(conversation).toBeUndefined();

  });

});