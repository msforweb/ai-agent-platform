import { Router } from "express";

import { application } from "../../bootstrap/application.js";

const router = Router();

const controller = application.chatController;

router.post("/", controller.chat);

export default router;