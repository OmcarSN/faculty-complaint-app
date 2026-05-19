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
        <div className="animate-pulse w-full max-w-2xl mx-auto bg-white border border-gray-100 rounded-xl p-8 mt-8">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-100 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-100 rounded-xl w-full"></div>
            <div className="h-12 bg-gray-100 rounded-xl w-full"></div>
            <div className="h-32 bg-gray-100 rounded-xl w-full"></div>
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
            className="px-6 py-2.5 bg-[#1A2744] text-white rounded-lg hover:bg-[#111a2e] transition-colors font-medium text-sm"
          >
            Go Back
          </button>
        </div>
      );
    }

    const initials = faculty.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'F';

    return (
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/student')}
          className="flex items-center text-gray-400 hover:text-[#1A2744] mb-6 font-medium transition-colors text-sm"
        >
          <ArrowLeft size={16} className="mr-1.5" />
          Back to dashboard
        </button>

        <div className="bg-white border border-gray-100 rounded-xl p-6 sm:p-8 shadow-sm">
          {/* Faculty header */}
          <div className="flex items-center gap-3.5 mb-6 pb-6 border-b border-gray-100">
            <div className="w-11 h-11 rounded-lg bg-[#1A2744]/[0.06] flex items-center justify-center text-[#1A2744] text-sm font-bold shrink-0">
              {initials}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">File a Complaint</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Against <span className="text-gray-600 font-medium">{faculty.name}</span> · {faculty.department}
              </p>
            </div>
          </div>

          {/* Confidentiality notice */}
          <div className="bg-[#f8f9fb] border border-gray-100 rounded-xl p-4 flex items-start gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[#1A2744]/[0.06] flex items-center justify-center shrink-0 mt-0.5">
              <Shield className="text-[#1A2744]" size={15} />
            </div>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              Your identity is confidential. Your name will not be shared with the faculty member.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[13px] font-semibold text-gray-600 mb-2">Category</label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-12 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-[#1A2744] focus:ring-2 focus:ring-[#1A2744]/10 bg-white text-sm text-gray-800 transition-all"
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
              <label className="block text-[13px] font-semibold text-gray-600 mb-2">Subject</label>
              <input
                type="text"
                required
                maxLength={100}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief subject of your complaint"
                className={`w-full h-12 border rounded-xl py-3 px-4 outline-none focus:ring-2 transition-all text-sm ${
                  subjectHasBadWords 
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' 
                    : 'border-gray-200 focus:border-[#1A2744] focus:ring-[#1A2744]/10'
                } placeholder:text-gray-300`}
              />
              {subjectHasBadWords && (
                <p className="text-red-500 text-xs mt-2 font-medium">
                  Please use respectful language.
                </p>
              )}
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-600 mb-2">Description</label>
              <textarea
                required
                minLength={20}
                maxLength={500}
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your complaint clearly and honestly..."
                className={`w-full border rounded-xl py-3 px-4 outline-none focus:ring-2 transition-all resize-y text-sm ${
                  descriptionHasBadWords 
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' 
                    : 'border-gray-200 focus:border-[#1A2744] focus:ring-[#1A2744]/10'
                } placeholder:text-gray-300`}
              ></textarea>
              <div className="flex justify-between items-start mt-2">
                <div>
                  {descriptionHasBadWords && (
                    <p className="text-red-500 text-xs font-medium">
                      Please use respectful language.
                    </p>
                  )}
                  {!descriptionHasBadWords && description.length > 0 && description.length < 20 && (
                    <p className="text-gray-400 text-xs font-medium">
                      Minimum 20 characters required.
                    </p>
                  )}
                </div>
                <p className={`text-xs font-medium shrink-0 ml-4 ${
                  description.length >= 500 ? 'text-red-500' : 'text-gray-300'
                }`}>
                  {description.length}/500
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !isFormValid}
              className={`w-full h-12 rounded-xl text-[15px] font-bold text-white border-none transition-all duration-200 mt-2 ${
                submitting || !isFormValid
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-[#1A2744] hover:bg-[#0f1b30] active:scale-[0.98] cursor-pointer shadow-sm'
              }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Submitting...
                </span>
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
    <div className="min-h-screen bg-[#f8f9fb]">
      <Navbar />
      {renderContent()}
    </div>
  );
}
