import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full Name is required";
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone Number is required";
    } else if (formData.phone.length !== 10 || !/^\d+$/.test(formData.phone)) {
      newErrors.phone = "Enter valid 10 digit phone number";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm Password is required";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: "student"
      });
      
      toast.success("Account created successfully! Please login.");
      navigate('/');
    } catch (error) {
      if (error.response?.data?.detail === "Email already registered") {
        toast.error("This email is already registered.");
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-[420px]">
        <div className="bg-white py-8 px-6 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#1A2744] tracking-tight">Faculty Complaint Portal</h2>
            <p className="mt-2 text-sm text-gray-500">Student Registration</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md py-2.5 px-3 focus:outline-none focus:border-[#1A2744] focus:ring-1 focus:ring-[#1A2744] text-sm`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md py-2.5 px-3 focus:outline-none focus:border-[#1A2744] focus:ring-1 focus:ring-[#1A2744] text-sm`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div>
              <input
                type="text"
                name="phone"
                placeholder="Phone Number (10 digits)"
                value={formData.phone}
                onChange={handleInputChange}
                maxLength={10}
                className={`w-full border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md py-2.5 px-3 focus:outline-none focus:border-[#1A2744] focus:ring-1 focus:ring-[#1A2744] text-sm`}
              />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password (min 6 characters)"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md py-2.5 px-3 pr-10 focus:outline-none focus:border-[#1A2744] focus:ring-1 focus:ring-[#1A2744] text-sm`}
              />
              <button
                type="button"
                className="absolute right-0 top-0 h-10 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>
            
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md py-2.5 px-3 pr-10 focus:outline-none focus:border-[#1A2744] focus:ring-1 focus:ring-[#1A2744] text-sm`}
              />
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-[#1A2744] hover:bg-[#111a2e] focus:outline-none disabled:opacity-70 transition-colors"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm font-medium text-[#1A2744] hover:underline">
              Already have an account? Login
            </Link>
          </div>

          <div className="mt-8 bg-gray-50 rounded p-3 flex items-start gap-2 border border-gray-100">
            <Lock className="text-gray-400 shrink-0 mt-0.5" size={14} />
            <p className="text-xs text-gray-500 leading-relaxed">
              Your phone number is collected for identity verification purposes only and will never be shared publicly.
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
