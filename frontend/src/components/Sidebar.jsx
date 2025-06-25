import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import GroupCreateModal from "./GroupCreateModal";
import { Users, Plus } from "lucide-react";

const Sidebar = () => {
  const {
    getUsers,
    getGroups,
    users,
    groups,
    selectedUser,
    selectedGroup,
    setSelectedUser,
    setSelectedGroup,
    isUsersLoading,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  useEffect(() => {
    getUsers();
    getGroups();
  }, []);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col bg-base-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-base-300 sticky top-0 bg-base-100 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="size-5" />
            <span className="font-semibold text-base hidden lg:block">Chats</span>
          </div>
          <Plus
            className="cursor-pointer size-5 text-zinc-500 hover:text-primary transition"
            onClick={() => setIsGroupModalOpen(true)}
          />
        </div>

        <div className="mt-3 hidden lg:flex items-center gap-2 text-sm text-zinc-500">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            Online only
          </label>
          <span className="text-xs ml-auto">({onlineUsers.length - 1})</span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto py-2">

        {/* Users */}
        <div className="mb-4">
          <div className="text-xs text-zinc-400 px-4 pb-1">Direct Messages</div>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <button
                key={user._id}
                onClick={() => {
                  setSelectedGroup(null);
                  setSelectedUser(user);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-base-200 transition ${
                  selectedUser?._id === user._id ? "bg-base-300" : ""
                }`}
              >
                <div className="relative">
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.fullName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {onlineUsers.includes(user._id) && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="hidden lg:block truncate">
                  <div className="font-medium truncate">{user.fullName}</div>
                  <div className="text-xs text-zinc-500">
                    {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center text-zinc-500 py-4">No users found</div>
          )}
        </div>

        {/* Groups */}
        <div>
          <div className="text-xs text-zinc-400 px-4 pb-1">Groups</div>
          {groups.length > 0 ? (
            groups.map((group) => (
              <button
                key={group._id}
                onClick={() => {
                  setSelectedUser(null);
                  setSelectedGroup(group);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-base-200 transition ${
                  selectedGroup?._id === group._id ? "bg-base-300" : ""
                }`}
              >
                <img
                  src={group.icon || "/group.png"}
                  alt={group.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="hidden lg:block truncate">
                  <div className="font-medium truncate">{group.name}</div>
                  <div className="text-xs text-zinc-500">Group chat</div>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center text-zinc-500 py-4">No groups yet</div>
          )}
        </div>
      </div>

      {/* Modal */}
      <GroupCreateModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        allUsers={users}
      />
    </aside>
  );
};

export default Sidebar;
