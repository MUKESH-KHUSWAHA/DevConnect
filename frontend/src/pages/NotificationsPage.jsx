import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import Navbar from '../components/Navbar';
import Avatar from '../components/Avatar';
import Spinner from '../components/Spinner';
import toast, { Toaster } from 'react-hot-toast';
import { timeAgo } from '../utils/helpers';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get('/notifications');
      setNotifications(res.data);
      // Mark all as read
      await axiosInstance.put('/notifications/read');
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const getNotificationText = (type) => {
    switch (type) {
      case 'like': return 'liked your project';
      case 'comment': return 'commented on your project';
      case 'follow': return 'started following you';
      case 'save': return 'saved your project';
      default: return 'interacted with you';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like': return '❤️';
      case 'comment': return '💬';
      case 'follow': return '👤';
      case 'save': return '🔖';
      default: return '🔔';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Toaster />
      <Navbar activePage="notifications" />

      <div className="max-w-2xl mx-auto pt-20 px-4 pb-10">
        <h1 className="text-xl font-bold mb-6">Notifications</h1>

        {loading ? (
          <Spinner />
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-4xl mb-3">🔔</p>
            <p className="font-semibold text-white">No notifications yet</p>
            <p className="text-sm mt-1">When someone likes or follows you, it'll appear here</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`flex items-center gap-3 p-4 rounded-xl border transition cursor-pointer hover:bg-gray-800
                  ${n.read ? 'bg-gray-900 border-gray-800' : 'bg-blue-500/10 border-blue-500/30'}`}
                onClick={() => {
                  if (n.postId) navigate(`/`);
                  else navigate(`/profile/${n.senderId._id}`);
                }}
              >
                {/* Sender Avatar */}
                <div className="relative flex-shrink-0">
                  <Avatar
                    src={n.senderId?.profilePic}
                    username={n.senderId?.username}
                    size="xl"
                  />
                  <div className="absolute -bottom-1 -right-1 text-sm">
                    {getNotificationIcon(n.type)}
                  </div>
                </div>

                {/* Text */}
                <div className="flex-1">
                  <p className="text-sm">
                    <span
                      className="font-semibold cursor-pointer hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/profile/${n.senderId._id}`);
                      }}
                    >
                      {n.senderId?.username}
                    </span>
                    {' '}{getNotificationText(n.type)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {timeAgo(n.createdAt)}
                  </p>
                </div>

                {/* Post thumbnail */}
                {n.postId?.mediaUrl && (
                  <img
                    src={n.postId.mediaUrl}
                    alt="post"
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                )}

                {/* Unread dot */}
                {!n.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;