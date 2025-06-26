import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  groups: [],
  selectedUser: null,
  selectedGroup: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isUpdatingGroup: false,

  // -------- USERS --------
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // -------- GROUPS --------
  getGroups: async () => {
    try {
      const res = await axiosInstance.get("/groups/get-groups");
      set({ groups: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load groups");
    }
  },
updateGroup: async (groupId, data) => {
  set({ isUpdatingGroup: true });

  try {
    const res = await axiosInstance.put(`/groups/${groupId}`, data); // ✅ Send base64 icon directly
    const updatedGroup = res.data;

    set((state) => ({
      groups: state.groups.map((group) =>
        group._id === groupId ? updatedGroup : group
      ),
      ...(state.selectedGroup?._id === groupId && {
        selectedGroup: updatedGroup,
      }),
    }));

    toast.success("Group updated successfully");
    return updatedGroup;
  } catch (error) {
    console.error("updateGroup error:", error);
    toast.error(error.response?.data?.message || "Failed to update group");
    return null;
  } finally {
    set({ isUpdatingGroup: false });
  }
},

  // -------- MESSAGES --------
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  getGroupMessages: async (groupId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/group/${groupId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load group messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // -------- SEND MESSAGES --------
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      console.error("sendMessage error:", error);
      toast.error(error.response?.data?.message || "Failed to send direct message");
    }
  },

  sendGroupMessage: async (messageData) => {
    const { selectedGroup, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/group/send`, {
        ...messageData,
        roomId: selectedGroup._id,
      });
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send group message");
    }
  },

  // -------- DELETE MESSAGE --------
  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/delete/${messageId}`);
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== messageId),
      }));
      toast.success("Message deleted");
    } catch (error) {
      console.error("deleteMessage error:", error);
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },

  // -------- SUBSCRIBE SOCKET --------
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageFromSelectedUser) return;
      set({ messages: [...get().messages, newMessage] });
    });

    socket.on("messageDeleted", ({ messageId }) => {
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== messageId),
      }));
    });
  },

  subscribeToGroupMessages: () => {
    const { selectedGroup } = get();
    const socket = useAuthStore.getState().socket;
    if (!socket || !selectedGroup) return;

    socket.emit("joinRoom", selectedGroup._id);

    socket.on("groupMessage", (newMessage) => {
      if (newMessage.roomId === selectedGroup._id) {
        set({ messages: [...get().messages, newMessage] });
      }
    });

    socket.on("messageDeleted", ({ messageId }) => {
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== messageId),
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("groupMessage");
    socket.off("messageDeleted");
  },

  // -------- SELECTORS --------
  setSelectedUser: (selectedUser) =>
    set({ selectedUser, selectedGroup: null, messages: [] }),

  setSelectedGroup: (selectedGroup) =>
    set({ selectedGroup, selectedUser: null, messages: [] }),
}));
