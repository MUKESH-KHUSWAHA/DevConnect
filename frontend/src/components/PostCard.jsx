import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import { FaRegComment } from 'react-icons/fa';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';
import { IoPaperPlaneOutline } from 'react-icons/io5';
import { BsThreeDots } from 'react-icons/bs';
import { FiGithub, FiExternalLink } from 'react-icons/fi';
import { RiRobot2Line } from 'react-icons/ri';
import Avatar from './Avatar';
import { timeAgo } from '../utils/helpers';

const PostCard = ({ post, onUpdate }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [saved, setSaved] = useState(post.savedByMe || false); // ← only once
  const [savingPost, setSavingPost] = useState(false);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);

  // AI Review state
  const [aiReview, setAiReview] = useState(post.aiReview?.generatedAt ? post.aiReview : null);
  const [showAiReview, setShowAiReview] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);

  const isLiked = post.likes?.includes(user?._id);
  const isOwner = post.userId?._id === user?._id || post.userId === user?._id;

  const handleLike = async () => {
    try {
      await axiosInstance.put(`/social/like/${post._id}`);
      onUpdate();
    } catch {
      toast.error('Failed to like post');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await axiosInstance.post(`/social/comment/${post._id}`, { text: comment });
      setComment('');
      fetchComments();
      onUpdate();
    } catch {
      toast.error('Failed to add comment');
    }
  };

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const res = await axiosInstance.get(`/social/comment/${post._id}`);
      setComments(res.data);
      setShowComments(true);
    } catch {
      toast.error('Failed to fetch comments');
    } finally {
      setLoadingComments(false);
    }
  };

  const toggleComments = () => {
    if (showComments) {
      setShowComments(false);
    } else {
      fetchComments();
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/posts/${post._id}`);
      toast.success('Post deleted');
      onUpdate();
    } catch {
      toast.error('Failed to delete post');
    }
  };

  const handleSave = async () => {
    setSavingPost(true);
    try {
      const res = await axiosInstance.put(`/social/save/${post._id}`);
      setSaved(res.data.saved);
      toast.success(res.data.saved ? 'Post saved!' : 'Post unsaved');
    } catch {
      toast.error('Failed to save post');
    } finally {
      setSavingPost(false);
    }
  };

  const handleAiReview = async () => {
    if (aiReview) {
      setShowAiReview(!showAiReview);
      return;
    }
    setLoadingAi(true);
    try {
      const res = await axiosInstance.post(`/ai/review/${post._id}`);
      setAiReview(res.data.review);
      setShowAiReview(true);
      if (res.data.cached) {
        toast.success('Loaded saved AI review');
      } else {
        toast.success('AI review generated!');
      }
    } catch {
      toast.error('AI review failed, try again');
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl mb-6 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate(`/profile/${post.userId?._id}`)}
        >
          <Avatar
            src={post.userId?.profilePic}
            username={post.userId?.username}
            size="md"
            ring
          />
          <div>
            <p className="text-sm font-semibold text-white leading-none">{post.userId?.username}</p>
            <p className="text-xs text-gray-400 mt-0.5">{timeAgo(post.createdAt)}</p>
          </div>
        </div>

        {/* Three dots menu */}
        <div className="relative">
          <button
            onClick={() => setShowDeleteMenu(!showDeleteMenu)}
            className="text-gray-400 hover:text-white transition"
          >
            <BsThreeDots />
          </button>
          {showDeleteMenu && (
            <div className="absolute right-0 top-6 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 min-w-32">
              <button
                onClick={() => navigate(`/profile/${post.userId?._id}`)}
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-t-lg"
              >
                View Profile
              </button>
              {isOwner && (
                <button
                  onClick={() => { setShowDeleteMenu(false); handleDelete(); }}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-b-lg"
                >
                  Delete Post
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Title */}
      {post.title && (
        <div className="px-4 pb-2">
          <p className="font-semibold text-white">{post.title}</p>
        </div>
      )}

      {/* Tech Tags */}
      {post.tags?.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag} className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Media */}
      {post.mediaUrl && post.mediaType !== 'none' && (
        post.mediaType === 'image' ? (
          <img src={post.mediaUrl} alt="post" className="w-full object-cover max-h-96" onDoubleClick={handleLike} />
        ) : (
          <video src={post.mediaUrl} controls className="w-full max-h-96" />
        )
      )}

      {/* Code Snippet */}
      {post.postType === 'snippet' && post.codeSnippet && (
        <div className="mx-4 mb-3 bg-gray-950 rounded-lg overflow-hidden border border-gray-700">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
            <span className="text-xs text-gray-400 font-mono">
              {post.codeLanguage || 'javascript'}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(post.codeSnippet);
                toast.success('Code copied!');
              }}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Copy
            </button>
          </div>
          <pre className="p-4 text-sm text-green-400 font-mono overflow-x-auto whitespace-pre-wrap">
            {post.codeSnippet}
          </pre>

          {/* AI Review Button — only for post owner */}
          {isOwner && (
            <div className="border-t border-gray-700 px-4 py-3">
              <button
                onClick={handleAiReview}
                disabled={loadingAi}
                className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition disabled:opacity-50"
              >
                <RiRobot2Line size={14} />
                {loadingAi
                  ? 'Analyzing code...'
                  : aiReview
                    ? showAiReview ? 'Hide AI Review' : 'Show AI Review'
                    : 'Get AI Review'
                }
              </button>

              {showAiReview && aiReview && (
                <div className="mt-3 flex flex-col gap-3">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">🧠</span>
                      <p className="text-xs font-bold text-blue-400 uppercase tracking-wide">Concept Used</p>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">{aiReview.concept}</p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">⚠️</span>
                      <p className="text-xs font-bold text-red-400 uppercase tracking-wide">Issues & Edge Cases</p>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">{aiReview.issues}</p>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">⚡</span>
                      <p className="text-xs font-bold text-green-400 uppercase tracking-wide">Optimized Approach</p>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">{aiReview.optimized}</p>
                  </div>
                  <p className="text-xs text-gray-600 text-right">
                    AI reviewed {timeAgo(aiReview.generatedAt)}
                    {' · '}
                    <button
                      onClick={() => { setAiReview(null); setShowAiReview(false); handleAiReview(); }}
                      className="text-purple-500 hover:text-purple-400"
                    >
                      Regenerate
                    </button>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button onClick={handleLike} className="text-2xl transition hover:scale-110">
              {isLiked
                ? <AiFillHeart className="text-red-500" />
                : <AiOutlineHeart className="text-gray-300 hover:text-white" />
              }
            </button>
            <button
              onClick={toggleComments}
              className={`text-2xl transition hover:scale-110 ${showComments ? 'text-blue-400' : 'text-gray-300 hover:text-white'}`}
            >
              <FaRegComment />
            </button>
            <button className="text-2xl text-gray-300 hover:text-white transition">
              <IoPaperPlaneOutline />
            </button>
          </div>
          {/* Bookmark button — now functional */}
          <button
            onClick={handleSave}
            disabled={savingPost}
            className="text-2xl text-gray-300 hover:text-white transition disabled:opacity-50"
          >
            {saved ? <BsBookmarkFill className="text-white" /> : <BsBookmark />}
          </button>
        </div>

        <p className="text-sm font-semibold text-white mb-1">
          {post.likes?.length || 0} {post.likes?.length === 1 ? 'like' : 'likes'}
        </p>

        {post.caption && (
          <p className="text-sm text-gray-200 mb-1">
            <span
              className="font-semibold mr-1 cursor-pointer hover:underline"
              onClick={() => navigate(`/profile/${post.userId?._id}`)}
            >
              {post.userId?.username}
            </span>
            {post.caption}
          </p>
        )}

        {(post.githubLink || post.liveLink) && (
          <div className="flex gap-3 mt-2 mb-2">
            {post.githubLink && (
              <a href={post.githubLink} target="_blank" rel="noreferrer"
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition">
                <FiGithub /> GitHub
              </a>
            )}
            {post.liveLink && (
              <a href={post.liveLink} target="_blank" rel="noreferrer"
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-green-400 transition">
                <FiExternalLink /> Live Demo
              </a>
            )}
          </div>
        )}

        {post.comments?.length > 0 && !showComments && (
          <button onClick={toggleComments} className="text-sm text-gray-400 hover:text-gray-300 mb-1">
            View all {post.comments.length} comment{post.comments.length !== 1 ? 's' : ''}
          </button>
        )}

        {showComments && (
          <div className="mt-2 mb-2">
            {loadingComments ? (
              <div className="flex justify-center py-3">
                <div className="w-5 h-5 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-xs text-gray-500">No comments yet. Be the first!</p>
            ) : (
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {comments.map((c) => (
                  <div key={c._id} className="flex items-start gap-2">
                    <Avatar
                      src={c.userId?.profilePic}
                      username={c.userId?.username}
                      size="xs"
                      onClick={() => navigate(`/profile/${c.userId?._id}`)}
                    />
                    <div className="bg-gray-800 rounded-xl px-3 py-2 flex-1">
                      <span
                        className="text-xs font-semibold text-white mr-2 cursor-pointer hover:underline"
                        onClick={() => navigate(`/profile/${c.userId?._id}`)}
                      >
                        {c.userId?.username}
                      </span>
                      <span className="text-xs text-gray-300">{c.text}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{timeAgo(c.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setShowComments(false)} className="text-xs text-gray-500 hover:text-gray-400 mt-2">
              Hide comments
            </button>
          </div>
        )}

        <form
          onSubmit={handleComment}
          className="flex items-center gap-2 border-t border-gray-800 pt-3 mt-2"
        >
          <Avatar src={user?.profilePic} username={user?.username} size="sm" />
          <input
            type="text"
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none text-gray-300 placeholder-gray-600"
          />
          {comment.trim() && (
            <button type="submit" className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition">
              Post
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default PostCard;