import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import Navbar from '../components/Navbar';
import UploadPost from '../components/UploadPost';
import PostCard from '../components/PostCard';
import Avatar from '../components/Avatar';
import Spinner from '../components/Spinner';
import toast, { Toaster } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import { FiX } from 'react-icons/fi';

const ALL_TAGS = [
  'react', 'nextjs', 'vue', 'angular', 'svelte',
  'javascript', 'typescript', 'html', 'css', 'tailwind',
  'redux', 'jquery',
  'nodejs', 'express', 'python', 'django', 'flask',
  'fastapi', 'java', 'springboot', 'php', 'laravel',
  'ruby', 'rails', 'go', 'rust', 'cpp', 'c',
  'dotnet', 'csharp',
  'flutter', 'reactnative', 'android', 'ios', 'swift',
  'kotlin',
  'mongodb', 'postgresql', 'mysql', 'sqlite', 'redis',
  'firebase', 'supabase', 'cassandra', 'dynamodb',
  'docker', 'kubernetes', 'aws', 'azure', 'gcp',
  'linux', 'nginx', 'cicd', 'git', 'github',
  'python', 'machinelearning', 'deeplearning', 'tensorflow',
  'pytorch', 'nlp', 'computervision', 'datascience',
  'pandas', 'numpy',
  'graphql', 'restapi', 'websockets', 'blockchain',
  'solidity', 'web3', 'cybersecurity', 'dsa',
  'systemdesign', 'microservices'
];

const TAG_CATEGORIES = [
  {
    label: '🎨 Frontend',
    tags: ['react', 'nextjs', 'vue', 'angular', 'svelte', 'javascript', 'typescript', 'html', 'css', 'tailwind', 'redux']
  },
  {
    label: '⚙️ Backend',
    tags: ['nodejs', 'express', 'python', 'django', 'flask', 'fastapi', 'java', 'springboot', 'php', 'laravel', 'go', 'rust', 'dotnet']
  },
  {
    label: '📱 Mobile',
    tags: ['flutter', 'reactnative', 'android', 'ios', 'swift', 'kotlin']
  },
  {
    label: '🗄️ Database',
    tags: ['mongodb', 'postgresql', 'mysql', 'redis', 'firebase', 'supabase', 'sqlite']
  },
  {
    label: '☁️ DevOps & Cloud',
    tags: ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'linux', 'cicd', 'git']
  },
  {
    label: '🤖 AI & ML',
    tags: ['machinelearning', 'deeplearning', 'tensorflow', 'pytorch', 'nlp', 'datascience', 'pandas', 'numpy']
  },
  {
    label: '🔗 Other',
    tags: ['graphql', 'restapi', 'websockets', 'blockchain', 'web3', 'cybersecurity', 'dsa', 'systemdesign']
  }
];

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [followingMap, setFollowingMap] = useState({});
  const [activeTags, setActiveTags] = useState([]);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [followLoading, setFollowLoading] = useState(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const fetchPosts = async (tags = []) => {
    setLoading(true);
    try {
      const url = tags.length > 0
        ? `/posts/feed?tags=${tags.join(',')}`
        : '/posts/feed';
      const res = await axiosInstance.get(url);
      setPosts(res.data);
    } catch {
      toast.error('Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestedUsers = async () => {
    try {
      const res = await axiosInstance.get('/profile/search?query=');
      const notFollowing = res.data.filter(u => !u.isFollowing);
      setSuggestedUsers(notFollowing.slice(0, 8));
      const map = {};
      res.data.forEach(u => { map[u._id] = u.isFollowing || false; });
      setFollowingMap(map);
    } catch {}
  };

  useEffect(() => {
    fetchPosts();
    fetchSuggestedUsers();
  }, []);

  const toggleTag = (tag) => {
    const newTags = activeTags.includes(tag)
      ? activeTags.filter(t => t !== tag)
      : [...activeTags, tag];
    setActiveTags(newTags);
    fetchPosts(newTags);
  };

  const clearTags = () => {
    setActiveTags([]);
    fetchPosts([]);
  };

  const handleFollow = async (userId) => {
    setFollowLoading(userId);
    try {
      await axiosInstance.put(`/social/follow/${userId}`);
      const isNowFollowing = !followingMap[userId];
      setFollowingMap(prev => ({ ...prev, [userId]: isNowFollowing }));
      if (isNowFollowing) {
        toast.success('Followed!');
        setTimeout(() => {
          setSuggestedUsers(prev => prev.filter(u => u._id !== userId));
        }, 1000);
      } else {
        toast.success('Unfollowed');
      }
    } catch {
      toast.error('Failed');
    } finally {
      setFollowLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Toaster />
      <Navbar activePage="home" />

      <div className="max-w-5xl mx-auto pt-20 px-3 sm:px-4 flex flex-col lg:flex-row gap-4 lg:gap-8">

        {/* Feed - Main Column */}
        <div className="flex-1 w-full max-w-lg mx-auto lg:mx-0">

          {/* Suggested Developers Bar */}
          {suggestedUsers.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-300">
                  Suggested Developers
                </p>
                <button
                  onClick={() => navigate('/search')}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  See all
                </button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-1">
                {suggestedUsers.map((u) => (
                  <div
                    key={u._id}
                    className="flex flex-col items-center gap-2 flex-shrink-0"
                  >
                    <div
                      className="cursor-pointer"
                      onClick={() => navigate(`/profile/${u._id}`)}
                    >
                      <Avatar
                        src={u.profilePic}
                        username={u.username}
                        size="2xl"
                        border
                        borderClass="border-2 border-blue-500 hover:border-purple-500 transition"
                      />
                    </div>
                    <span
                      onClick={() => navigate(`/profile/${u._id}`)}
                      className="text-xs text-gray-400 w-16 text-center truncate cursor-pointer hover:text-white transition"
                    >
                      {u.username}
                    </span>
                    <button
                      onClick={() => handleFollow(u._id)}
                      disabled={followLoading === u._id}
                      className={`text-xs px-3 py-1 rounded-full font-semibold transition disabled:opacity-50
                        ${followingMap[u._id]
                          ? 'bg-gray-700 text-white'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                    >
                      {followingMap[u._id] ? 'Following' : 'Follow'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tag Filter */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl mb-4 overflow-hidden">

            {/* Filter Header */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-300">
                  Filter by Tech
                </p>
                {activeTags.length > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {activeTags.length} selected
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {activeTags.length > 0 && (
                  <button
                    onClick={clearTags}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                  >
                    <FiX size={12} /> Clear all
                  </button>
                )}
                <button
                  onClick={() => setShowTagFilter(!showTagFilter)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                >
                  {showTagFilter ? 'Hide ▲' : 'Show ▼'}
                </button>
              </div>
            </div>

            {/* Selected tags preview */}
            {activeTags.length > 0 && (
              <div className="flex flex-wrap gap-2 px-4 pb-3">
                {activeTags.map(tag => (
                  <span
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className="flex items-center gap-1 text-xs bg-blue-500/20 text-blue-400 border border-blue-500/50 px-3 py-1 rounded-full cursor-pointer hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 transition"
                  >
                    #{tag} <FiX size={10} />
                  </span>
                ))}
              </div>
            )}

            {/* Tag Categories — expandable */}
            {showTagFilter && (
              <div className="border-t border-gray-800 px-4 py-3 flex flex-col gap-4 max-h-72 overflow-y-auto">
                {TAG_CATEGORIES.map(({ label, tags }) => (
                  <div key={label}>
                    <p className="text-xs text-gray-500 font-semibold mb-2">
                      {label}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {tags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`text-xs px-3 py-1 rounded-full border transition
                            ${activeTags.includes(tag)
                              ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                              : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500'
                            }`}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active filter message */}
          {activeTags.length > 0 && (
            <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/30 rounded-lg px-4 py-2 mb-4">
              <p className="text-sm text-blue-400">
                Showing posts tagged:{' '}
                <span className="font-bold">
                  {activeTags.map(t => `#${t}`).join(', ')}
                </span>
              </p>
              <button
                onClick={clearTags}
                className="text-xs text-blue-400 hover:text-white font-semibold ml-2"
              >
                Clear ✕
              </button>
            </div>
          )}

          {/* Upload Post */}
          <UploadPost onPostCreated={() => fetchPosts(activeTags)} />

          {/* Posts */}
          {loading ? (
            <Spinner />
          ) : posts.length === 0 ? (
            <div className="text-center text-gray-500 mt-10 bg-gray-900 border border-gray-800 rounded-xl p-10">
              <p className="text-4xl mb-3">💻</p>
              <p className="font-semibold text-white">
                {activeTags.length > 0
                  ? `No posts found for selected tags`
                  : 'No posts yet'
                }
              </p>
              <p className="text-sm mt-1">
                {activeTags.length > 0
                  ? 'Try selecting different tags'
                  : 'Be the first to share a project!'
                }
              </p>
              {activeTags.length > 0 && (
                <button
                  onClick={clearTags}
                  className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-semibold transition"
                >
                  See all posts
                </button>
              )}
            </div>
          ) : (
            posts.map((post) => (
              <PostCard key={post._id} post={post} onUpdate={() => fetchPosts(activeTags)} />
            ))
          )}
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block w-80 pt-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => navigate(`/profile/${user?._id}`)}
              >
                <Avatar src={user?.profilePic} username={user?.username} size="xl" border />
                <div>
                  <p className="text-sm font-semibold text-white">
                    {user?.username}
                  </p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/edit-profile')}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300"
              >
                Edit
              </button>
            </div>
            {user?.techStack?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {user.techStack.slice(0, 4).map((tech) => (
                  <span
                    key={tech}
                    className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Developers to follow sidebar */}
          {suggestedUsers.filter(u => !followingMap[u._id]).length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-300">
                  Developers to follow
                </p>
                <button
                  onClick={() => navigate('/search')}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  See all
                </button>
              </div>
              {suggestedUsers
                .filter(u => !followingMap[u._id])
                .slice(0, 5)
                .map((u) => (
                  <div
                    key={u._id}
                    className="flex items-center justify-between mb-4 last:mb-0"
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => navigate(`/profile/${u._id}`)}
                    >
                      <Avatar src={u.profilePic} username={u.username} size="lg" />
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {u.username}
                        </p>
                        <p className="text-xs text-gray-400">
                          {u.techStack?.slice(0, 2).join(', ') || 'Developer'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleFollow(u._id)}
                      className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
                    >
                      Follow
                    </button>
                  </div>
                ))}
            </div>
          )}
          <p className="text-xs text-gray-600 mt-6 text-center">
            © 2026 DevConnect
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeedPage;