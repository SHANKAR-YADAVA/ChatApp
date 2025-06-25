import { X, Edit, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";

const GroupChatHeader = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  console.log(authUser)
  const {
    selectedGroup,
    setSelectedGroup,
    getGroups,
    isUpdatingGroup,
  } = useChatStore();

  // ✅ Final and correct isCreator logic
  const isCreator = selectedGroup?.createdBy?._id === authUser?._id;


  const handleClose = () => {
    setSelectedGroup(null);
    navigate(-1);
  };

  const handleEdit = () => {
    if (!selectedGroup?._id) return;
    navigate(`/groups/${selectedGroup._id}/edit`);
    
  };


  return (
    <div className="p-3 border-b border-base-300 bg-base-100">
      <div className="flex items-center justify-between">
        {/* Left side: Group avatar and name */}
        <div className="flex items-center gap-3">
          <div
            className="avatar group cursor-pointer"
            onClick={isCreator ? handleEdit : undefined}
          >
            <div className="size-11 rounded-full relative">
              <img
                src={selectedGroup?.icon || "/group-avatar.png"}
                alt={selectedGroup?.name || "Group"}
                className="object-cover"
              />
              {isCreator && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <Edit className="size-4 text-white" />
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-lg">
                {selectedGroup?.name || "Group Chat"}
              </h3>
              {isCreator && (
                <button
                  onClick={handleEdit}
                  className="text-primary hover:text-primary-focus"
                  disabled={isUpdatingGroup}
                  title="Edit Group"
                >
                  <Edit className="size-4" />
                </button>
              )}
            </div>
            <p className="text-sm text-base-content/70">
              {isCreator ? "You created this group" : "Group chat"}
            </p>
          </div>
        </div>

        {/* Right side: Refresh and Close buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-base-200 transition-colors"
            aria-label="Close chat"
            title="Close chat"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupChatHeader; 