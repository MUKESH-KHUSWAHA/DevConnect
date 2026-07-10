import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import useAuthStore from '../store/useAuthStore';
import Navbar from '../components/Navbar';
import toast, { Toaster } from 'react-hot-toast';
import { FiGithub, FiLinkedin, FiGlobe, FiEdit, FiX } from 'react-icons/fi';
import { MdWorkOutline } from 'react-icons/md';
import PostCard from '../components/PostCard';
import Avatar from '../components/Avatar';
import Spinner from '../components/Spinner';
import { timeAgo } from '../utils/helpers';

const ProfilePage = () => {
  const { userId } = useParams();
  const { user: loggedInUser } = useAuthStore();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projects');
  const [isFollowing, setIsFollowing] = useState(false);
  const [showModal, setShowModal] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [savedPosts, setSavedPosts] = useState([]);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = loggedInUser?._id === userId;

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  // Add this useEffect after your existing ones
  useEffect(() => {
    if (selectedPost) {
      const updated = posts.find(p => p._id === selectedPost._id);
      if (updated) setSelectedPost(updated);
    }
  }, [posts]);

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get(`/profile/${userId}`);
      setProfile(res.data.user);
      setPosts(res.data.posts);
      setIsFollowing(
        res.data.user.followers?.some(
          f => f._id === loggedInUser?._id || f === loggedInUser?._id
        )
      );
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };
  const fetchSavedPosts = async () => {
    if (!isOwnProfile) return;
    try {
      const res = await axiosInstance.get('/social/saved');
      setSavedPosts(res.data);
    } catch { }
  };

  useEffect(() => {
    fetchProfile();
    fetchSavedPosts();
  }, [userId]);

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      await axiosInstance.put(`/social/follow/${userId}`);
      setIsFollowing(!isFollowing);
      fetchProfile();
    } catch {
      toast.error('Failed to follow');
    } finally {
      setFollowLoading(false);
    }
  };

  // Filter posts by type
  const projectPosts = posts.filter(p => p.postType === 'project');
  const codePosts = posts.filter(p => p.postType === 'snippet');
  const generalPosts = posts.filter(p => p.postType === 'general' || !p.postType);

  const getActivePosts = () => {
    if (activeTab === 'projects') return projectPosts;
    if (activeTab === 'code') return codePosts;
    if (activeTab === 'general') return generalPosts;
    return [];
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <Spinner />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Toaster />
      <Navbar />

      <div className="max-w-4xl mx-auto pt-20 px-4 pb-10">

        {/* Profile Header */}
        <div className="bg-gray-900 rounded-2xl p-4 sm:p-6 mb-6 border border-gray-800">
          <div className="flex flex-col items-center md:flex-row md:items-start gap-4 sm:gap-6">

            {/* Avatar */}
            <div className="flex-shrink-0">
              <Avatar
                src={profile?.profilePic}
                username={profile?.username}
                size="profile"
                border
                borderClass="border-4 border-blue-500"
              />
            </div>

            {/* Info */}
            <div className="flex-1 w-full text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-2xl font-bold">{profile?.username}</h1>
                {profile?.openToWork && (
                  <span className="flex items-center gap-1 text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full">
                    <MdWorkOutline />
                    Open to Work
                  </span>
                )}
              </div>

              {profile?.bio && (
                <p className="text-gray-300 text-sm mb-3">{profile.bio}</p>
              )}

              {/* Tech Stack */}
              {profile?.techStack?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="flex gap-6 mb-4 justify-center md:justify-start">
                <div className="text-center">
                  <p className="font-bold text-lg">{posts.length}</p>
                  <p className="text-gray-400 text-xs">Posts</p>
                </div>
                <div
                  className="text-center cursor-pointer hover:opacity-70 transition"
                  onClick={() => setShowModal('followers')}
                >
                  <p className="font-bold text-lg">
                    {profile?.followers?.length || 0}
                  </p>
                  <p className="text-gray-400 text-xs">Followers</p>
                </div>
                <div
                  className="text-center cursor-pointer hover:opacity-70 transition"
                  onClick={() => setShowModal('following')}
                >
                  <p className="font-bold text-lg">
                    {profile?.following?.length || 0}
                  </p>
                  <p className="text-gray-400 text-xs">Following</p>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-4 mb-4 justify-center md:justify-start flex-wrap">
                {profile?.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-gray-400 hover:text-white text-sm transition"
                  >
                    <FiGithub /> GitHub
                  </a>
                )}
                {profile?.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-gray-400 hover:text-blue-400 text-sm transition"
                  >
                    <FiLinkedin /> LinkedIn
                  </a>
                )}
                {profile?.portfolioUrl && (
                  <a
                    href={profile.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-gray-400 hover:text-green-400 text-sm transition"
                  >
                    <FiGlobe /> Portfolio
                  </a>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center md:justify-start flex-wrap">
                {isOwnProfile ? (
                  <button
                    onClick={() => navigate('/edit-profile')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-semibold transition"
                  >
                    <FiEdit /> Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleFollow}
                      disabled={followLoading}
                      className={`px-6 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50
                        ${isFollowing
                          ? 'bg-gray-700 hover:bg-gray-600'
                          : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                    >
                      {followLoading ? '...' : isFollowing ? 'Unfollow' : 'Follow'}
                    </button>
                    <button
                      onClick={() => navigate(`/chat?userId=${userId}`)}
                      className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-semibold transition"
                    >
                      Message
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs — 3 types */}
        <div className="flex border-b border-gray-800 mb-6 overflow-x-auto">
          {[
            {
              key: 'projects',
              label: 'Projects',
              emoji: '🚀',
              count: projectPosts.length
            },
            {
              key: 'code',
              label: 'Code',
              emoji: '💻',
              count: codePosts.length
            },
            {
              key: 'general',
              label: 'Posts',
              emoji: '📝',
              count: generalPosts.length
            },
            {
              key: 'saved',
              label: 'Saved',
              emoji: '🔖',
              count: 0
            }
          ].map(({ key, label, emoji, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-3 text-sm font-semibold border-b-2 transition flex-shrink-0
                ${activeTab === key
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white'
                }`}
            >
              <span>{emoji}</span>
              <span>{label}</span>
              {count > 0 && (
                <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'saved' ? (
          savedPosts.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-4xl mb-3">🔖</p>
              <p className="font-semibold text-white">No saved posts yet</p>
              <p className="text-sm mt-1">Tap the bookmark icon on any post to save it</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {savedPosts.map((post) => (
                <PostCard key={post._id} post={post} onUpdate={() => { fetchProfile(); fetchSavedPosts(); }} />
              ))}
            </div>
          )
        ) : getActivePosts().length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-4xl mb-3">
              {activeTab === 'projects' ? '🚀' : activeTab === 'code' ? '💻' : '📝'}
            </p>
            <p className="font-semibold text-white">
              No {activeTab === 'projects' ? 'projects' : activeTab === 'code' ? 'code snippets' : 'posts'} yet
            </p>
            {isOwnProfile && (
              <button
                onClick={() => navigate('/')}
                className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-semibold transition"
              >
                Share your first {activeTab === 'projects' ? 'project' : activeTab === 'code' ? 'snippet' : 'post'}
              </button>
            )}
          </div>
        ) : (

          /* Projects & General → Grid view with click to open */
          activeTab !== 'code' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
              {getActivePosts().map((post) => (
                <div
                  key={post._id}
                  onClick={() => setSelectedPost(post)}
                  className="aspect-square bg-gray-800 rounded-sm overflow-hidden cursor-pointer relative group"
                >
                  {post.mediaUrl ? (
                    <img
                      src={post.mediaUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:opacity-75 transition"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 group-hover:bg-gray-700 transition p-3 gap-2">
                      <span className="text-2xl">
                        {post.postType === 'project' ? '🚀' : '📝'}
                      </span>
                      <p className="text-xs text-gray-300 text-center line-clamp-3">
                        {post.title || post.caption}
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  {post.tags?.length > 0 && (
                    <div className="absolute top-2 left-2">
                      <span className="text-xs bg-blue-500/80 text-white px-2 py-0.5 rounded-full">
                        #{post.tags[0]}
                      </span>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-4">
                    <span className="text-white text-sm font-semibold flex items-center gap-1">
                      ❤️ {post.likes?.length || 0}
                    </span>
                    <span className="text-white text-sm font-semibold flex items-center gap-1">
                      💬 {post.comments?.length || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (

            /* Code tab → List view */
            <div className="flex flex-col gap-4">
              {getActivePosts().map((post) => (
                <div
                  key={post._id}
                  onClick={() => setSelectedPost(post)}
                  className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden cursor-pointer hover:border-gray-600 transition"
                >
                  {/* Code header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-800">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-xs text-gray-400 ml-2 font-mono">
                        {post.codeLanguage || 'javascript'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {timeAgo(post.createdAt)}
                    </span>
                  </div>

                  {/* Title */}
                  {post.title && (
                    <div className="px-4 pt-3">
                      <p className="font-semibold text-white">{post.title}</p>
                    </div>
                  )}

                  {/* Code preview */}
                  <pre className="px-4 py-3 text-sm text-green-400 font-mono overflow-hidden max-h-32 line-clamp-4">
                    {post.codeSnippet}
                  </pre>

                  {/* Footer */}
                  <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
                    <div className="flex gap-3">
                      {post.tags?.map(tag => (
                        <span
                          key={tag}
                          className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 text-gray-400 text-sm">
                      <span>❤️ {post.likes?.length || 0}</span>
                      <span>💬 {post.comments?.length || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Post Detail Modal — opens when clicking a post */}
      {selectedPost && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center sm:p-4"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="bg-gray-900 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto border border-gray-700 relative p-4 sm:p-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 z-10 bg-gray-800 hover:bg-gray-700 rounded-full p-2 text-gray-300 hover:text-white transition"
            >
              <FiX size={18} />
            </button>

            {/* Full PostCard inside modal */}
            <PostCard
              post={selectedPost}
              onUpdate={async () => {
                await fetchProfile();
                // Update selectedPost with fresh data so likes reflect immediately
                setSelectedPost(prev => {
                  const updated = posts.find(p => p._id === prev._id);
                  return updated || prev;
                });
              }}
            />
          </div>
        </div>
      )}

      {/* Followers/Following Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center sm:p-4"
          onClick={() => setShowModal(null)}
        >
          <div
            className="bg-gray-900 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm h-full sm:h-auto border border-gray-700 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="font-semibold capitalize">{showModal}</h2>
              <button
                onClick={() => setShowModal(null)}
                className="text-gray-400 hover:text-white text-xl"
              >
                <FiX />
              </button>
            </div>

            <div className="max-h-80 sm:max-h-80 overflow-y-auto flex-1">
              {(showModal === 'followers'
                ? profile?.followers
                : profile?.following
              )?.length === 0 ? (
                <div className="text-center text-gray-500 py-10 text-sm">
                  <p className="text-3xl mb-2">👥</p>
                  <p className="font-semibold text-white">No {showModal} yet</p>
                </div>
              ) : (
                (showModal === 'followers'
                  ? profile?.followers
                  : profile?.following
                )?.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => {
                      setShowModal(null);
                      navigate(`/profile/${u._id}`);
                    }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 cursor-pointer transition"
                  >
                    <Avatar src={u.profilePic} username={u.username} size="lg" />
                    <div>
                      <p className="text-sm font-semibold">{u.username}</p>
                      {u.techStack?.length > 0 && (
                        <p className="text-xs text-gray-400">
                          {u.techStack.slice(0, 2).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;