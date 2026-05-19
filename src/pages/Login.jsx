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
        toast.error('Something went wrong. Please try again.');
        return;
      }
      
      login(user, token, role);
      toast.success('Login successful');
      navigate(role === 'student' ? '/student' : '/admin');
    } catch (error) {
      console.error('Login error:', error);
      const msg = error.response?.data?.detail || 'Invalid credentials. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      
      {/* Branding Panel */}
      <div className="w-full lg:w-1/2 bg-[#1A2744] flex flex-col justify-center items-start px-6 py-10 sm:px-12 lg:px-[50px] lg:py-[60px] relative overflow-hidden">
        {/* Subtle decorative element */}
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/[0.03] pointer-events-none"></div>
        <div className="absolute -left-10 -bottom-16 w-48 h-48 rounded-full bg-white/[0.02] pointer-events-none"></div>

        <div className="text-[11px] text-slate-400 mb-3 tracking-[2.5px] uppercase font-medium">Savitribai Phule Pune University</div>
        <h1 className="text-2xl sm:text-[30px] font-bold text-white mb-2 leading-tight">Faculty Complaint<br className="hidden sm:block" /> Management System</h1>
        <p className="text-sm sm:text-[15px] text-slate-400 mb-8 lg:mb-14 max-w-sm">Empowering students to raise academic concerns in a safe and structured way.</p>
        
        {/* Info points — visible on sm+ */}
        <div className="hidden sm:flex flex-col gap-4">
          {[
            { title: 'Anonymous Filing', desc: 'Your identity stays hidden from faculty at all times' },
            { title: 'Track Progress', desc: 'Follow your complaint from submission to resolution' },
            { title: 'Admin Oversight', desc: 'Dedicated admin panel for review and action' },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <div className="w-5 h-5 mt-0.5 rounded-full border border-emerald-400/60 flex items-center justify-center shrink-0">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div>
                <div className="text-[14px] text-white font-medium">{item.title}</div>
                <div className="text-[13px] text-slate-400 mt-0.5">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="hidden lg:block mt-auto pt-16 text-[11px] text-slate-600">SPPU &middot; Department of Computer Science</div>
      </div>

      {/* Login Form Panel */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center items-center px-6 py-10 sm:px-12 lg:px-[50px] lg:pt-[60px]">
        <div className="w-full max-w-[380px]">
          
          <h2 className="text-2xl sm:text-[26px] font-semibold text-[#1A2744] mb-1">Sign In</h2>
          <p className="text-sm text-gray-400 mb-8">Enter your credentials to continue</p>

          {/* Role Toggle */}
          <div className="flex mb-6 border border-slate-200 rounded-lg overflow-hidden">
            <button onClick={() => setRole('student')} className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              role === 'student' ? 'bg-[#1A2744] text-white' : 'bg-white text-[#1A2744] hover:bg-slate-50'
            }`}>Student</button>
            <div className="w-px bg-slate-200"></div>
            <button onClick={() => setRole('admin')} className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              role === 'admin' ? 'bg-[#1A2744] text-white' : 'bg-white text-[#1A2744] hover:bg-slate-50'
            }`}>Admin</button>
          </div>

          <form onSubmit={handleLogin}>
            {/* Email Field */}
            <div className="mb-4">
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-11 border border-slate-200 rounded-lg px-3 text-sm text-[#1A2744] bg-white outline-none focus:border-[#1A2744] focus:ring-1 focus:ring-[#1A2744] transition-colors" />
            </div>

            {/* Password Field */}
            <div className="mb-6 relative">
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Password</label>
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-11 border border-slate-200 rounded-lg pl-3 pr-10 text-sm text-[#1A2744] bg-white outline-none focus:border-[#1A2744] focus:ring-1 focus:ring-[#1A2744] transition-colors" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-3 top-[34px] bg-transparent border-none cursor-pointer text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}>
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className={`w-full h-11 rounded-lg text-[15px] font-semibold text-white border-none transition-all ${
                loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#1A2744] hover:bg-[#111a2e] cursor-pointer active:scale-[0.98]'
              }`}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Register link */}
          {role === 'student' && (
            <div className="text-center mt-5 text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#1A2744] font-semibold no-underline hover:underline">Register here</Link>
            </div>
          )}

          {/* Privacy notice */}
          {role === 'student' && (
            <div className="mt-5 bg-slate-50 border-l-[3px] border-l-[#1A2744] rounded-md px-3.5 py-3 flex gap-2.5 items-start">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1A2744" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <span className="text-xs text-gray-600 leading-relaxed">
                Your identity is kept confidential. Faculty members cannot see who filed a complaint.
              </span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
