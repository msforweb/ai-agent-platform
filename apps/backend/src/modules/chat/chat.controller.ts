import { Request, Response } from "express";

import { ChatRequestSchema } from "./dto/chat-request.dto.js";
import { ChatService } from "./chat.service.js";
import { asyncHandler } from "../../config/middleware/async-handler.js";

export class ChatController {
  constructor(private readonly service: ChatService) {}

  chat = asyncHandler(async (req: Request, res: Response) => {
    const { conversationId, message } = ChatRequestSchema.parse(req.body);


    const reply = await this.service.chat(
      conversationId, 
      message
    );

    res.json({
      success: true,
      reply,
    });
  });
}