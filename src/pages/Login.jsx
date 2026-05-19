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
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden">
      
      {/* Left branding panel */}
      <div className="hidden lg:flex w-[48%] bg-gradient-to-br from-[#1A2744] via-[#1e2f52] to-[#162038] flex-col justify-center items-start px-16 xl:px-20 py-16 relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-white/[0.03] pointer-events-none"></div>
        <div className="absolute right-32 top-16 w-40 h-40 rounded-full bg-white/[0.02] pointer-events-none"></div>
        <div className="absolute -left-12 -bottom-20 w-56 h-56 rounded-full bg-white/[0.025] pointer-events-none"></div>

        {/* University badge */}
        <div className="flex items-center gap-2.5 mb-12">
          <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          </div>
          <span className="text-[11px] text-white/50 tracking-[2px] uppercase font-medium">SPPU</span>
        </div>

        <h1 className="text-[36px] font-extrabold text-white mb-3 leading-[1.15] tracking-tight">
          Faculty Complaint<br />Management System
        </h1>
        <p className="text-[15px] text-white/40 mb-14 max-w-sm leading-relaxed">
          A structured platform for raising and resolving academic grievances.
        </p>
        
        {/* Feature items */}
        <div className="flex flex-col gap-5">
          {[
            { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', title: 'Anonymous Filing', desc: 'Your identity stays hidden from faculty' },
            { icon: 'M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z', title: 'Track Progress', desc: 'Follow complaints from filing to resolution' },
            { icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6m14 0v-10a2 2 0 00-2-2h-2a2 2 0 00-2 2v10m14 0H3', title: 'Admin Dashboard', desc: 'Analytics and oversight for administrators' },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3.5 group">
              <div className="w-9 h-9 rounded-lg bg-white/[0.07] flex items-center justify-center shrink-0 group-hover:bg-white/[0.12] transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon}/></svg>
              </div>
              <div>
                <div className="text-[14px] text-white font-semibold mb-0.5">{item.title}</div>
                <div className="text-[13px] text-white/35 leading-snug">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-2 mt-auto pt-16 text-[11px] text-white/20">
          <span>Savitribai Phule Pune University</span>
          <span>·</span>
          <span>Department of Computer Science</span>
        </div>
      </div>

      {/* Mobile branding bar (shown only on small screens) */}
      <div className="lg:hidden bg-[#1A2744] px-6 py-5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
        </div>
        <div>
          <div className="text-white font-bold text-[15px]">Faculty Complaint Portal</div>
          <div className="text-white/40 text-[11px]">SPPU</div>
        </div>
      </div>

      {/* Right login form panel */}
      <div className="flex-1 bg-white flex flex-col justify-center items-center px-6 sm:px-14 lg:px-16 xl:px-20">
        <div className="w-full max-w-[400px]">
          
          <h2 className="text-[28px] font-bold text-[#1A2744] mb-1.5 tracking-tight">Sign In</h2>
          <p className="text-[14px] text-gray-400 mb-7">Enter your credentials to continue</p>

          {/* Role Toggle */}
          <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
            {['student', 'admin'].map((r) => (
              <button key={r} onClick={() => setRole(r)} className={`flex-1 py-2.5 text-[13px] font-semibold rounded-lg transition-all duration-200 capitalize ${
                role === r 
                  ? 'bg-[#1A2744] text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}>{r}</button>
            ))}
          </div>

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div className="mb-4">
              <label className="block text-[13px] font-semibold text-gray-600 mb-2">Email</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full h-11 border border-gray-400 rounded-xl pl-10 pr-4 text-sm text-gray-800 bg-white outline-none focus:border-[#1A2744] focus:ring-2 focus:ring-[#1A2744]/10 transition-all placeholder:text-gray-400" />
              </div>
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="block text-[13px] font-semibold text-gray-600 mb-2">Password</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                </div>
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-11 border border-gray-400 rounded-xl pl-10 pr-12 text-sm text-gray-800 bg-white outline-none focus:border-[#1A2744] focus:ring-2 focus:ring-[#1A2744]/10 transition-all placeholder:text-gray-400" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-gray-300 hover:text-gray-500 transition-colors"
                  tabIndex={-1}>
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className={`w-full h-11 rounded-xl text-[15px] font-bold text-white border-none transition-all duration-200 ${
                loading 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-[#1A2744] hover:bg-[#0f1b30] active:scale-[0.98] cursor-pointer shadow-sm hover:shadow-md'
              }`}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Bottom area — always takes same space to prevent layout shift */}
          <div className="mt-5 h-[88px]">
            {role === 'student' ? (
              <>
                <div className="text-center text-[13px] text-gray-400 mb-4">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-[#1A2744] font-semibold no-underline hover:underline">Create one</Link>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5 flex gap-2.5 items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  <span className="text-[12px] text-amber-800 leading-relaxed font-medium">
                    Your identity is kept confidential. Faculty cannot see who filed a complaint.
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center text-[13px] text-gray-500 mt-2">
                Admin accounts are managed by the system administrator.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
