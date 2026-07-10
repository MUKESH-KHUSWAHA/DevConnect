import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useChatStore from '../store/useChatStore';
import useAuthStore from '../store/useAuthStore';
import Avatar from './Avatar';

const ChatSidebar = ({ className = '' }) => {
  const { users, selectedUser, setSelectedUser, getMessages, onlineUsers, unreadMap, typingUsers } = useChatStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('messages');

  const handleSelectUser = (u) => {
    setSelectedUser(u);
    getMessages(u._id);
  };

  const mainUsers = users.filter(u => !u.isRequest);
  const requestUsers = users.filter(u => u.isRequest);

  const formatLastMessage = (u) => {
    if (typingUsers[u._id?.toString()]) return 'typing...';
    if (!u.lastMessage) return 'Start a conversation';
    const isMine = u.lastMessage.senderId?.toString() === user?._id?.toString();
    const preview = u.lastMessage.text?.length > 30
      ? u.lastMessage.text.slice(0, 30) + '...'
      : u.lastMessage.text;
    return isMine ? `You: ${preview}` : preview;
  };

  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const msgDate = new Date(date);
    const diffDays = Math.floor((now - msgDate) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return msgDate.toLocaleDateString([], { weekday: 'short' });
    return msgDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const renderUser = (u) => {
    const isOnline = onlineUsers.includes(u._id?.toString());
    const isSelected = selectedUser?._id === u._id;
    const hasUnread = !!unreadMap[u._id?.toString()];
    const unreadCount = unreadMap[u._id?.toString()] || 0;
    const isTyping = typingUsers[u._id?.toString()];

    return (
      <div
        key={u._id}
        onClick={() => handleSelectUser(u)}
        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition
          ${isSelected
            ? 'bg-gray-800 border-l-2 border-blue-500'
            : hasUnread
              ? 'bg-blue-500/5 border-l-2 border-red-500 hover:bg-gray-800/50'
              : 'hover:bg-gray-800/50 border-l-2 border-transparent'
          }`}
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/profile/${u._id}`);
          }}
        >
          <Avatar
            src={u.profilePic}
            username={u.username}
            size="xl"
            online={isOnline}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <p className={`text-sm truncate ${hasUnread ? 'font-bold text-white' : 'font-semibold text-white'}`}>
              {u.username}
            </p>
            {u.isRequest && (
              <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-1.5 py-0.5 rounded-full flex-shrink-0">
                Unknown
              </span>
            )}
          </div>
          <p className={`text-xs truncate mt-0.5 ${isTyping ? 'text-blue-400 italic' : hasUnread ? 'text-white' : 'text-gray-500'}`}>
            {formatLastMessage(u)}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {u.lastMessage?.createdAt && (
            <span className="text-xs text-gray-500">
              {formatTime(u.lastMessage.createdAt)}
            </span>
          )}
          {hasUnread && !isSelected && (
            <span className="text-xs bg-red-500 text-white font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full md:w-72 border-r border-gray-800 bg-gray-900 h-full overflow-y-auto flex-shrink-0 ${className}`}>
      <div className="p-4 border-b border-gray-800">
        <p className="font-bold text-white text-lg">{user?.username}</p>
        <p className="text-sm text-gray-400">Messages</p>
      </div>

      <div className="flex border-b border-gray-800">
        <button
          onClick={() => setActiveTab('messages')}
          className={`flex-1 py-2.5 text-sm font-semibold transition
            ${activeTab === 'messages' ? 'text-white border-b-2 border-blue-500' : 'text-gray-500 hover:text-white'}`}
        >
          Messages
          {mainUsers.some(u => unreadMap[u._id?.toString()]) && (
            <span className="ml-1.5 w-2 h-2 bg-red-500 rounded-full inline-block" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-2.5 text-sm font-semibold transition relative
            ${activeTab === 'requests' ? 'text-white border-b-2 border-blue-500' : 'text-gray-500 hover:text-white'}`}
        >
          Requests
          {requestUsers.length > 0 && (
            <span className="ml-1.5 text-xs bg-yellow-500 text-black font-bold px-1.5 py-0.5 rounded-full">
              {requestUsers.length}
            </span>
          )}
        </button>
      </div>

      <div className="flex flex-col">
        {activeTab === 'messages' ? (
          mainUsers.length === 0 ? (
            <div className="text-center text-gray-500 text-sm mt-10 px-4">
              <p className="text-3xl mb-2">👥</p>
              <p className="font-semibold text-white">No conversations yet</p>
              <p className="mt-1">Follow developers to start chatting</p>
            </div>
          ) : (
            mainUsers.map(renderUser)
          )
        ) : (
          requestUsers.length === 0 ? (
            <div className="text-center text-gray-500 text-sm mt-10 px-4">
              <p className="text-3xl mb-2">📭</p>
              <p className="font-semibold text-white">No message requests</p>
              <p className="mt-1">Messages from non-followers appear here</p>
            </div>
          ) : (
            <div>
              <p className="text-xs text-gray-500 px-4 py-3 border-b border-gray-800">
                These people are not in your network. You can still reply to them.
              </p>
              {requestUsers.map(renderUser)}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
