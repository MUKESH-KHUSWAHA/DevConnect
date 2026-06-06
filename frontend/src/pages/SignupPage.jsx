import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import useAuthStore from '../store/useAuthStore';
import toast, { Toaster } from 'react-hot-toast';
import { INPUT_CLASS, BTN_PRIMARY } from '../utils/helpers';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: '', email: '', password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.post('/auth/signup', formData);
      login(res.data.user, res.data.token);
      toast.success('Account created!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <Toaster />
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-10 w-full max-w-sm text-center">

        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">DC</span>
          </div>
          <h1 className="text-2xl font-bold text-white">DevConnect</h1>
        </div>
        <p className="text-gray-400 font-semibold text-sm mb-6">
          Join the developer community
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className={INPUT_CLASS}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className={INPUT_CLASS}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className={INPUT_CLASS}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 ${BTN_PRIMARY}`}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-sm text-gray-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 font-semibold hover:text-blue-300">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
