import { create } from 'zustand';
import axiosInstance from '../utils/axios';
import socket from '../utils/socket';

const useChatStore = create((set, get) => ({
  users: [],
  messages: [],
  selectedUser: null,
  onlineUsers: [],
  unreadMap: {},
  typingUsers: {},

  getUsers: async () => {
    try {
      const res = await axiosInstance.get('/messages/users');
      set({ users: res.data });
    } catch (error) {
      console.error('Failed to get users');
    }
  },

  getMessages: async (userId) => {
    // ← Clear messages first before loading new ones
    set({ messages: [] });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
      // Clear unread for this user
      set((state) => {
        const newMap = { ...state.unreadMap };
        delete newMap[userId];
        return { unreadMap: newMap };
      });
    } catch (error) {
      console.error('Failed to get messages');
    }
  },

  fetchUnreadPerSender: async () => {
    try {
      const res = await axiosInstance.get('/messages/unread-per-sender');
      const map = {};
      res.data.forEach(({ _id, count }) => {
        map[_id.toString()] = count;
      });
      set({ unreadMap: map });
    } catch {}
  },

  sendMessage: (senderId, receiverId, text, jobRef = null) => {
    socket.emit('sendMessage', {
      senderId: senderId.toString(),
      receiverId: receiverId.toString(),
      text,
      jobRef
    });
    socket.emit('stopTyping', {
      senderId: senderId.toString(),
      receiverId: receiverId.toString()
    });
  },

  addMessage: (message) => {
    const { selectedUser } = get();
    const isCurrentChat =
      message.senderId?.toString() === selectedUser?._id?.toString() ||
      message.receiverId?.toString() === selectedUser?._id?.toString();

    if (isCurrentChat) {
      set((state) => ({ messages: [...state.messages, message] }));
    } else {
      // Increment unread for sender
      set((state) => ({
        unreadMap: {
          ...state.unreadMap,
          [message.senderId]: (state.unreadMap[message.senderId] || 0) + 1
        }
      }));
    }

    // Update last message preview in sidebar
    set((state) => ({
      users: state.users.map(u => {
        const isRelated =
          u._id.toString() === message.senderId?.toString() ||
          u._id.toString() === message.receiverId?.toString();
        if (isRelated) {
          return {
            ...u,
            lastMessage: {
              text: message.text,
              createdAt: message.createdAt || new Date(),
              senderId: message.senderId
            }
          };
        }
        return u;
      })
    }));
  },

  setTyping: (userId, isTyping) => {
    set((state) => ({
      typingUsers: { ...state.typingUsers, [userId]: isTyping }
    }));
  },

  // ← Clear messages when switching users
  setSelectedUser: (user) => {
    set({ selectedUser: user, messages: [] });
  },

  setOnlineUsers: (users) => set({ onlineUsers: users }),
}));

export default useChatStore;