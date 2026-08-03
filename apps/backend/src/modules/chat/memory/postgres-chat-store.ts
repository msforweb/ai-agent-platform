import { PrismaClient } from "../../../generated/prisma/client.js";

import { ChatStore } from "../interfaces/chat-store.interface.js";
import { Conversation } from "../types/conversation.js";

export class PostgresChatStore implements ChatStore {
  constructor(
    private readonly prisma: PrismaClient
  ) {}

  async createConversation(
    id: string
  ): Promise<Conversation> {

    await this.prisma.conversation.create({
      data: {
        id,
      },
    });

    return {
      id,
      messages: [],
    };
  }

  async getConversation(
    id: string
  ): Promise<Conversation | undefined> {

    const conversation =
      await this.prisma.conversation.findUnique({
        where: {
          id,
        },
        include: {
          messages: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

    if (!conversation) {
      return undefined;
    }

    return {
      id: conversation.id,
      messages: conversation.messages.map((message) => ({
        role: message.role as "system" | "user" | "assistant",
        content: message.content,
      })),
    };
  }

  async saveConversation(
    conversation: Conversation
  ): Promise<void> {

    await this.prisma.message.deleteMany({
      where: {
        conversationId: conversation.id,
      },
    });

    await this.prisma.message.createMany({
      data: conversation.messages.map((message) => ({
        conversationId: conversation.id,
        role: message.role,
        content: message.content,
      })),
    });
  }
}