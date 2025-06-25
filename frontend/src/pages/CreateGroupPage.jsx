import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera } from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useChatStore } from "../store/useChatStore";

const CreateGroupPage = () => {
  const DEFAULT_GROUP_ICON = "https://cdn-icons-png.flaticon.com/512/9131/9131529.png";
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [previewIcon, setPreviewIcon] = useState(DEFAULT_GROUP_ICON);
const [groupIcon, setGroupIcon] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { getGroups, users } = useChatStore();

  const handleUserToggle = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    setUploading(true);

    reader.readAsDataURL(file);

    reader.onload = () => {
      const base64Image = reader.result;
      setGroupIcon(base64Image);
      setPreviewIcon(base64Image);
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
        icon: groupIcon || DEFAULT_GROUP_ICON, // Use default icon if none provided
      });

      toast.success("Group created!");
      getGroups();
      navigate("/");

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
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Create New Group</h1>
            <p className="mt-2">Your group information</p>
          </div>

          {/* Group Photo Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={previewIcon || DEFAULT_GROUP_ICON}
                className="size-32 rounded-full object-cover border-4 border-base-200"
              />
              <label
                className={`
                  absolute bottom-0 right-0 
                  bg-primary hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${uploading ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {uploading ? "Uploading..." : "Click the camera icon to update group photo"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Group Info Section */}
            <div className="space-y-6">
              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400">Group Name</div>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Enter group name"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400">Group Members</div>
                <div className="max-h-60 overflow-y-auto border rounded-lg p-2 space-y-2">
                  {users.map((user) => (
                    <label key={user._id} className="flex items-center justify-between p-2 hover:bg-base-200 rounded">
                      <span>{user.fullName}</span>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => handleUserToggle(user._id)}
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={uploading || isCreating}
              >
                {isCreating ? (
                  <span className="flex items-center gap-2">
                    <span className="loading loading-spinner"></span>
                    Creating...
                  </span>
                ) : (
                  "Create Group"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupPage;