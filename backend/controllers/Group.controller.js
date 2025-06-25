import Group from "../models/group.model.js";
import cloudinary from "cloudinary";

export const createGroup = async (req, res) => {
  try {
    const { name, icon, members } = req.body;
    const createdBy = req.user._id;

    if (!name || !members || members.length < 2) {
      return res.status(400).json({ message: "Group name and at least 2 members are required" });
    }

    let iconUrl = "";

    // Upload group icon if provided
    if (icon) {
      const uploadRes = await cloudinary.uploader.upload(icon);
      iconUrl = uploadRes.secure_url;
    }

    // Ensure creator is also in the members list
    const allMembers = members.includes(createdBy.toString())
      ? members
      : [...members, createdBy];

    const newGroup = new Group({
      name,
      icon: iconUrl,
      members: allMembers,
      createdBy,
    });

    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (error) {
    console.error("Error in createGroup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await Group.find({ members: userId })
      .populate("members", "-password")
      .populate("createdBy", "-password");

    res.status(200).json(groups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const { name, icon, members } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You are not authorized to update this group" });
    }

    let iconUrl = group.icon;

    if (icon) {
      const uploadRes = await cloudinary.uploader.upload(icon);
      iconUrl = uploadRes.secure_url;
    }

    group.name = name || group.name;
    group.icon = iconUrl;

    // Ensure creator is not accidentally removed
    if (Array.isArray(members)) {
      const ensuredMembers = members.includes(userId.toString())
        ? members
        : [...members, userId];
      group.members = ensuredMembers;
    }

    await group.save();
    await group.populate("members createdBy", "-password");

    res.status(200).json(group);
  } catch (error) {
    console.error("Error updating group:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};






