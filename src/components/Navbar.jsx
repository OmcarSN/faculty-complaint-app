import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, role, logout } = useAuth();

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#1A2744] rounded-md flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            </div>
            <span className="text-[#1A2744] font-bold text-[15px] tracking-tight">
              Faculty Complaint Portal
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#1A2744]/[0.08] flex items-center justify-center">
                <span className="text-[11px] font-bold text-[#1A2744]">
                  {(role === 'admin' ? 'A' : user?.name?.[0] || 'U').toUpperCase()}
                </span>
              </div>
              <span className="text-[13px] font-medium text-gray-600">
                {role === 'admin' ? 'Admin' : user?.name}
              </span>
            </div>
            <button
              onClick={logout}
              className="text-[13px] px-3.5 py-1.5 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300 transition-all font-medium flex items-center gap-1.5"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
