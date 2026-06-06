import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import Navbar from '../components/Navbar';
import useAuthStore from '../store/useAuthStore';
import toast, { Toaster } from 'react-hot-toast';
import { FiX, FiPlus, FiExternalLink } from 'react-icons/fi';
import { BsThreeDots } from 'react-icons/bs';
import Avatar from '../components/Avatar';
import Spinner from '../components/Spinner';
import { timeAgo, INPUT_CLASS } from '../utils/helpers';

const JOB_TYPES = [
    { value: 'all', label: 'All', emoji: '🌐' },
    { value: 'internship', label: 'Internship', emoji: '🎓' },
    { value: 'fulltime', label: 'Full Time', emoji: '💼' },
    { value: 'freelance', label: 'Freelance', emoji: '💻' },
    { value: 'hackathon', label: 'Hackathon', emoji: '⚡' },
    { value: 'opensource', label: 'Open Source', emoji: '🔓' },
    { value: 'collab', label: 'Collab', emoji: '🤝' }
];

// All important tech tags organized by category
const TAG_CATEGORIES = [
    {
        label: '🎨 Frontend',
        tags: ['react', 'nextjs', 'vue', 'angular', 'svelte', 'javascript', 'typescript', 'html', 'css', 'tailwind', 'redux', 'vite']
    },
    {
        label: '⚙️ Backend',
        tags: ['nodejs', 'express', 'python', 'django', 'flask', 'fastapi', 'java', 'springboot', 'php', 'laravel', 'go', 'rust', 'cpp', 'dotnet', 'ruby', 'rails']
    },
    {
        label: '📱 Mobile',
        tags: ['flutter', 'reactnative', 'android', 'ios', 'swift', 'kotlin']
    },
    {
        label: '🗄️ Database',
        tags: ['mongodb', 'postgresql', 'mysql', 'redis', 'firebase', 'supabase', 'sqlite', 'dynamodb']
    },
    {
        label: '☁️ DevOps & Cloud',
        tags: ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'linux', 'nginx', 'cicd', 'git', 'terraform']
    },
    {
        label: '🤖 AI & ML',
        tags: ['machinelearning', 'deeplearning', 'tensorflow', 'pytorch', 'nlp', 'computervision', 'datascience', 'pandas', 'numpy', 'opencv', 'langchain', 'llm', 'generativeai', 'openai']
    },
    {
        label: '🔗 Blockchain & Web3',
        tags: ['blockchain', 'solidity', 'web3', 'ethereum', 'smartcontracts']
    },
    {
        label: '🔧 Other',
        tags: ['graphql', 'restapi', 'websockets', 'cybersecurity', 'dsa', 'systemdesign', 'microservices', 'agile', 'figma']
    }
];

const TYPE_COLORS = {
    internship: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    fulltime: 'bg-green-500/20 text-green-400 border-green-500/30',
    freelance: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    hackathon: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    opensource: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    collab: 'bg-pink-500/20 text-pink-400 border-pink-500/30'
};

const HiringBoard = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeType, setActiveType] = useState('all');
    const [showPostForm, setShowPostForm] = useState(false);
    const [showTagCategories, setShowTagCategories] = useState(false);
    const [menuOpen, setMenuOpen] = useState(null);
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'internship',
        tags: [],
        location: 'Remote',
        salary: '',
        applyLink: ''
    });
    const [posting, setPosting] = useState(false);

    const fetchJobs = async (type = 'all') => {
        setLoading(true);
        try {
            const url = type === 'all' ? '/jobs' : `/jobs?type=${type}`;
            const res = await axiosInstance.get(url);
            setJobs(res.data);
        } catch {
            toast.error('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleTypeFilter = (type) => {
        setActiveType(type);
        fetchJobs(type);
    };

    const toggleTag = (tag) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag]
        }));
    };

    const handlePost = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.description.trim()) {
            return toast.error('Title and description are required');
        }
        setPosting(true);
        try {
            await axiosInstance.post('/jobs', {
                ...formData,
                tags: formData.tags.join(',')
            });
            toast.success('Opportunity posted!');
            setShowPostForm(false);
            setFormData({
                title: '', description: '', type: 'internship',
                tags: [], location: 'Remote', salary: '', applyLink: ''
            });
            fetchJobs(activeType);
        } catch {
            toast.error('Failed to post');
        } finally {
            setPosting(false);
        }
    };

    const handleDelete = async (jobId) => {
        try {
            await axiosInstance.delete(`/jobs/${jobId}`);
            toast.success('Deleted');
            setMenuOpen(null);
            fetchJobs(activeType);
        } catch {
            toast.error('Failed to delete');
        }
    };

    const handleToggle = async (jobId) => {
        try {
            await axiosInstance.put(`/jobs/toggle/${jobId}`);
            setMenuOpen(null);
            fetchJobs(activeType);
        } catch {
            toast.error('Failed');
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Toaster />
            <Navbar activePage="hiring" />

            <div className="max-w-4xl mx-auto pt-20 px-4 pb-10">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold">Hiring Board</h1>
                        <p className="text-gray-400 text-sm mt-1">
                            Find opportunities or post one for the community
                        </p>
                    </div>
                    <button
                        onClick={() => setShowPostForm(!showPostForm)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl font-semibold text-sm transition w-full sm:w-auto"
                    >
                        <FiPlus /> Post Opportunity
                    </button>
                </div>

                {/* Post Form */}
                {showPostForm && (
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-lg">Post an Opportunity</h2>
                            <button onClick={() => setShowPostForm(false)} className="text-gray-400 hover:text-white">
                                <FiX size={20} />
                            </button>
                        </div>

                        <form onSubmit={handlePost} className="flex flex-col gap-4">

                            {/* Type selector */}
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Type</label>
                                <div className="flex flex-wrap gap-2">
                                    {JOB_TYPES.filter(t => t.value !== 'all').map(({ value, label, emoji }) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, type: value }))}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border transition
                        ${formData.type === value
                                                    ? 'bg-blue-500 text-white border-blue-500'
                                                    : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500'
                                                }`}
                                        >
                                            {emoji} {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Title */}
                            <input
                                type="text"
                                placeholder="e.g. React Developer Intern needed"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                className={INPUT_CLASS}
                                required
                            />

                            {/* Description */}
                            <textarea
                                placeholder="Describe the opportunity, requirements, duration..."
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                rows={4}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition resize-none placeholder-gray-500"
                                required
                            />

                            {/* Location + Salary */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    placeholder="Location (e.g. Remote, Bangalore)"
                                    value={formData.location}
                                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition placeholder-gray-500"
                                />
                                <input
                                    type="text"
                                    placeholder="Salary/Stipend (e.g. 15k/month)"
                                    value={formData.salary}
                                    onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition placeholder-gray-500"
                                />
                            </div>

                            {/* Apply Link */}
                            <input
                                type="url"
                                placeholder="Apply link (optional)"
                                value={formData.applyLink}
                                onChange={(e) => setFormData(prev => ({ ...prev, applyLink: e.target.value }))}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition placeholder-gray-500"
                            />

                            {/* Tech Tags — organized by category */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm text-gray-400">
                                        Required Skills
                                        {formData.tags.length > 0 && (
                                            <span className="ml-2 text-blue-400 font-semibold">
                                                ({formData.tags.length} selected)
                                            </span>
                                        )}
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowTagCategories(!showTagCategories)}
                                        className="text-xs text-blue-400 hover:text-blue-300"
                                    >
                                        {showTagCategories ? 'Hide ▲' : 'Browse all ▼'}
                                    </button>
                                </div>

                                {/* Selected tags */}
                                {formData.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {formData.tags.map(tag => (
                                            <span
                                                key={tag}
                                                onClick={() => toggleTag(tag)}
                                                className="flex items-center gap-1 text-xs bg-blue-500/20 text-blue-400 border border-blue-500/50 px-3 py-1 rounded-full cursor-pointer hover:bg-red-500/20 hover:text-red-400 transition"
                                            >
                                                #{tag} <FiX size={10} />
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Tag categories */}
                                {showTagCategories && (
                                    <div className="bg-gray-800 rounded-xl p-4 flex flex-col gap-4 max-h-64 overflow-y-auto">
                                        {TAG_CATEGORIES.map(({ label, tags }) => (
                                            <div key={label}>
                                                <p className="text-xs text-gray-500 font-semibold mb-2">{label}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {tags.map(tag => (
                                                        <button
                                                            key={tag}
                                                            type="button"
                                                            onClick={() => toggleTag(tag)}
                                                            className={`text-xs px-3 py-1 rounded-full border transition
                                ${formData.tags.includes(tag)
                                                                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                                                                    : 'bg-gray-700 text-gray-400 border-gray-600 hover:border-gray-400'
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

                            <button
                                type="submit"
                                disabled={posting}
                                className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 rounded-lg font-semibold transition"
                            >
                                {posting ? 'Posting...' : 'Post Opportunity'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Type Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
                    {JOB_TYPES.map(({ value, label, emoji }) => (
                        <button
                            key={value}
                            onClick={() => handleTypeFilter(value)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold flex-shrink-0 transition
                ${activeType === value
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            {emoji} {label}
                        </button>
                    ))}
                </div>

                {/* Jobs List */}
                {loading ? (
                    <Spinner />
                ) : jobs.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <p className="text-4xl mb-3">💼</p>
                        <p className="font-semibold text-white">No opportunities yet</p>
                        <p className="text-sm mt-1">Be the first to post one!</p>
                        <button
                            onClick={() => setShowPostForm(true)}
                            className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-semibold transition"
                        >
                            Post Opportunity
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {jobs.map((job) => (
                            <div
                                key={job._id}
                                className={`bg-gray-900 border rounded-xl p-4 sm:p-5 transition
                  ${!job.isOpen
                                        ? 'border-gray-800 opacity-60'
                                        : 'border-gray-800 hover:border-gray-600'
                                    }`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0 w-full">

                                        {/* Type + Closed badge */}
                                        <div className="flex items-center gap-2 flex-wrap mb-2">
                                            <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${TYPE_COLORS[job.type]}`}>
                                                {JOB_TYPES.find(t => t.value === job.type)?.emoji}{' '}
                                                {JOB_TYPES.find(t => t.value === job.type)?.label}
                                            </span>
                                            {!job.isOpen && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                                                    Closed
                                                </span>
                                            )}
                                        </div>

                                        {/* Title */}
                                        <h3 className="font-bold text-white text-lg mb-1">{job.title}</h3>

                                        {/* Description */}
                                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{job.description}</p>

                                        {/* Location + Salary + Time */}
                                        <div className="flex flex-wrap gap-4 text-xs text-gray-400 mb-3">
                                            {job.location && <span>📍 {job.location}</span>}
                                            {job.salary && <span>💰 {job.salary}</span>}
                                            <span>🕐 {timeAgo(job.createdAt)}</span>
                                        </div>

                                        {/* Tags */}
                                        {job.tags?.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {job.tags.map(tag => (
                                                    <span
                                                        key={tag}
                                                        className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Posted by */}
                                        <div
                                            className="flex items-center gap-2 cursor-pointer group w-fit"
                                            onClick={() => navigate(`/profile/${job.userId?._id}`)}
                                        >
                                            <Avatar
                                                src={job.userId?.profilePic}
                                                username={job.userId?.username}
                                                size="xs"
                                            />
                                            <span className="text-xs text-gray-400 group-hover:text-white transition">
                                                Posted by {job.userId?.username}
                                            </span>
                                            {job.userId?.openToWork && (
                                                <span className="text-xs text-green-400">• Open to work</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right side */}
                                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 flex-shrink-0 w-full sm:w-auto">

                                        {/* Three dots — owner only */}
                                        {job.userId?._id === user?._id && (
                                            <div className="relative">
                                                <button
                                                    onClick={() => setMenuOpen(menuOpen === job._id ? null : job._id)}
                                                    className="text-gray-400 hover:text-white transition"
                                                >
                                                    <BsThreeDots />
                                                </button>
                                                {menuOpen === job._id && (
                                                    <div className="absolute right-0 top-6 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 min-w-36">
                                                        <button
                                                            onClick={() => handleToggle(job._id)}
                                                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-t-lg"
                                                        >
                                                            {job.isOpen ? 'Mark as Closed' : 'Reopen'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(job._id)}
                                                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-b-lg"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Apply / Message buttons */}
                                        {job.isOpen && (
                                            <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                                                {job.applyLink && (
                                                    <a
                                                        href={job.applyLink}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-semibold transition flex-1 sm:flex-none"
                                                    >
                                                        Apply <FiExternalLink size={14} />
                                                    </a>
                                                )}
                                                {/* Message button — only show if not your own post */}
                                                {job.userId?._id !== user?._id && (
                                                    <button
                                                        onClick={() => navigate(
                                                            `/chat?userId=${job.userId?._id}` +
                                                            `&jobTitle=${encodeURIComponent(job.title)}` +
                                                            `&jobType=${job.type}` +
                                                            `&jobLocation=${encodeURIComponent(job.location || '')}` +
                                                            `&jobSalary=${encodeURIComponent(job.salary || '')}`
                                                        )}
                                                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-semibold transition flex-1 sm:flex-none"
                                                    >
                                                        💬 Message
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HiringBoard;