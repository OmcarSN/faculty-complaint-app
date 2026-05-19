import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ChevronRight } from 'lucide-react';
import Navbar from '../../components/Navbar';
import api from '../../utils/api';

const STATUS_STYLES = {
  pending: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
    label: 'Pending',
  },
  reviewed: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    label: 'Reviewed',
  },
  resolved: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    label: 'Resolved',
  },
};

function formatDate(timestamp) {
  if (!timestamp) return '—';
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
      {style.label}
    </span>
  );
}

export default function StudentDashboard() {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [complaints, setComplaints] = useState([]);
  const [complaintsLoading, setComplaintsLoading] = useState(true);
  const [complaintsError, setComplaintsError] = useState(false);

  const navigate = useNavigate();

  const fetchFaculties = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await api.get('/faculties');
      setFaculties(response.data);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaints = async () => {
    setComplaintsLoading(true);
    setComplaintsError(false);
    try {
      const response = await api.get('/complaints/my');
      setComplaints(response.data);
    } catch (err) {
      console.error(err);
      setComplaintsError(true);
    } finally {
      setComplaintsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculties();
    fetchComplaints();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A2744] mb-1 tracking-tight">Faculty Members</h1>
          <p className="text-gray-400 text-sm">Select a faculty member to file a complaint</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white border border-gray-100 rounded-xl p-6 animate-pulse">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-10 bg-gray-100 rounded-lg w-full"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white border border-gray-100 rounded-xl">
            <p className="text-red-500 mb-4 font-medium">Failed to load faculty list</p>
            <button
              onClick={fetchFaculties}
              className="px-6 py-2.5 bg-[#1A2744] text-white rounded-lg hover:bg-[#111a2e] transition-colors font-medium text-sm"
            >
              Retry
            </button>
          </div>
        ) : faculties.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-xl">
            <p className="text-gray-400 font-medium">No faculty members available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {faculties.map((faculty) => {
              const fid = faculty._id || faculty.id;
              const initials = faculty.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'F';
              return (
                <div 
                  key={fid} 
                  className="bg-white border border-gray-100 rounded-xl p-6 flex flex-col justify-between hover:shadow-md hover:border-gray-200 transition-all duration-200 group"
                >
                  <div className="mb-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-[#1A2744]/[0.06] flex items-center justify-center text-[#1A2744] text-sm font-bold shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-gray-900 truncate">{faculty.name}</h3>
                        <p className="text-xs text-gray-400 font-medium">{faculty.department}</p>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => navigate(`/student/complaint/${fid}`)}
                    className="w-full bg-[#1A2744] text-white py-2.5 rounded-lg font-semibold text-[13px] hover:bg-[#111a2e] transition-all flex items-center justify-center gap-1.5 group-hover:shadow-sm"
                  >
                    File Complaint
                    <ChevronRight size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* My Complaints */}
        <div className="mt-16 mb-8">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-[#1A2744] tracking-tight">My Complaints</h2>
            {!complaintsLoading && complaints.length > 0 && (
              <span className="bg-[#1A2744]/[0.08] text-[#1A2744] text-xs font-bold px-2 py-0.5 rounded-full">{complaints.length}</span>
            )}
          </div>
          <p className="text-gray-400 text-sm">Track the status of complaints you've submitted</p>
        </div>

        {complaintsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white border border-gray-100 rounded-xl p-5 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-1/3 mb-5"></div>
                <div className="flex justify-between pt-3 border-t border-gray-50">
                  <div className="h-5 bg-gray-100 rounded-full w-20"></div>
                  <div className="h-3 bg-gray-100 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : complaintsError ? (
          <div className="text-center py-12 bg-white border border-gray-100 rounded-xl">
            <p className="text-red-500 mb-4 font-medium">Failed to load your complaints</p>
            <button
              onClick={fetchComplaints}
              className="px-6 py-2.5 bg-[#1A2744] text-white rounded-lg hover:bg-[#111a2e] transition-colors font-medium text-sm"
            >
              Retry
            </button>
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-100 rounded-xl">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FileText size={22} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No complaints filed yet</p>
            <p className="text-gray-300 text-sm mt-1">Select a faculty member above to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complaints.map((complaint) => (
              <div
                key={complaint.id}
                className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-sm hover:border-gray-200 transition-all duration-200"
              >
                <h4 className="text-[15px] font-bold text-gray-900 mb-2 truncate">
                  {complaint.faculty_name}
                </h4>

                <p className="text-sm text-gray-500 mb-1 truncate">
                  <span className="font-semibold text-gray-600">{complaint.category}</span>
                  {complaint.subject && (
                    <span className="text-gray-300"> · </span>
                  )}
                  {complaint.subject && (
                    <span>{complaint.subject}</span>
                  )}
                </p>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                  <StatusBadge status={complaint.status} />
                  <span className="text-xs text-gray-300 font-medium">
                    {formatDate(complaint.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
