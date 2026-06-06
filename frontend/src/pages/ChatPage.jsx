import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import useAuthStore from '../store/useAuthStore';
import useChatStore from '../store/useChatStore';
import socket from '../utils/socket';
import ChatSidebar from '../components/ChatSidebar';
import ChatWindow from '../components/ChatWindow';
import axiosInstance from '../utils/axios';

const ChatPage = () => {
  const { user } = useAuthStore();
  const {
    getUsers,
    selectedUser,
    setSelectedUser,
    getMessages,
    addMessage,
    setOnlineUsers,
    setTyping,
    fetchUnreadPerSender
  } = useChatStore();

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [jobRef, setJobRef] = useState(null);
  const jobRefUserId = useRef(null);

  const openChatWithUser = async (userId) => {
    try {
      setSelectedUser(null);
      const res = await axiosInstance.get(`/profile/${userId}`);
      setSelectedUser(res.data.user);
      getMessages(userId);
    } catch {
      // silent fail
    }
  };

  useEffect(() => {
    if (!user) return navigate('/login');

    const chatWithUserId = searchParams.get('userId');
    const jobTitle = searchParams.get('jobTitle');

    if (jobTitle) {
      const newJobRef = {
        title: decodeURIComponent(jobTitle),
        jobType: searchParams.get('jobType') || '',
        location: decodeURIComponent(searchParams.get('jobLocation') || ''),
        salary: decodeURIComponent(searchParams.get('jobSalary') || '')
      };
      setJobRef(newJobRef);
      jobRefUserId.current = chatWithUserId;
    }

    if (chatWithUserId) {
      openChatWithUser(chatWithUserId);
    }

    if (searchParams.toString()) {
      setSearchParams({}, { replace: true });
    }

  }, [searchParams]);

  useEffect(() => {
    if (!user) return;

    socket.connect();

    socket.on('connect', () => {
      socket.emit('userOnline', user._id.toString());
    });

    socket.on('receiveMessage', (message) => {
      addMessage(message);
    });

    socket.on('onlineUsers', (users) => {
      setOnlineUsers(users);
    });

    socket.on('userTyping', ({ senderId }) => {
      setTyping(senderId, true);
    });

    socket.on('userStoppedTyping', ({ senderId }) => {
      setTyping(senderId, false);
    });

    getUsers();
    fetchUnreadPerSender();

    return () => {
      socket.off('connect');
      socket.off('receiveMessage');
      socket.off('onlineUsers');
      socket.off('userTyping');
      socket.off('userStoppedTyping');
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (!selectedUser) return;
    if (selectedUser._id?.toString() !== jobRefUserId.current?.toString()) {
      setJobRef(null);
    }
  }, [selectedUser]);

  const handleBack = () => {
    setSelectedUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar activePage="chat" />
      <div className="max-w-5xl mx-auto pt-14 h-[calc(100vh-3.5rem)] flex">
        <ChatSidebar
          className={selectedUser ? 'hidden md:block' : 'block'}
        />
        {selectedUser ? (
          <ChatWindow
            jobRef={jobRef}
            onJobRefUsed={() => setJobRef(null)}
            onBack={handleBack}
            showBackButton
          />
        ) : (
          <div className="hidden md:flex flex-1 flex-col items-center justify-center text-gray-500 bg-gray-950">
            <p className="text-6xl mb-4">💬</p>
            <p className="text-xl font-semibold text-white">Your Messages</p>
            <p className="text-sm mt-2">Select a user to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
