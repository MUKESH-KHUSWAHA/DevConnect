import { useState } from 'react';
import axiosInstance from '../utils/axios';
import toast from 'react-hot-toast';
import { FiGithub, FiExternalLink, FiCode, FiImage, FiX } from 'react-icons/fi';
import { BsCardText } from 'react-icons/bs';
import { INPUT_CLASS, BTN_PRIMARY, AVATAR_GRADIENT } from '../utils/helpers';

const TECH_TAGS = [
  'react', 'nodejs', 'mongodb', 'express', 'python',
  'django', 'javascript', 'typescript', 'java', 'springboot',
  'flutter', 'reactnative', 'nextjs', 'postgresql', 'mysql',
  'docker', 'aws', 'firebase', 'graphql', 'redis'
];

const LANGUAGES = [
  'javascript', 'python', 'java', 'typescript',
  'cpp', 'c', 'go', 'rust', 'php', 'swift'
];

const UploadPost = ({ onPostCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [postType, setPostType] = useState('project');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    caption: '',
    githubLink: '',
    liveLink: '',
    tags: [],
    codeSnippet: '',
    codeLanguage: 'javascript',
    media: null
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, media: file });
    setPreview(URL.createObjectURL(file));
  };

  const toggleTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      caption: '',
      githubLink: '',
      liveLink: '',
      tags: [],
      codeSnippet: '',
      codeLanguage: 'javascript',
      media: null
    });
    setPreview(null);
    setPostType('project');
    setIsOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (postType === 'snippet' && !formData.codeSnippet.trim()) {
      return toast.error('Please add your code snippet');
    }
    if (postType !== 'snippet' && !formData.caption.trim() && !formData.media) {
      return toast.error('Please add a caption or image');
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('caption', formData.caption);
      data.append('githubLink', formData.githubLink);
      data.append('liveLink', formData.liveLink);
      data.append('tags', formData.tags.join(','));
      data.append('postType', postType);
      data.append('codeSnippet', formData.codeSnippet);
      data.append('codeLanguage', formData.codeLanguage);
      if (formData.media) {
        data.append('media', formData.media);
      }

      await axiosInstance.post('/posts', data);
      toast.success('Post shared!');
      resetForm();
      onPostCreated();
    } catch {
      toast.error('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6">

      {/* Create Post Button — collapsed by default */}
      {!isOpen ? (
        <div
          onClick={() => setIsOpen(true)}
          className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:border-gray-600 transition"
        >
          <div className={`w-10 h-10 rounded-full ${AVATAR_GRADIENT} flex items-center justify-center text-white font-bold flex-shrink-0`}>
            +
          </div>
          <p className="text-gray-500 text-sm">
            Share a project, snippet, or update...
          </p>
        </div>
      ) : (

        /* Expanded Form */
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <h2 className="font-semibold text-white">Create Post</h2>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-white transition"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Post Type Selector */}
          <div className="flex gap-2 px-4 pt-4">
            {[
              { type: 'project', icon: <FiImage size={14} />, label: 'Project' },
              { type: 'snippet', icon: <FiCode size={14} />, label: 'Code' },
              { type: 'general', icon: <BsCardText size={14} />, label: 'General' }
            ].map(({ type, icon, label }) => (
              <button
                key={type}
                onClick={() => setPostType(type)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition
                  ${postType === type
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">

            {/* Title — for project posts */}
            {postType !== 'general' && (
              <input
                type="text"
                name="title"
                placeholder={postType === 'project' ? 'Project name...' : 'Snippet title...'}
                value={formData.title}
                onChange={handleChange}
                className={INPUT_CLASS}
              />
            )}

            {/* Caption */}
            <textarea
              name="caption"
              placeholder={
                postType === 'project'
                  ? 'Describe your project...'
                  : postType === 'snippet'
                  ? 'Explain your code...'
                  : "What's on your mind?"
              }
              value={formData.caption}
              onChange={handleChange}
              rows={3}
              className={`${INPUT_CLASS} resize-none`}
            />

            {/* Code Snippet */}
            {postType === 'snippet' && (
              <div className="flex flex-col gap-2">
                {/* Language selector */}
                <select
                  name="codeLanguage"
                  value={formData.codeLanguage}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 transition"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>

                {/* Code editor */}
                <div className="bg-gray-950 border border-gray-700 rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-b border-gray-700">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-xs text-gray-400 ml-2 font-mono">
                      {formData.codeLanguage}
                    </span>
                  </div>
                  <textarea
                    name="codeSnippet"
                    placeholder="// Paste your code here..."
                    value={formData.codeSnippet}
                    onChange={handleChange}
                    rows={8}
                    className="w-full bg-transparent px-4 py-3 text-sm text-green-400 font-mono outline-none resize-none placeholder-gray-600"
                  />
                </div>
              </div>
            )}

            {/* Image/Video Upload — for project and general */}
            {postType !== 'snippet' && (
              <div>
                {preview ? (
                  <div className="relative">
                    <img
                      src={preview}
                      alt="preview"
                      className="w-full max-h-64 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPreview(null);
                        setFormData(prev => ({ ...prev, media: null }));
                      }}
                      className="absolute top-2 right-2 bg-black/50 rounded-full p-1 text-white hover:bg-black/70"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 w-full py-8 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-blue-500 transition text-gray-500 hover:text-blue-400">
                    <FiImage size={20} />
                    <span className="text-sm">Click to upload image or video</span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            )}

            {/* GitHub + Live Link — for project posts */}
            {postType === 'project' && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5">
                  <FiGithub className="text-gray-400 flex-shrink-0" />
                  <input
                    type="url"
                    name="githubLink"
                    placeholder="GitHub repository link"
                    value={formData.githubLink}
                    onChange={handleChange}
                    className="bg-transparent text-sm text-white outline-none flex-1 placeholder-gray-500"
                  />
                </div>
                <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5">
                  <FiExternalLink className="text-gray-400 flex-shrink-0" />
                  <input
                    type="url"
                    name="liveLink"
                    placeholder="Live demo link"
                    value={formData.liveLink}
                    onChange={handleChange}
                    className="bg-transparent text-sm text-white outline-none flex-1 placeholder-gray-500"
                  />
                </div>
              </div>
            )}

            {/* Tech Tags */}
            <div>
              <p className="text-xs text-gray-400 mb-2 font-semibold">
                Add tags
              </p>
              <div className="flex flex-wrap gap-2">
                {TECH_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`text-xs px-3 py-1 rounded-full border transition
                      ${formData.tags.includes(tag)
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                        : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500'
                      }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 ${BTN_PRIMARY}`}
            >
              {loading ? 'Sharing...' : 'Share Post'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default UploadPost;