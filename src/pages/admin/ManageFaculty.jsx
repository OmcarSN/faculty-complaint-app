import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, UserPlus, X, AlertTriangle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function ManageFaculty() {
  const navigate = useNavigate();
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }
  const [deleting, setDeleting] = useState(false);
  
  // Modal Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Computer Science',
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchFaculties = async () => {
    try {
      setLoading(true);
      const res = await api.get('/faculties');
      setFaculties(res.data);
    } catch (err) {
      toast.error('Failed to load faculty list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.department || !formData.password) {
      toast.error('Please fill all fields');
      return;
    }
    if (formData.phone.length !== 10 || !/^\d+$/.test(formData.phone)) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/admin/faculty', formData);
      toast.success('Faculty added successfully');
      setShowModal(false);
      setFormData({
        name: '', email: '', phone: '', department: 'Computer Science', password: ''
      });
      fetchFaculties();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || err.response?.data?.message || 'Failed to add faculty');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/faculty/${deleteTarget.id}`);
      toast.success(`${deleteTarget.name} deleted successfully`);
      setFaculties(prev => prev.filter(f => (f.id || f._id) !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error(err.response?.data?.detail || err.response?.data?.message || 'Failed to delete faculty');
    } finally {
      setDeleting(false);
    }
  };

  const departments = [
    'Computer Science', 'Information Technology', 'Electronics',
    'Mechanical', 'Civil', 'MBA', 'MCA', 'Other'
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button 
          onClick={() => navigate('/admin')}
          className="flex items-center text-[#1A2744] hover:text-blue-800 font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Dashboard
        </button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-[#1A2744] tracking-tight">Manage Faculty</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#1A2744] text-white px-5 py-2.5 rounded-md font-medium hover:bg-[#111a2e] transition-colors flex items-center"
          >
            <UserPlus size={18} className="mr-2" />
            Add Faculty
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#1A2744] text-white">
                  <th className="py-3 px-6 font-medium text-sm w-[20%]">Name</th>
                  <th className="py-3 px-6 font-medium text-sm w-[20%]">Department</th>
                  <th className="py-3 px-6 font-medium text-sm w-[15%]">Phone</th>
                  <th className="py-3 px-6 font-medium text-sm w-[20%]">Email</th>
                  <th className="py-3 px-6 font-medium text-sm w-[15%]">Complaints Count</th>
                  <th className="py-3 px-6 font-medium text-sm w-[10%] text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="py-4 px-6">
                          <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : faculties.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-gray-500">
                      No faculty added yet
                    </td>
                  </tr>
                ) : (
                  faculties.map((faculty, index) => {
                    const count = faculty.complaint_count || 0;
                    const isHigh = count >= 5;
                    const fid = faculty.id || faculty._id;
                    return (
                      <tr key={fid || index} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 !== 0 ? 'bg-gray-50/50' : 'bg-white'}`}>
                        <td className="py-4 px-6 text-sm text-gray-900 font-medium">{faculty.name}</td>
                        <td className="py-4 px-6 text-sm text-gray-600">{faculty.department}</td>
                        <td className="py-4 px-6 text-sm text-gray-600">{faculty.phone}</td>
                        <td className="py-4 px-6 text-sm text-gray-600 truncate max-w-[200px]">{faculty.email}</td>
                        <td className="py-4 px-6 text-sm">
                          <span className={`px-2 py-1 rounded-md inline-block ${isHigh ? 'text-red-600 font-bold bg-red-50 border border-red-100' : 'text-gray-700 bg-gray-100'}`}>
                            {count}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => setDeleteTarget({ id: fid, name: faculty.name })}
                            className="text-xs px-3 py-1.5 border border-red-500 text-red-600 rounded hover:bg-red-50 transition-colors font-medium flex items-center mx-auto"
                          >
                            <Trash2 size={14} className="mr-1" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Add Faculty Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-[480px] flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Add New Faculty Member</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-[#1A2744] focus:ring-1 focus:ring-[#1A2744] text-sm"
                    placeholder="Dr. John Doe"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-[#1A2744] focus:ring-1 focus:ring-[#1A2744] text-sm"
                    placeholder="john.doe@sppu.edu"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      +91
                    </span>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="flex-1 border border-gray-300 rounded-none rounded-r-md py-2 px-3 focus:outline-none focus:border-[#1A2744] focus:ring-1 focus:ring-[#1A2744] text-sm"
                      placeholder="9876543210"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-[#1A2744] focus:ring-1 focus:ring-[#1A2744] text-sm bg-white"
                    required
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-[#1A2744] focus:ring-1 focus:ring-[#1A2744] text-sm"
                    placeholder="Minimum 6 characters"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#1A2744] text-white rounded-md hover:bg-[#111a2e] transition-colors text-sm font-medium disabled:opacity-70 flex items-center justify-center min-w-[120px]"
                >
                  {submitting ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : 'Add Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-[400px]">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={28} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Faculty</h3>
              <p className="text-sm text-gray-600">
                Are you sure you want to delete <strong>{deleteTarget.name}</strong>? 
                This action cannot be undone. Their user account will also be removed.
              </p>
            </div>
            <div className="flex border-t border-gray-100">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors border-r border-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <span className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
