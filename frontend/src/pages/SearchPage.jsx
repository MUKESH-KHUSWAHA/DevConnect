import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import Navbar from '../components/Navbar';
import useAuthStore from '../store/useAuthStore';
import toast, { Toaster } from 'react-hot-toast';
import { IoSearchOutline } from 'react-icons/io5';
import { MdWorkOutline } from 'react-icons/md';
import Avatar from '../components/Avatar';
import Spinner from '../components/Spinner';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); // ← track if user searched
  const [followingMap, setFollowingMap] = useState({});
  const [followLoading, setFollowLoading] = useState(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleSearch = async () => {
    // Don't search if empty
    if (!query.trim()) {
      toast.error('Please enter a name to search');
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const res = await axiosInstance.get(
        `/profile/search?query=${query.trim()}`
      );
      setResults(res.data);

      // Build following map from backend isFollowing flag
      const map = {};
      res.data.forEach(u => {
        map[u._id] = u.isFollowing || false;
      });
      setFollowingMap(map);
    } catch {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    setFollowLoading(userId);
    try {
      await axiosInstance.put(`/social/follow/${userId}`);
      const isNowFollowing = !followingMap[userId];
      setFollowingMap(prev => ({ ...prev, [userId]: isNowFollowing }));
      toast.success(isNowFollowing ? 'Followed!' : 'Unfollowed');
    } catch {
      toast.error('Failed');
    } finally {
      setFollowLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Toaster />
      <Navbar activePage="search" />

      <div className="max-w-2xl mx-auto pt-20 px-4 pb-10">

        {/* Page Title */}
        <h1 className="text-xl font-bold mb-4 text-white">
          Find Developers
        </h1>

        {/* Search Input — always visible including mobile */}
        <div className="flex gap-2 mb-6">
          <div className="flex-1 flex items-center bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 gap-3">
            <IoSearchOutline className="text-gray-400 text-xl flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by username..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="bg-transparent outline-none flex-1 text-sm text-white placeholder-gray-500"
              autoFocus
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setHasSearched(false);
                }}
                className="text-gray-500 hover:text-white text-lg"
              >
                ✕
              </button>
            )}
          </div>

          {/* Search Button — always visible */}
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-5 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 rounded-xl font-semibold text-sm transition flex-shrink-0"
          >
            {loading ? '...' : 'Search'}
          </button>
        </div>

        {/* Before search — show prompt */}
        {!hasSearched && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-5xl mb-4">🔍</p>
            <p className="font-semibold text-white text-lg">
              Search for developers
            </p>
            <p className="text-sm mt-2">
              Type a username and press Search
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && <Spinner size="sm" className="py-6" />}

        {/* Results */}
        {!loading && hasSearched && (
          <div>
            {results.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <p className="text-4xl mb-3">😕</p>
                <p className="font-semibold text-white">
                  No developers found for "{query}"
                </p>
                <p className="text-sm mt-1">
                  Try a different username
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-gray-400 mb-1">
                  {results.length} developer{results.length !== 1 ? 's' : ''} found
                </p>
                {results.map((u) => (
                  <div
                    key={u._id}
                    className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-gray-600 transition"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Avatar */}
                    <div
                      className="cursor-pointer flex-shrink-0"
                      onClick={() => navigate(`/profile/${u._id}`)}
                    >
                      <Avatar
                        src={u.profilePic}
                        username={u.username}
                        size="2xl"
                        border
                      />
                    </div>

                    {/* Info */}
                    <div
                      className="flex-1 cursor-pointer min-w-0"
                      onClick={() => navigate(`/profile/${u._id}`)}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold truncate">{u.username}</p>
                        {u.openToWork && (
                          <span className="flex items-center gap-1 text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full flex-shrink-0">
                            <MdWorkOutline size={10} />
                            Open to work
                          </span>
                        )}
                      </div>
                      {u.bio && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          {u.bio}
                        </p>
                      )}
                      {u.techStack?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {u.techStack.slice(0, 3).map((tech) => (
                            <span
                              key={tech}
                              className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full"
                            >
                              {tech}
                            </span>
                          ))}
                          {u.techStack.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{u.techStack.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    </div>

                    {/* Follow / Unfollow Button */}
                    <button
                      onClick={() => handleFollow(u._id)}
                      disabled={followLoading === u._id}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition w-full sm:w-auto flex-shrink-0 disabled:opacity-50
                        ${followingMap[u._id]
                          ? 'bg-gray-700 hover:bg-red-500/20 hover:text-red-400 text-white border border-gray-600'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                    >
                      {followingMap[u._id] ? 'Following' : 'Follow'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;