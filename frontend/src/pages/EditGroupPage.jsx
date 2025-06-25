import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Camera, X } from "lucide-react";
import toast from "react-hot-toast";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

const EditGroupPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupIcon, setGroupIcon] = useState("");
  const [previewIcon, setPreviewIcon] = useState("");
  const [uploading, setUploading] = useState(false);

  const { groups, getGroups, users, updateGroup, isUpdatingGroup: isUpdating } = useChatStore();
  const { authUser } = useAuthStore();

  // ✅ Initialize form with current group data
  useEffect(() => {
    const group = groups.find((g) => g._id === groupId);
    if (group) {
      setGroupName(group.name);
      setSelectedUsers(group.members.map((m) => typeof m === "string" ? m : m._id));
      setPreviewIcon(group.icon || "");
    }
  }, [groupId, groups]);

  // ✅ Toggle member and ensure uniqueness
  const handleUserToggle = (userId) => {
    setSelectedUsers((prev) => {
      const updated = prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId];
      return [...new Set(updated)];
    });
  };

  // ✅ Handle icon upload
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

  const handleRemoveIcon = () => {
    setGroupIcon("");
    setPreviewIcon("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!groupName || selectedUsers.length < 2) {
      toast.error("Provide group name and at least 2 members.");
      return;
    }

    const updateData = {
      name: groupName,
      members: [...new Set(selectedUsers)],
      ...(groupIcon && { icon: groupIcon }),
    };

    const success = await updateGroup(groupId, updateData);
    if (success) {
      await getGroups();
      navigate("/");
    }
  };

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Edit Group</h1>
            <p className="mt-2">Update your group information</p>
          </div>

          {/* Group Photo Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <img
                src={previewIcon || "/group-placeholder.png"}
                alt="Group Icon"
                className="size-32 rounded-full object-cover border-4 border-base-200"
              />
              <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full">
                <label
                  className={`p-2 rounded-full cursor-pointer bg-primary hover:scale-105 transition-all duration-200 ${uploading ? "animate-pulse pointer-events-none" : ""}`}
                >
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                {previewIcon && (
                  <button
                    onClick={handleRemoveIcon}
                    className="p-2 rounded-full bg-error hover:scale-105 transition-all"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-zinc-400">
              {uploading ? "Uploading..." : "Click to change group photo"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-sm text-zinc-400">Group Name</label>
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
                <label className="text-sm text-zinc-400">Group Members</label>
                <div className="max-h-60 overflow-y-auto border rounded-lg p-2 space-y-2">
                  {users.map((user) => (
                    <label
                      key={user._id}
                      className="flex items-center justify-between p-2 hover:bg-base-200 rounded"
                    >
                      <span>{user.fullName}</span>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => handleUserToggle(user._id)}
                        disabled={user._id === authUser._id}
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>

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
                disabled={uploading || isUpdating}
              >
                {isUpdating ? (
                  <span className="flex items-center gap-2">
                    <span className="loading loading-spinner"></span>
                    Updating...
                  </span>
                ) : (
                  "Update Group"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditGroupPage;
