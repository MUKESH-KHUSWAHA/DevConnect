import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { useEffect, useState, useRef } from 'react';
import axiosInstance from '../utils/axios';
import useChatStore from '../store/useChatStore';
import socket from '../utils/socket';
import Avatar from './Avatar';
import { AiOutlineHome, AiFillHome } from 'react-icons/ai';
import { BsChatDots, BsChatDotsFill, BsBriefcase, BsBriefcaseFill } from 'react-icons/bs';
import { IoSearchOutline } from 'react-icons/io5';
import { AiOutlineBell, AiFillBell } from 'react-icons/ai';
import { MdWorkOutline } from 'react-icons/md';
import { FiLogOut } from 'react-icons/fi';

const Navbar = ({ activePage = 'home' }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isSearchPage = location.pathname === '/search';
  const { unreadMap, fetchUnreadPerSender } = useChatStore();

  const [unreadCount, setUnreadCount] = useState(0);
  const prevUnreadCount = useRef(0);
  const isFirstLoad = useRef(true);

  const hasUnreadMessages = Object.keys(unreadMap).length > 0;

  useEffect(() => {
    fetchUnreadCount();
    fetchUnreadPerSender();
    const interval = setInterval(() => {
      fetchUnreadCount();
      fetchUnreadPerSender();
    }, 30000);

    socket.on('newNotification', () => {
      fetchUnreadCount();
    });

    return () => {
      clearInterval(interval);
      socket.off('newNotification');
    };
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await axiosInstance.get('/notifications');
      const unread = res.data.filter(n => !n.read).length;

      if (isFirstLoad.current) {
        isFirstLoad.current = false;
        prevUnreadCount.current = unread;
        setUnreadCount(unread);
        return;
      }

      if (unread > prevUnreadCount.current) {
        playNotificationSound();
      }

      prevUnreadCount.current = unread;
      setUnreadCount(unread);
    } catch {
      // silent fail
    }
  };

  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch {
      // silent fail
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-950 border-b border-gray-800 z-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2">

        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer flex-shrink-0"
          onClick={() => navigate('/')}
        >
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">DC</span>
          </div>
          <span className="text-white font-bold text-lg hidden md:block">DevConnect</span>
        </div>

        {/* Search Bar — desktop */}
        {!isSearchPage && (
          <div
            className="hidden md:flex items-center bg-gray-800 rounded-lg px-3 py-2 w-72 gap-2 cursor-pointer"
            onClick={() => navigate('/search')}
          >
            <IoSearchOutline className="text-gray-400 text-lg flex-shrink-0" />
            <span className="text-sm text-gray-500">Search developers...</span>
          </div>
        )}

        {/* Mobile search icon */}
        {!isSearchPage && (
          <button
            onClick={() => navigate('/search')}
            title="Search"
            className="flex md:hidden text-xl text-gray-400 hover:text-white transition"
          >
            <IoSearchOutline />
          </button>
        )}

        {/* Right Icons */}
        <div className="flex items-center gap-3 sm:gap-5">

          <button
            onClick={() => navigate('/')}
            title="Home"
            className={`text-xl transition ${activePage === 'home' ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
          >
            {activePage === 'home' ? <AiFillHome /> : <AiOutlineHome />}
          </button>

          <button
            onClick={() => navigate('/hiring')}
            title="Hiring Board"
            className={`text-xl transition ${activePage === 'hiring' ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
          >
            {activePage === 'hiring' ? <BsBriefcaseFill /> : <BsBriefcase />}
          </button>

          <button
            onClick={() => navigate('/chat')}
            title="Messages"
            className={`text-xl transition relative ${activePage === 'chat' ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
          >
            {activePage === 'chat' ? <BsChatDotsFill /> : <BsChatDots />}
            {hasUnreadMessages && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-gray-950 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => {
              setUnreadCount(0);
              prevUnreadCount.current = 0;
              navigate('/notifications');
            }}
            title="Notifications"
            className={`text-xl transition relative ${activePage === 'notifications' ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
          >
            {activePage === 'notifications' ? <AiFillBell /> : <AiOutlineBell />}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <div
            onClick={() => navigate(`/profile/${user?._id}`)}
            title="Profile"
            className="flex items-center gap-2 cursor-pointer"
          >
            {user?.openToWork && (
              <span className="hidden md:flex items-center gap-1 text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-1 rounded-full">
                <MdWorkOutline />
                Open to work
              </span>
            )}
            <Avatar
              src={user?.profilePic}
              username={user?.username}
              size="md"
              border
            />
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            title="Logout"
            className="text-xl text-gray-400 hover:text-red-400 transition"
          >
            <FiLogOut />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
