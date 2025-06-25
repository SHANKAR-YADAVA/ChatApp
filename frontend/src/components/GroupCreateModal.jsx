import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { X, Users, UploadCloud } from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useChatStore } from "../store/useChatStore";

const GroupCreateModal = ({ isOpen, onClose, allUsers }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupIcon, setGroupIcon] = useState("");
  const [previewIcon, setPreviewIcon] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { getGroups } = useChatStore();

  const handleUserToggle = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleURLChange = (e) => {
    const url = e.target.value;
    setGroupIcon(url);
    setPreviewIcon(url);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    setUploading(true);

    reader.readAsDataURL(file);

    reader.onload = () => {
      const base64Image = reader.result;
      setGroupIcon(base64Image);      // Send this base64 image on submit
      setPreviewIcon(base64Image);    // Show preview immediately
      setUploading(false);
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!groupName || selectedUsers.length < 2) {
      toast.error("Provide group name and at least 2 members.");
      return;
    }

    setIsCreating(true);

    try {
      await axiosInstance.post("/groups", {
        name: groupName,
        members: selectedUsers,
        icon: groupIcon,  // base64 string or url
      });

      toast.success("Group created!");
      getGroups();
      onClose();

      setGroupName("");
      setSelectedUsers([]);
      setGroupIcon("");
      setPreviewIcon("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create group");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen bg-black bg-opacity-50 px-4">
        <Dialog.Panel className="bg-base-100 rounded-xl max-w-2xl w-full p-8 relative space-y-6">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
            <X size={20} />
          </button>

          <Dialog.Title className="text-2xl font-semibold text-center mb-4">
            Create New Group
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Group Icon Upload */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <img
                  src={previewIcon || "/group-placeholder.png"}
                  alt="Group Icon"
                  className="w-24 h-24 rounded-full border-4 object-cover"
                />
              </div>

              <div className="w-full space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <UploadCloud className="w-4 h-4" /> Upload Group Icon
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="file-input file-input-bordered w-full"
                />
              </div>

              <p className="text-sm text-zinc-400">or paste a URL below</p>

              <input
                type="url"
                value={groupIcon}
                onChange={handleURLChange}
                placeholder="https://example.com/icon.png"
                className="input input-bordered w-full"
              />
            </div>

            {/* Group Name */}
            <div>
              <label className="flex items-center gap-2 text-sm text-zinc-400 mb-1">
                <Users className="w-4 h-4" />
                Group Name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="input input-bordered w-full"
                placeholder="My Group"
                required
              />
            </div>

            {/* Member Selector */}
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

            <button
              type="submit"
              className="btn btn-primary w-full mt-4 flex justify-center items-center gap-2"
              disabled={uploading || isCreating}
            >
              {(uploading || isCreating) && (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              )}
              {isCreating ? "Creating..." : uploading ? "Uploading..." : "Create Group"}
            </button>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default GroupCreateModal;
