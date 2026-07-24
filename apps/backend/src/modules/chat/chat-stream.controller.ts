import { Request, Response } from "express";

import { ChatRequestSchema } from "./dto/chat-request.dto.js";
import { ChatService } from "./chat.service.js";
import { asyncHandler } from "../../config/middleware/async-handler.js";

export class ChatStreamController {
  constructor(
    private readonly service: ChatService
  ) {}

  stream = asyncHandler(async (req: Request, res: Response) => {
    const { conversationId, message } =
      ChatRequestSchema.parse(req.body);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Some proxies buffer responses. This header helps disable buffering.
    res.setHeader("X-Accel-Buffering", "no");

    for await (const chunk of this.service.streamChat(
      conversationId,
      message
    )) {
      const content =
        typeof chunk.content === "string"
          ? chunk.content
          : "";

      if (content.length > 0) {
        res.write(`data: ${content}\n\n`);
      }
    }

    res.write("event: done\n");
    res.write("data: [DONE]\n\n");

    res.end();
  });
}