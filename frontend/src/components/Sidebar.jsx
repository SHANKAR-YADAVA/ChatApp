import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Link } from "react-router-dom";
import { Users, Plus, MessageCircle, ChevronDown, ChevronRight } from "lucide-react";

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
    isGroupsLoading,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [expandedSection, setExpandedSection] = useState({
    directMessages: true,
    groups: true
  });

  useEffect(() => {
    getUsers();
    getGroups();
  }, []);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading || isGroupsLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col bg-base-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-base-300 sticky top-0 bg-base-100 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="size-5" />
            <span className="font-semibold text-base hidden lg:block">Chats</span>
          </div>
          <Link
            to="/create-group"
            className="btn btn-circle btn-sm btn-ghost"
            aria-label="Create new group"
          >
            <Plus className="size-5" />
          </Link>
        </div>

        {/* Online toggle - only shown in direct messages section */}
        {expandedSection.directMessages && (
          <div className="mt-3 hidden lg:flex items-center gap-2 text-sm text-zinc-500">
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="checkbox checkbox-sm checkbox-primary"
              />
              Online only
            </label>
            <span className="text-xs ml-auto">({filteredUsers.length})</span>
          </div>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto py-2">
        {/* Users Section */}
        <div className="mb-2">
          <button
            className="w-full flex items-center justify-between px-4 py-2 hover:bg-base-200 transition"
            onClick={() => setExpandedSection(prev => ({
              ...prev,
              directMessages: !prev.directMessages
            }))}
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              {expandedSection.directMessages ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
              <span>Direct Messages</span>
            </div>
            <span className="text-xs text-zinc-500">
              {showOnlineOnly ? filteredUsers.length : users.length}
            </span>
          </button>

          {expandedSection.directMessages && (
            <div className="mt-1">
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
                <div className="text-center text-zinc-500 py-4 text-sm">
                  {showOnlineOnly ? "No online users" : "No users found"}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Groups Section */}
        <div className="mb-2">
          <button
            className="w-full flex items-center justify-between px-4 py-2 hover:bg-base-200 transition"
            onClick={() => setExpandedSection(prev => ({
              ...prev,
              groups: !prev.groups
            }))}
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              {expandedSection.groups ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
              <span>Group Chats</span>
            </div>
            <span className="text-xs text-zinc-500">{groups.length}</span>
          </button>

          {expandedSection.groups && (
            <div className="mt-1">
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
                    <div className="relative">
                      <img
                        src={group.icon || "/group.png"}
                        alt={group.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </div>
                    <div className="hidden lg:block truncate">
                      <div className="font-medium truncate">{group.name}</div>
                      <div className="text-xs text-zinc-500">
                        {group.members?.length || 0} members
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center text-zinc-500 py-4 text-sm">
                  No groups yet. <Link to="/create-group" className="text-primary hover:underline">Create one!</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;