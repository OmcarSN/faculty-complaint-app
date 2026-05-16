import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { containsBadWords } from '../../utils/badwords';
import Navbar from '../../components/Navbar';

export default function ComplaintForm() {
  const { facultyId } = useParams();
  const navigate = useNavigate();

  const [faculty, setFaculty] = useState(null);
  const [loadingFaculty, setLoadingFaculty] = useState(true);
  const [errorFaculty, setErrorFaculty] = useState(false);

  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const response = await api.get(`/faculties/${facultyId}`);
        setFaculty(response.data);
      } catch (err) {
        console.error(err);
        setErrorFaculty(true);
        toast.error('Failed to load faculty details');
      } finally {
        setLoadingFaculty(false);
      }
    };
    if (facultyId) fetchFaculty();
  }, [facultyId]);

  const subjectHasBadWords = containsBadWords(subject);
  const descriptionHasBadWords = containsBadWords(description);
  const isFormValid = 
    category && 
    subject.trim().length > 0 && 
    description.trim().length >= 20 &&
    !subjectHasBadWords &&
    !descriptionHasBadWords;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setSubmitting(true);
    try {
      await api.post('/complaints', {
        faculty_id: facultyId,
        category,
        subject,
        description
      });
      toast.success('Complaint submitted successfully.');
      navigate('/student');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderContent = () => {
    if (loadingFaculty) {
      return (
        <div className="animate-pulse w-full max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg p-8 mt-8">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded w-full"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
            <div className="h-32 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      );
    }

    if (errorFaculty || !faculty) {
      return (
        <div className="text-center mt-16">
          <p className="text-red-500 mb-4 font-medium">Failed to load faculty information.</p>
          <button
            onClick={() => navigate('/student')}
            className="px-6 py-2 bg-[#1A2744] text-white rounded-md hover:bg-[#111a2e] transition-colors font-medium text-sm"
          >
            Go Back
          </button>
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/student')}
          className="flex items-center text-gray-600 hover:text-[#1A2744] mb-6 font-medium transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </button>

        <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1A2744] mb-2 tracking-tight">File a Complaint</h1>
            <p className="text-gray-500 font-medium text-sm sm:text-base">
              Against: <span className="text-gray-900 font-semibold">{faculty.name}</span> — {faculty.department}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-start gap-3 mb-8">
            <Shield className="text-[#1A2744] shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-gray-700 leading-relaxed font-medium">
              Your identity is strictly confidential. Your name will never be shared with the faculty member or anyone else.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-md py-3 px-4 focus:outline-none focus:border-[#1A2744] focus:ring-1 focus:ring-[#1A2744] bg-white text-gray-800"
              >
                <option value="" disabled>Select a category</option>
                <option value="Teaching Quality">Teaching Quality</option>
                <option value="Behaviour">Behaviour</option>
                <option value="Punctuality">Punctuality</option>
                <option value="Favouritism">Favouritism</option>
                <option value="Harassment">Harassment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                required
                maxLength={100}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief subject of your complaint"
                className={`w-full border rounded-md py-3 px-4 focus:outline-none focus:ring-1 transition-colors ${
                  subjectHasBadWords 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-[#1A2744] focus:ring-[#1A2744]'
                }`}
              />
              {subjectHasBadWords && (
                <p className="text-red-500 text-xs mt-2 font-medium">
                  Please use respectful and professional language.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Complaint Description</label>
              <textarea
                required
                minLength={20}
                maxLength={500}
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your complaint clearly and honestly..."
                className={`w-full border rounded-md py-3 px-4 focus:outline-none focus:ring-1 transition-colors resize-y ${
                  descriptionHasBadWords 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-[#1A2744] focus:ring-[#1A2744]'
                }`}
              ></textarea>
              <div className="flex justify-between items-start mt-2">
                <div>
                  {descriptionHasBadWords && (
                    <p className="text-red-500 text-xs font-medium">
                      Please use respectful and professional language.
                    </p>
                  )}
                  {!descriptionHasBadWords && description.length > 0 && description.length < 20 && (
                    <p className="text-gray-500 text-xs font-medium">
                      Minimum 20 characters required.
                    </p>
                  )}
                </div>
                <p className={`text-xs font-medium shrink-0 ml-4 ${
                  description.length >= 500 ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {description.length} / 500
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !isFormValid}
              className="w-full bg-[#1A2744] text-white rounded-md py-3 font-bold hover:bg-[#111a2e] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center h-[50px] mt-4"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Submit Complaint"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      {renderContent()}
    </div>
  );
}
