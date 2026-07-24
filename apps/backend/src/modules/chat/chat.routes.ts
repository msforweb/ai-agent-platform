import { Router } from "express";

import { application } from "../../bootstrap/application.js";

const router = Router();

router.post("/", application.chatController.chat);

router.post("/stream", application.chatStreamController.stream);

export default router;