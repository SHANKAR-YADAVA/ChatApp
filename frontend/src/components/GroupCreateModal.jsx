import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useChatStore } from "../store/useChatStore";

const GroupCreateModal = ({ isOpen, onClose, allUsers }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupIcon, setGroupIcon] = useState("");

  const { getGroups } = useChatStore();

  const handleUserToggle = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!groupName || selectedUsers.length < 2) {
      toast.error("Provide group name and at least 2 members.");
      return;
    }

    try {
      const res = await axiosInstance.post("/groups", {
        name: groupName,
        members: selectedUsers,
        icon: groupIcon,
      });

      toast.success("Group created!");
      getGroups();
      onClose();

      // Reset state
      setGroupName("");
      setSelectedUsers([]);
      setGroupIcon("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create group");
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen bg-black bg-opacity-50 px-4">
        <Dialog.Panel className="bg-base-100 rounded-lg w-full max-w-lg p-6 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
            <X size={20} />
          </button>

          <Dialog.Title className="text-lg font-bold mb-4">Create New Group</Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="input input-bordered w-full"
              required
            />

            <input
              type="url"
              placeholder="Group Icon URL (optional)"
              value={groupIcon}
              onChange={(e) => setGroupIcon(e.target.value)}
              className="input input-bordered w-full"
            />

            <div>
              <label className="font-semibold mb-1 block">Select Members</label>
              <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                {allUsers.map((user) => (
                  <label key={user._id} className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => handleUserToggle(user._id)}
                    />
                    <span>{user.fullName}</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full">Create Group</button>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default GroupCreateModal;
