import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Info } from 'lucide-react';

export default function Login() {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password, role });
      
      const { token, user } = response.data;
      
      login(user, token, role);
      
      toast.success('Login successful');
      if (role === 'student') {
        navigate('/student');
      } else {
        navigate('/admin');
      }
    } catch (error) {
      console.error(error);
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[400px] border border-gray-200 rounded-lg p-8">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1A2744] mb-1">Faculty Complaint Portal</h1>
          <p className="text-sm text-gray-500">Savitribai Phule Pune University</p>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`flex-1 py-2 rounded-md border font-medium text-sm transition-colors ${
              role === 'student'
                ? 'bg-[#1A2744] text-white border-[#1A2744]'
                : 'bg-white text-[#1A2744] border-[#1A2744]'
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`flex-1 py-2 rounded-md border font-medium text-sm transition-colors ${
              role === 'admin'
                ? 'bg-[#1A2744] text-white border-[#1A2744]'
                : 'bg-white text-[#1A2744] border-[#1A2744]'
            }`}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded-md py-3 px-4 focus:outline-none focus:border-[#1A2744] focus:ring-1 focus:ring-[#1A2744]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full border border-gray-300 rounded-md py-3 pl-4 pr-12 focus:outline-none focus:border-[#1A2744] focus:ring-1 focus:ring-[#1A2744]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1A2744] text-white rounded-md py-3 font-bold hover:bg-[#111a2e] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center h-[50px] mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {role === 'student' && (
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">New student? </span>
            <Link to="/register" className="text-[#1A2744] font-medium hover:underline">
              Register here
            </Link>
          </div>
        )}

        {role === 'student' && (
          <div className="mt-6 bg-gray-50 p-4 rounded-md border border-gray-200 flex items-start gap-3">
            <Info className="text-gray-500 shrink-0 mt-0.5" size={18} />
            <p className="text-xs text-gray-600 leading-relaxed">
              Your identity is kept strictly confidential. Your complaint will not reveal your name to any faculty member.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
