// routes/group.routes.js
import express from "express";
import { createGroup, getGroups } from "../controllers/Group.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, createGroup);
router.get("/", protectRoute, getGroups);

export default router;
