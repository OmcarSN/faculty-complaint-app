import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

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
      const response = await api.post('/auth/login', { email, password, role }, { timeout: 15000 });
      
      const { token, user } = response.data;
      
      if (!token || !user) {
        toast.error('Unexpected server response. Please try again.');
        return;
      }
      
      login(user, token, role);
      
      toast.success('Login successful');
      if (role === 'student') {
        navigate('/student');
      } else {
        navigate('/admin');
      }
    } catch (error) {
      console.error('Login error:', error);
      const msg = error.response?.data?.detail || 'Login failed. Please check your credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      
      {/* LEFT PANEL — full on desktop, compact banner on mobile */}
      <div className="w-full lg:w-1/2 bg-[#1A2744] flex flex-col justify-center items-start px-6 py-10 sm:px-12 lg:px-[50px] lg:py-[60px]">
        <div className="text-[13px] text-slate-400 mb-2 sm:mb-3 tracking-[2px] uppercase">Savitribai Phule Pune University</div>
        <div className="text-2xl sm:text-[32px] font-bold text-white mb-1 sm:mb-2 leading-tight">Faculty Complaint Portal</div>
        <div className="text-sm sm:text-[15px] text-slate-400 mb-6 lg:mb-12">A secure platform for student grievances</div>
        
        {/* Feature list — hidden on mobile, visible on sm+ */}
        <div className="hidden sm:flex flex-col gap-5">
          {['Secure & Anonymous Complaints', 'Real-time Admin Monitoring', 'Professional & Confidential'].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <span className="text-green-400 text-sm">✓</span>
              </div>
              <span className="text-[15px] text-slate-300">{item}</span>
            </div>
          ))}
        </div>
        
        <div className="hidden lg:block mt-auto pt-[60px] text-xs text-slate-600">Powered by SPPU © 2024</div>
      </div>

      {/* RIGHT PANEL — form */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center items-center px-6 py-10 sm:px-12 lg:px-[50px] lg:pt-[60px]">
        <div className="w-full max-w-[380px]">
          
          <div className="text-[13px] text-slate-400 mb-1.5">Welcome back</div>
          <div className="text-2xl sm:text-[26px] font-semibold text-[#1A2744] mb-8">Sign in to your account</div>

          {/* Role Selector */}
          <div className="flex mb-6 border border-slate-200 rounded-lg overflow-hidden">
            <button onClick={() => setRole('student')} className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              role === 'student' ? 'bg-[#1A2744] text-white' : 'bg-white text-[#1A2744]'
            }`}>Student</button>
            <div className="w-px bg-slate-200"></div>
            <button onClick={() => setRole('admin')} className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              role === 'admin' ? 'bg-[#1A2744] text-white' : 'bg-white text-[#1A2744]'
            }`}>Admin</button>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Email address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full h-11 border border-slate-200 rounded-lg px-3 text-sm text-[#1A2744] bg-white outline-none focus:border-[#1A2744] focus:ring-1 focus:ring-[#1A2744] transition-colors" />
          </div>

          {/* Password */}
          <div className="mb-6 relative">
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Password</label>
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full h-11 border border-slate-200 rounded-lg pl-3 pr-10 text-sm text-[#1A2744] bg-white outline-none focus:border-[#1A2744] focus:ring-1 focus:ring-[#1A2744] transition-colors" />
            <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[34px] bg-transparent border-none cursor-pointer text-slate-400 text-lg">
              {showPassword ? '🙈' : '👁'}
            </button>
          </div>

          {/* Login Button */}
          <button onClick={handleLogin} disabled={loading}
            className={`w-full h-11 rounded-lg text-[15px] font-semibold text-white border-none transition-colors ${
              loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#1A2744] hover:bg-[#111a2e] cursor-pointer'
            }`}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Register Link - student only */}
          {role === 'student' && (
            <div className="text-center mt-5 text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#1A2744] font-semibold no-underline hover:underline">Register here</Link>
            </div>
          )}

          {/* Confidentiality Notice - student only */}
          {role === 'student' && (
            <div className="mt-5 bg-slate-50 border-l-[3px] border-l-[#1A2744] rounded-md px-3.5 py-3 flex gap-2.5 items-start">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A2744" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-px"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <span className="text-xs text-gray-600 leading-relaxed">
                Your identity is kept strictly confidential. Your name will never be visible to faculty members.
              </span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
