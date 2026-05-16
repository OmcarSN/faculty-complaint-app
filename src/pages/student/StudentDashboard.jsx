import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../utils/api';

export default function StudentDashboard() {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
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

  useEffect(() => {
    fetchFaculties();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A2744] mb-1 tracking-tight">Faculty Members</h1>
          <p className="text-gray-500 text-sm">Select a faculty member to file a complaint</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                <div className="h-10 bg-gray-200 rounded w-full mt-auto"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4 font-medium">Failed to load faculty. Please try again.</p>
            <button
              onClick={fetchFaculties}
              className="px-6 py-2 bg-[#1A2744] text-white rounded-md hover:bg-[#111a2e] transition-colors font-medium text-sm"
            >
              Retry
            </button>
          </div>
        ) : faculties.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
            <p className="text-gray-500 font-medium">No faculty members available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {faculties.map((faculty) => {
              const fid = faculty._id || faculty.id;
              return (
                <div 
                  key={fid} 
                  className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col justify-between hover:border-[#1A2744] transition-colors duration-200"
                >
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">{faculty.name}</h3>
                    <p className="text-sm text-gray-500 font-medium">{faculty.department}</p>
                  </div>
                  
                  <button
                    onClick={() => navigate(`/student/complaint/${fid}`)}
                    className="w-full bg-[#1A2744] text-white py-2.5 rounded-md font-medium text-sm hover:bg-[#111a2e] transition-colors mt-auto"
                  >
                    File Complaint
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
