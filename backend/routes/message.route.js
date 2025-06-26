import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage,  sendGroupMessage,
  getGroupMessages, deleteMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);

router.post("/group/send", protectRoute, sendGroupMessage);
router.get("/group/:roomId", protectRoute, getGroupMessages);
router.delete("/delete/:messageId", protectRoute, deleteMessage);

export default router;