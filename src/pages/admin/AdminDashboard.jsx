import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import Navbar from '../../components/Navbar';
import AlertPopup from '../../components/AlertPopup';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({ totalComplaints: 0, totalFaculty: 0, totalStudents: 0 });
  const [complaints, setComplaints] = useState([]);
  
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, complaintsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/complaints')
        ]);
        setStats(statsRes.data);
        setComplaints(complaintsRes.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoadingStats(false);
        setLoadingComplaints(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const filteredComplaints = complaints.filter(c => 
    (c.faculty_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <AlertPopup />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-[#1A2744] tracking-tight">Admin Dashboard</h1>
          <button
            onClick={() => navigate('/admin/manage')}
            className="bg-[#1A2744] text-white px-5 py-2.5 rounded-md font-medium hover:bg-[#111a2e] transition-colors"
          >
            Manage Faculty
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Total Complaints', value: stats.total_complaints, loading: loadingStats },
            { label: 'Total Faculty', value: stats.total_faculty, loading: loadingStats },
            { label: 'Total Students', value: stats.total_students, loading: loadingStats },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center">
              {stat.loading ? (
                <div className="h-10 bg-gray-200 animate-pulse rounded w-16 mb-2"></div>
              ) : (
                <div className="text-4xl font-bold text-[#1A2744] mb-1">{stat.value}</div>
              )}
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Complaints Section */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900">All Complaints</h2>
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search by faculty name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:border-[#1A2744] focus:ring-1 focus:ring-[#1A2744] text-sm"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1A2744] text-white">
                  <th className="py-3 px-6 font-medium text-sm w-[20%]">Student Name</th>
                  <th className="py-3 px-6 font-medium text-sm w-[20%]">Faculty Name</th>
                  <th className="py-3 px-6 font-medium text-sm w-[20%]">Category</th>
                  <th className="py-3 px-6 font-medium text-sm w-[25%]">Subject</th>
                  <th className="py-3 px-6 font-medium text-sm w-[15%]">Date</th>
                </tr>
              </thead>
              <tbody>
                {loadingComplaints ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 animate-pulse rounded w-full"></div></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div></td>
                    </tr>
                  ))
                ) : filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-gray-500">
                      No complaints found
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map((complaint, index) => {
                    const cid = complaint._id || index;
                    return (
                      <React.Fragment key={cid}>
                        <tr 
                          onClick={() => toggleRow(cid)}
                          className={`cursor-pointer border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                        >
                          <td className="py-3 px-6 text-sm text-gray-900 font-medium">
                            {complaint.student_name || 'Anonymous'}
                          </td>
                          <td className="py-3 px-6 text-sm text-gray-800">
                            {complaint.faculty_name}
                          </td>
                          <td className="py-3 px-6 text-sm text-gray-600">
                            <span className="bg-gray-200 px-2 py-1 rounded text-xs text-gray-800 font-medium">
                              {complaint.category}
                            </span>
                          </td>
                          <td className="py-3 px-6 text-sm text-gray-800 truncate max-w-xs">
                            {complaint.subject}
                          </td>
                          <td className="py-3 px-6 text-sm text-gray-500 flex items-center justify-between">
                            {new Date(complaint.createdAt || complaint.date).toLocaleDateString()}
                            {expandedRow === cid ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </td>
                        </tr>
                        {expandedRow === cid && (
                          <tr className="bg-[#f8fafc] border-b border-gray-200">
                            <td colSpan="5" className="py-4 px-6">
                              <div className="pl-4 border-l-2 border-[#1A2744]">
                                <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Description</p>
                                <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
                                  {complaint.description}
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
