import Group from "../models/group.model.js";
import cloudinary from "cloudinary";

// ---------------------- CREATE GROUP ----------------------
export const createGroup = async (req, res) => {
  try {
    const { name, icon, members } = req.body;
    const createdBy = req.user._id;

    if (!name || !members || members.length < 2) {
      return res.status(400).json({
        message: "Group name and at least 2 members are required",
      });
    }

    // ✅ Check for duplicate group name by same creator
    const existingGroup = await Group.findOne({ name, createdBy });
    if (existingGroup) {
      return res
        .status(400)
        .json({ message: "You already have a group with this name" });
    }

    let iconUrl = "";

    // ✅ Upload group icon if provided
    if (icon) {
      const uploadRes = await cloudinary.uploader.upload(icon);
      iconUrl = uploadRes.secure_url;
    }

    // ✅ Ensure creator is in the members list
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

// ---------------------- GET GROUPS ----------------------
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

// ---------------------- UPDATE GROUP ----------------------
export const updateGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const { name, icon, members } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // ✅ Only creator can update the group
    if (group.createdBy.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this group" });
    }

    // ✅ Check for duplicate group name on rename
    if (name && name !== group.name) {
      const duplicate = await Group.findOne({
        name,
        createdBy: userId,
        _id: { $ne: groupId },
      });
      if (duplicate) {
        return res.status(400).json({
          message: "You already have another group with this name",
        });
      }
      group.name = name;
    }

    let iconUrl = group.icon;
    if (icon) {
      const uploadRes = await cloudinary.uploader.upload(icon);
      iconUrl = uploadRes.secure_url;
    }

    group.icon = iconUrl;

    // ✅ Ensure creator is in the list and remove duplicates
    if (Array.isArray(members)) {
      const withCreator = [...members, userId.toString()];
      const uniqueMembers = [...new Set(withCreator)];
      group.members = uniqueMembers;
    }

    await group.save();
    await group.populate("members createdBy", "-password");

    res.status(200).json(group);
  } catch (error) {
    console.error("Error updating group:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

