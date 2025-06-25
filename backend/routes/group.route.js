// routes/group.routes.js
import express from "express";
import { createGroup, getGroups,updateGroup } from "../controllers/Group.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, createGroup);
router.get("/get-groups", protectRoute, getGroups);
router.put("/:id", protectRoute, updateGroup);

export default router;
