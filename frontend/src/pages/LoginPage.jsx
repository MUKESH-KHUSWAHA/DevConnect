import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import useAuthStore from '../store/useAuthStore';
import toast, { Toaster } from 'react-hot-toast';
import { INPUT_CLASS, BTN_PRIMARY } from '../utils/helpers';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
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
      const res = await axiosInstance.post('/auth/login', formData);
      login(res.data.user, res.data.token);
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <Toaster />
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-10 w-full max-w-sm text-center">

        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">DC</span>
          </div>
          <h1 className="text-2xl font-bold text-white">DevConnect</h1>
        </div>

        <p className="text-gray-400 text-sm mb-6">
          The social network for developers
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-800" />
          <span className="text-gray-500 text-sm font-semibold">OR</span>
          <div className="flex-1 h-px bg-gray-800" />
        </div>

        <p className="text-sm text-gray-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-400 font-semibold hover:text-blue-300">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
