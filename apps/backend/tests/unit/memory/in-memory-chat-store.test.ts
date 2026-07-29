import { describe, it, expect } from "vitest";

import { InMemoryChatStore } from "../../../src/modules/chat/memory/in-memory-chat-store.js";

describe("InMemoryChatStore", () => {

  it("should create a new conversation", () => {

    // Arrange
    const store = new InMemoryChatStore();

    // Act
    const conversation = store.createConversation("conversation-1");

    // Assert
    expect(conversation.id).toBe("conversation-1");
    expect(conversation.messages).toEqual([]);

  });

  it("should save and retrieve a conversation", () => {

    // Arrange
    const store = new InMemoryChatStore();

    const conversation = store.createConversation("conversation-1");

    conversation.messages.push({
      role: "user",
      content: "Hello",
    });

    // Act
    store.saveConversation(conversation);

    const loadedConversation =
      store.getConversation("conversation-1");

    // Assert
    expect(loadedConversation).toEqual(conversation);

  });

  it("should return undefined for an unknown conversation", () => {

    // Arrange
    const store = new InMemoryChatStore();

    // Act
    const conversation =
      store.getConversation("unknown");

    // Assert
    expect(conversation).toBeUndefined();

  });

});