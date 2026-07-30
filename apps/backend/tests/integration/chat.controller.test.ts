import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

import { app } from "../../src/app.js";
import { application } from "../../src/bootstrap/application.js";

describe("Chat API", () => {

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should return a successful chat response", async () => {

    // Arrange
    vi.spyOn(application.chatController["service"], "chat")
      .mockResolvedValue("Hello from AI");

    // Act
    const response = await request(app)
      .post("/api/v1/chat")
      .send({
        conversationId: "conversation-1",
        message: "Hello",
      });

    // Assert
    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      reply: "Hello from AI",
    });

  });

});