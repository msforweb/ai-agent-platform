import { Request, Response } from "express";

import { ChatRequestSchema } from "./dto/chat-request.dto.js";
import { ChatService } from "./chat.service.js";

export class ChatController {
  private readonly service = new ChatService();

  chat = async (req: Request, res: Response) => {
    try {
      const { message } = ChatRequestSchema.parse(req.body);

      const reply = await this.service.chat(message);

      res.json({
        success: true,
        reply,
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          errors: error.issues,
        });
      }

      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  };
}