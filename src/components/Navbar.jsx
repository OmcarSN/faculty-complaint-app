import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, role, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <span className="text-[#1A2744] font-bold text-lg tracking-tight">
              Faculty Complaint Portal
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {role === 'admin' ? 'Admin' : user?.name}
            </span>
            <button
              onClick={logout}
              className="text-sm px-4 py-1.5 border border-[#1A2744] text-[#1A2744] rounded hover:bg-gray-50 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
