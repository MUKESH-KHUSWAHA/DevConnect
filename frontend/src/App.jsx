import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from './store/useAuthStore';
import useChatStore from './store/useChatStore';
import socket from './utils/socket';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import FeedPage from './pages/FeedPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import SearchPage from './pages/SearchPage';
import HiringBoard from './pages/HiringBoard';
import toast from 'react-hot-toast';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" />;
};

function App() {
  const { user } = useAuthStore();
  const { setOnlineUsers, addMessage, setTyping, getUsers } = useChatStore();

  useEffect(() => {
    if (!user) return;

    socket.connect();

    socket.on('connect', () => {
      socket.emit('userOnline', user._id.toString());
    });

    socket.on('onlineUsers', (users) => {
      setOnlineUsers(users);
    });

    socket.on('receiveMessage', (message) => {
      addMessage(message);
      getUsers();
    });

    socket.on('userTyping', ({ senderId }) => {
      setTyping(senderId, true);
    });

    socket.on('userStoppedTyping', ({ senderId }) => {
      setTyping(senderId, false);
    });

    // ← Real-time notifications
    socket.on('newNotification', (notification) => {
      const type = notification.type;
      const sender = notification.senderId?.username || 'Someone';
      const messages = {
        like: `❤️ ${sender} liked your post`,
        comment: `💬 ${sender} commented on your post`,
        follow: `👤 ${sender} started following you`,
        save: `🔖 ${sender} saved your post`
      };
      toast(messages[type] || `🔔 ${sender} interacted with you`, {
        style: {
          background: '#1f2937',
          color: '#fff',
          border: '1px solid #374151'
        }
      });
    });

    return () => {
      socket.off('connect');
      socket.off('onlineUsers');
      socket.off('receiveMessage');
      socket.off('userTyping');
      socket.off('userStoppedTyping');
      socket.off('newNotification');
      socket.disconnect();
    };
  }, [user]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/profile/:userId" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/edit-profile" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
        <Route path="/hiring" element={<ProtectedRoute><HiringBoard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;