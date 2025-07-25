import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { generateCredentials } from '../../data/mockData';
import { UserPlus, Mail, Lock, Phone, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

const AddHRForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    salary: '',
    profilePicture: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150'
  });
  const [credentials, setCredentials] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { addUser, currentUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.name.trim()) {
        throw new Error('Name is required');
      }
      if (!formData.phone.trim()) {
        throw new Error('Phone number is required');
      }
      if (!formData.salary || formData.salary <= 0) {
        throw new Error('Valid salary is required');
      }

      const { email, password } = generateCredentials(formData.name, 'hr');
      
      const hrData = {
        ...formData,
        email,
        password,
        role: 'hr',
        createdBy: currentUser.id,
        salary: parseFloat(formData.salary)
      };

      const newHR = addUser(hrData);
      setCredentials({ email, password });
      
      // Reset form
      setFormData({
        name: '',
        phone: '',
        salary: '',
        profilePicture: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150'
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
  <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl border border-white/50 overflow-hidden">
    {/* Header */}
    <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-3 sm:p-6 lg:p-8 border-b border-gray-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
        <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl sm:rounded-2xl shadow-lg">
          <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
            Add New HR
          </h2>
          <p className="text-gray-600 font-medium text-sm sm:text-base mt-1">Create a new HR account with auto-generated credentials</p>
        </div>
      </div>
    </div>

    <div className="p-3 sm:p-6 lg:p-8">
      {/* Error Message */}
      {error && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg sm:rounded-2xl shadow-sm">
          <div className="flex items-start space-x-3 text-red-700">
            <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg flex-shrink-0">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-sm sm:text-base">Error Occurred</div>
              <div className="text-xs sm:text-sm break-words">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {credentials && (
        <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border border-green-200 rounded-lg sm:rounded-2xl shadow-lg">
          <div className="flex items-start space-x-3 text-green-700 mb-4">
            <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg flex-shrink-0">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-base sm:text-lg font-bold">HR Added Successfully!</span>
              <p className="text-xs sm:text-sm text-green-600">Here are the auto-generated credentials</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white/70 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-green-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-xs sm:text-sm font-semibold text-green-700 block">Email Address</span>
                  <div className="bg-green-100 text-green-800 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-mono text-xs sm:text-sm mt-1 break-all">
                    {credentials.email}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-green-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-xs sm:text-sm font-semibold text-green-700 block">Password</span>
                  <div className="bg-green-100 text-green-800 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-mono text-xs sm:text-sm mt-1 break-all">
                    {credentials.password}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Full Name */}
          <div className="group sm:col-span-2 lg:col-span-1">
            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 sm:focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300"
              placeholder="Enter HR's full name"
              required
            />
          </div>

          {/* Phone Number */}
          <div className="group sm:col-span-2 lg:col-span-1">
            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 sm:focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                placeholder="+91-9876543210"
                required
              />
            </div>
          </div>

          {/* Salary */}
          <div className="group sm:col-span-2 lg:col-span-1">
            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3">
              Monthly Salary (₹) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 sm:focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                placeholder="50000"
                min="0"
                step="1000"
                required
              />
            </div>
          </div>

          {/* Profile Picture */}
          <div className="group sm:col-span-2 lg:col-span-1">
            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3">
              Profile Picture URL
            </label>
            <input
              type="url"
              name="profilePicture"
              value={formData.profilePicture}
              onChange={handleInputChange}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 sm:focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300"
              placeholder="https://example.com/photo.jpg"
            />
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 rounded-lg sm:rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-blue-900 mb-2 text-base sm:text-lg">Auto-Generated Credentials</h3>
              <p className="text-blue-700 leading-relaxed text-sm sm:text-base">
                Email and password will be automatically generated based on the HR's name.
                The credentials will be displayed after successful creation for easy sharing.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row justify-end pt-4 sm:pt-6 space-y-3 sm:space-y-0">
          <button
            type="submit"
            disabled={loading}
            className="group w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg sm:rounded-xl hover:from-blue-600 hover:to-indigo-600 focus:ring-2 sm:focus:ring-4 focus:ring-blue-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100 font-semibold text-sm sm:text-base"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Adding HR...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                <span>Add HR</span>
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
);
};

export default AddHRForm;