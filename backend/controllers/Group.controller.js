// controllers/group.controller.js
import Group from "../models/group.model.js";

export const createGroup = async (req, res) => {
  try {
    const { name, icon, members } = req.body;
    const createdBy = req.user._id;

    const newGroup = new Group({
      name,
      icon,
      createdBy,
      members: [...members, createdBy], // creator is a member
    });

    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (err) {
    res.status(500).json({ error: "Failed to create group." });
  }
};


export const getGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await Group.find({ members: userId }).populate("members", "-password");

    res.status(200).json(groups);
  } catch (err) {
    console.error("Error fetching groups:", err);
    res.status(500).json({ error: "Failed to fetch groups." });
  }
};