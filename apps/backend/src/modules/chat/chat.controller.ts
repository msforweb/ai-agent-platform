import { Request, Response } from "express";

import { ChatRequestSchema } from "./dto/chat-request.dto.js";
import { ChatService } from "./chat.service.js";
import { asyncHandler } from "../../config/middleware/async-handler.js";

export class ChatController {
  private readonly service = new ChatService();

  chat = asyncHandler(async (req: Request, res: Response) => {
    const { message } = ChatRequestSchema.parse(req.body);

    const reply = await this.service.chat(message);

    res.json({
      success: true,
      reply,
    });
  });
}