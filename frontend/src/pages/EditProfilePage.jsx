import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import useAuthStore from '../store/useAuthStore';
import Navbar from '../components/Navbar';
import Avatar from '../components/Avatar';
import { INPUT_CLASS, BTN_PRIMARY } from '../utils/helpers';
import toast, { Toaster } from 'react-hot-toast';
import { FiGithub, FiLinkedin, FiGlobe } from 'react-icons/fi';

const TECH_OPTIONS = [
  'React', 'Next.js', 'Vue', 'Angular', 'Svelte',
  'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Tailwind', 'Redux',
  'Node.js', 'Express', 'Python', 'Django', 'Flask',
  'FastAPI', 'Java', 'Spring Boot', 'PHP', 'Laravel',
  'Go', 'Rust', 'C++', '.NET',
  'Flutter', 'React Native', 'Android', 'iOS', 'Swift', 'Kotlin',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase', 'Supabase', 'SQLite',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Linux', 'CI/CD', 'Git', 'Terraform',
  'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'NLP',
  'Computer Vision', 'Data Science', 'Pandas', 'NumPy', 'LangChain',
  'LLM', 'Generative AI', 'OpenAI',
  'Blockchain', 'Solidity', 'Web3',
  'GraphQL', 'REST API', 'WebSockets', 'Cybersecurity',
  'DSA', 'System Design', 'Microservices', 'Figma'
];

const EditProfilePage = () => {
  const { user, login, token } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
    techStack: [],
    openToWork: false,
    profilePic: null
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        bio: user.bio || '',
        githubUrl: user.githubUrl || '',
        linkedinUrl: user.linkedinUrl || '',
        portfolioUrl: user.portfolioUrl || '',
        techStack: user.techStack || [],
        openToWork: user.openToWork || false,
        profilePic: null
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, profilePic: file });
    setPreview(URL.createObjectURL(file));
  };

  const toggleTech = (tech) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter(t => t !== tech)
        : [...prev.techStack, tech]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append('username', formData.username);
      data.append('bio', formData.bio);
      data.append('githubUrl', formData.githubUrl);
      data.append('linkedinUrl', formData.linkedinUrl);
      data.append('portfolioUrl', formData.portfolioUrl);
      data.append('techStack', formData.techStack.join(','));
      data.append('openToWork', formData.openToWork);
      if (formData.profilePic) {
        data.append('profilePic', formData.profilePic);
      }

      const res = await axiosInstance.put('/profile/update', data);
      login(res.data.user, token);
      toast.success('Profile updated!');
      navigate(`/profile/${user._id}`);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Toaster />
      <Navbar />
      <div className="max-w-2xl mx-auto pt-20 px-4 pb-10">
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">

          <h1 className="text-xl font-bold mb-6">Edit Profile</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Profile Picture */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Avatar
                src={preview || user?.profilePic}
                username={user?.username}
                size="3xl"
                border
                borderClass="border-4 border-blue-500"
              />
              <div className="text-center sm:text-left">
                <p className="text-sm font-semibold mb-1">{user?.username}</p>
                <label className="text-sm text-blue-400 cursor-pointer hover:text-blue-300 transition">
                  Change profile photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={INPUT_CLASS}
              />
            </div>

            {/* Bio */}
            <div>
              <label className="text-sm text-gray-400 mb-1 flex items-center justify-between">
                <span>Bio</span>
                <span className="text-xs text-gray-600">{formData.bio.length}/150</span>
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                maxLength={150}
                placeholder="Tell developers about yourself..."
                className={`${INPUT_CLASS} resize-none`}
              />
            </div>

            {/* GitHub */}
            <div>
              <label className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                <FiGithub /> GitHub URL
              </label>
              <input
                type="url"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleChange}
                placeholder="https://github.com/username"
                className={INPUT_CLASS}
              />
            </div>

            {/* LinkedIn */}
            <div>
              <label className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                <FiLinkedin /> LinkedIn URL
              </label>
              <input
                type="url"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
                className={INPUT_CLASS}
              />
            </div>

            {/* Portfolio */}
            <div>
              <label className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                <FiGlobe /> Portfolio URL
              </label>
              <input
                type="url"
                name="portfolioUrl"
                value={formData.portfolioUrl}
                onChange={handleChange}
                placeholder="https://yourportfolio.com"
                className={INPUT_CLASS}
              />
            </div>

            {/* Tech Stack */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Tech Stack
                {formData.techStack.length > 0 && (
                  <span className="ml-2 text-blue-400">
                    ({formData.techStack.length} selected)
                  </span>
                )}
              </label>
              <div className="flex flex-wrap gap-2">
                {TECH_OPTIONS.map((tech) => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => toggleTech(tech)}
                    className={`text-xs px-3 py-1 rounded-full border transition
                      ${formData.techStack.includes(tech)
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                        : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500'
                      }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>

            {/* Open to Work */}
            <div className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3 border border-gray-700">
              <div>
                <p className="text-sm font-semibold">Open to Work</p>
                <p className="text-xs text-gray-400">
                  Let recruiters know you're available
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  openToWork: !prev.openToWork
                }))}
                className={`w-12 h-6 rounded-full transition-colors relative
                  ${formData.openToWork ? 'bg-green-500' : 'bg-gray-600'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform
                  ${formData.openToWork ? 'translate-x-6' : 'translate-x-0.5'}`}
                />
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 ${BTN_PRIMARY}`}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;