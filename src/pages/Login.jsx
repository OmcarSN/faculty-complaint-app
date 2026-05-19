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
    <div style={{ display: 'flex', height: '100vh', width: '100%', backgroundColor: '#ffffff' }}>
      
      {/* LEFT PANEL */}
      <div style={{
        width: '50%',
        backgroundColor: '#1A2744',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '60px 50px',
        color: '#ffffff'
      }}>
        <div style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>Savitribai Phule Pune University</div>
        <div style={{ fontSize: '32px', fontWeight: '700', color: '#ffffff', marginBottom: '8px', lineHeight: '1.2' }}>Faculty Complaint Portal</div>
        <div style={{ fontSize: '15px', color: '#94A3B8', marginBottom: '48px' }}>A secure platform for student grievances</div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {['Secure & Anonymous Complaints', 'Real-time Admin Monitoring', 'Professional & Confidential'].map((item) => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#4ADE80', fontSize: '14px' }}>✓</span>
              </div>
              <span style={{ fontSize: '15px', color: '#CBD5E1' }}>{item}</span>
            </div>
          ))}
        </div>
        
        <div style={{ marginTop: 'auto', paddingTop: '60px', fontSize: '12px', color: '#475569' }}>Powered by SPPU © 2024</div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{
        width: '50%',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px 50px',
        paddingTop: '60px'
      }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          
          <div style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '6px' }}>Welcome back</div>
          <div style={{ fontSize: '26px', fontWeight: '600', color: '#1A2744', marginBottom: '32px' }}>Sign in to your account</div>

          {/* Role Selector */}
          <div style={{ display: 'flex', gap: '0', marginBottom: '24px', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
            <button onClick={() => setRole('student')} style={{
              flex: 1,
              padding: '10px',
              backgroundColor: role === 'student' ? '#1A2744' : '#ffffff',
              color: role === 'student' ? '#ffffff' : '#1A2744',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}>Student</button>
            <div style={{ width: '1px', backgroundColor: '#E2E8F0' }}></div>
            <button onClick={() => setRole('admin')} style={{
              flex: 1,
              padding: '10px',
              backgroundColor: role === 'admin' ? '#1A2744' : '#ffffff',
              color: role === 'admin' ? '#ffffff' : '#1A2744',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}>Admin</button>
          </div>

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Email address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={{ width: '100%', height: '44px', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 12px', fontSize: '14px', outline: 'none', color: '#1A2744', backgroundColor: '#ffffff', boxSizing: 'border-box' }} />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '24px', position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Password</label>
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{ width: '100%', height: '44px', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 40px 0 12px', fontSize: '14px', outline: 'none', color: '#1A2744', backgroundColor: '#ffffff', boxSizing: 'border-box' }} />
            <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '34px', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: '18px' }}>
              {showPassword ? '🙈' : '👁'}
            </button>
          </div>

          {/* Login Button */}
          <button onClick={handleLogin} disabled={loading}
            style={{ width: '100%', height: '44px', backgroundColor: loading ? '#94A3B8' : '#1A2744', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Register Link - student only */}
          {role === 'student' && (
            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6B7280' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#1A2744', fontWeight: '600', textDecoration: 'none' }}>Register here</Link>
            </div>
          )}

          {/* Confidentiality Notice - student only */}
          {role === 'student' && (
            <div style={{ marginTop: '20px', backgroundColor: '#F8FAFC', borderLeft: '3px solid #1A2744', borderRadius: '6px', padding: '12px 14px', display: 'flex', gap: '10px', alignItems: 'flex-start', boxSizing: 'border-box' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A2744" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <span style={{ fontSize: '12px', color: '#4A5568', lineHeight: '1.5' }}>
                Your identity is kept strictly confidential. Your name will never be visible to faculty members.
              </span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
