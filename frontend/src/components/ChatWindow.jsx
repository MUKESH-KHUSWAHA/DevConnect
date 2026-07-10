import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useChatStore from '../store/useChatStore';
import useAuthStore from '../store/useAuthStore';
import Avatar from './Avatar';
import { IoSend } from 'react-icons/io5';
import { FiX, FiArrowLeft } from 'react-icons/fi';
import socket from '../utils/socket';

const TYPE_COLORS = {
  internship: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
  fulltime: 'text-green-400 bg-green-500/20 border-green-500/30',
  freelance: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
  hackathon: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
  opensource: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
  collab: 'text-pink-400 bg-pink-500/20 border-pink-500/30'
};

const TYPE_LABELS = {
  internship: '🎓 Internship',
  fulltime: '💼 Full Time',
  freelance: '💻 Freelance',
  hackathon: '⚡ Hackathon',
  opensource: '🔓 Open Source',
  collab: '🤝 Collab'
};

const JobRefCard = ({ jobRef, isMine }) => (
  <div className={`rounded-xl border p-3 mb-1 text-xs ${isMine ? 'bg-blue-700/40 border-blue-400/30' : 'bg-gray-700/60 border-gray-600'}`}>
    <p className={`text-xs font-semibold mb-1 ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
      💼 Regarding this opportunity:
    </p>
    {jobRef.jobType && (
      <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold inline-block mb-1.5 ${TYPE_COLORS[jobRef.jobType] || 'text-gray-400 bg-gray-700 border-gray-600'}`}>
        {TYPE_LABELS[jobRef.jobType] || jobRef.jobType}
      </span>
    )}
    <p className="font-bold text-sm text-white">{jobRef.title}</p>
    <div className="flex gap-3 mt-1 flex-wrap">
      {jobRef.location && <span className={isMine ? 'text-blue-200' : 'text-gray-400'}>📍 {jobRef.location}</span>}
      {jobRef.salary && <span className={isMine ? 'text-blue-200' : 'text-gray-400'}>💰 {jobRef.salary}</span>}
    </div>
  </div>
);

const getDateLabel = (date) => {
  const now = new Date();
  const msgDate = new Date(date);
  const diffDays = Math.floor((now - msgDate) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return msgDate.toLocaleDateString([], { weekday: 'long' });
  return msgDate.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
};

const ChatWindow = ({ jobRef = null, onJobRefUsed, onBack, showBackButton = false }) => {
  const { messages, selectedUser, sendMessage, onlineUsers, typingUsers } = useChatStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [pendingJobRef, setPendingJobRef] = useState(jobRef);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setPendingJobRef(jobRef);
  }, [jobRef, selectedUser]);

  const handleTyping = (e) => {
    setText(e.target.value);
    socket.emit('typing', {
      senderId: user._id.toString(),
      receiverId: selectedUser._id.toString()
    });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', {
        senderId: user._id.toString(),
        receiverId: selectedUser._id.toString()
      });
    }, 2000);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(user._id, selectedUser._id, text, pendingJobRef || null);
    setText('');
    setPendingJobRef(null);
    if (onJobRefUsed) onJobRefUsed();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isOnline = onlineUsers.includes(selectedUser?._id?.toString());
  const isTyping = typingUsers[selectedUser?._id?.toString()];

  const groupedMessages = [];
  let lastDateLabel = null;
  messages.forEach((msg, index) => {
    const dateLabel = getDateLabel(msg.createdAt || new Date());
    if (dateLabel !== lastDateLabel) {
      groupedMessages.push({ type: 'separator', label: dateLabel, key: `sep-${index}` });
      lastDateLabel = dateLabel;
    }
    groupedMessages.push({ type: 'message', msg, key: msg._id || index });
  });

  return (
    <div className="flex-1 flex flex-col bg-gray-950 min-w-0">

      {/* Chat Header */}
      <div className="flex items-center gap-3 px-3 sm:px-4 py-3 border-b border-gray-800 bg-gray-900">
        {showBackButton && (
          <button
            onClick={onBack}
            title="Back to conversations"
            className="md:hidden text-gray-400 hover:text-white transition flex-shrink-0 p-1"
          >
            <FiArrowLeft size={22} />
          </button>
        )}
        <div onClick={() => navigate(`/profile/${selectedUser?._id}`)}>
          <Avatar
            src={selectedUser?.profilePic}
            username={selectedUser?.username}
            size="lg"
            border
            online={isOnline}
            onClick={() => navigate(`/profile/${selectedUser?._id}`)}
          />
        </div>
        <div
          className="cursor-pointer min-w-0"
          onClick={() => navigate(`/profile/${selectedUser?._id}`)}
        >
          <p className="font-semibold text-white text-sm hover:underline truncate">{selectedUser?.username}</p>
          <p className={`text-xs ${isTyping ? 'text-blue-400 italic' : isOnline ? 'text-green-400' : 'text-gray-500'}`}>
            {isTyping ? 'typing...' : isOnline ? 'Active now' : 'Offline'}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 flex flex-col gap-3 bg-gray-950">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-sm">
            <p className="text-4xl mb-2">👋</p>
            <p className="font-semibold text-white">Say hi to {selectedUser?.username}!</p>
            <p className="text-xs mt-1">Start the conversation below</p>
          </div>
        ) : (
          groupedMessages.map((item) => {
            if (item.type === 'separator') {
              return (
                <div key={item.key} className="flex items-center gap-3 my-2">
                  <div className="flex-1 h-px bg-gray-800" />
                  <span className="text-xs text-gray-500 flex-shrink-0">{item.label}</span>
                  <div className="flex-1 h-px bg-gray-800" />
                </div>
              );
            }

            const { msg } = item;
            const isMine = msg.senderId?.toString() === user._id?.toString();

            return (
              <div key={item.key} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                {!isMine && (
                  <Avatar
                    src={selectedUser?.profilePic}
                    username={selectedUser?.username}
                    size="sm"
                    className="mr-2 mt-1 flex-shrink-0"
                    onClick={() => navigate(`/profile/${selectedUser?._id}`)}
                  />
                )}
                <div className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl
                  ${isMine ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-800 text-gray-100 rounded-bl-sm'}`}
                >
                  {msg.jobRef?.title && <JobRefCard jobRef={msg.jobRef} isMine={isMine} />}
                  <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                  <p className={`text-xs mt-1 ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
                    {formatTime(msg.createdAt || new Date())}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Job card preview above input */}
      {pendingJobRef && (
        <div className="px-3 sm:px-4 pt-3 pb-0 bg-gray-900 border-t border-gray-800">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 font-semibold mb-1">💼 Sending regarding:</p>
              {pendingJobRef.jobType && (
                <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold inline-block mb-1 ${TYPE_COLORS[pendingJobRef.jobType] || 'text-gray-400 bg-gray-700 border-gray-600'}`}>
                  {TYPE_LABELS[pendingJobRef.jobType] || pendingJobRef.jobType}
                </span>
              )}
              <p className="text-sm font-bold text-white truncate">{pendingJobRef.title}</p>
              <div className="flex gap-3 text-xs text-gray-400 mt-0.5 flex-wrap">
                {pendingJobRef.location && <span>📍 {pendingJobRef.location}</span>}
                {pendingJobRef.salary && <span>💰 {pendingJobRef.salary}</span>}
              </div>
            </div>
            <button
              onClick={() => {
                setPendingJobRef(null);
                if (onJobRefUsed) onJobRefUsed();
              }}
              className="text-gray-500 hover:text-white mt-0.5 flex-shrink-0"
            >
              <FiX size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSend} className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 border-t border-gray-800 bg-gray-900">
        <input
          type="text"
          placeholder={pendingJobRef ? `Write about your interest in "${pendingJobRef.title}"...` : `Message ${selectedUser?.username}...`}
          value={text}
          onChange={handleTyping}
          className="flex-1 w-full bg-gray-800 border border-gray-700 rounded-full px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 transition"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="w-10 h-10 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white transition flex-shrink-0"
        >
          <IoSend size={16} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
