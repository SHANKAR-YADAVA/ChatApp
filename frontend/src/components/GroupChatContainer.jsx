import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect, useRef } from "react";
import GroupChatHeader from "./GroupChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";
import { Trash2 } from "lucide-react"; // 🗑️ Icon

const GroupChatContainer = () => {
  const {
    selectedGroup,
    messages,
    getGroupMessages,
    isMessagesLoading,
    subscribeToGroupMessages,
    unsubscribeFromMessages,
    users,
    getUsers,
    deleteMessage, // ✅ Zustand delete
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (!selectedGroup?._id) return;

    getGroupMessages(selectedGroup._id);
    subscribeToGroupMessages();
    getUsers();

    return () => unsubscribeFromMessages();
  }, [selectedGroup]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <GroupChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <GroupChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwnMessage = message.senderId === authUser._id;
          const sender = isOwnMessage
            ? authUser
            : users.find((u) => u._id === message.senderId);

          return (
            <div
              key={message._id}
              className={`chat ${isOwnMessage ? "chat-end" : "chat-start"} relative group`}
              ref={messageEndRef}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={sender?.profilePic || "/avatar.png"}
                    alt={sender?.fullName || "User"}
                  />
                </div>
              </div>

              <div className="chat-header mb-1 flex items-center gap-1">
                <span className="text-xs font-medium text-base-content">
                  {sender?.fullName || "Unknown"}
                </span>
                <time className="text-xs opacity-50">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>

              <div className="chat-bubble flex flex-col relative">
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}
                {message.text && <p>{message.text}</p>}

                {/* 🗑️ Delete Button (only for own messages) */}
                {isOwnMessage && (
                  <button
                    onClick={() => deleteMessage(message._id)}
                    className="absolute -top-4 right-0 p-1 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition"
                    title="Delete message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <MessageInput />
    </div>
  );
};

export default GroupChatContainer;
