import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Settings, User, Phone, Mail, Camera, Save } from 'lucide-react';

const ProfileSettings = () => {
  const { currentUser, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: currentUser.name,
    phone: currentUser.phone,
    profilePicture: currentUser.profilePicture
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      updateUser(currentUser._id, formData);
      // Show success feedback here if needed
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setSaving(false);
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
  <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100/50 backdrop-blur-sm">
    <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-100 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-t-2xl sm:rounded-t-3xl relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute -top-4 -right-4 w-16 h-16 sm:w-24 sm:h-24 bg-white/10 rounded-full blur-xl"></div>
      <div className="absolute -bottom-2 -left-8 w-20 h-20 sm:w-32 sm:h-32 bg-white/5 rounded-full blur-2xl"></div>
      
      <div className="relative flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
        <div className="p-3 sm:p-4 bg-white/20 backdrop-blur-md rounded-xl sm:rounded-2xl ring-2 ring-white/20">
          <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Profile Settings</h2>
          <p className="text-blue-100 mt-1 sm:mt-2 font-medium text-sm sm:text-base">Manage your personal information and preferences</p>
        </div>
      </div>
    </div>

    <div className="p-4 sm:p-6 lg:p-8">
      <div onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center space-y-4 sm:space-y-6 p-4 sm:p-6 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl sm:rounded-2xl border border-blue-100/50">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <img
              src={formData.profilePicture}
              alt="Profile"
              className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-blue-100/50"
            />
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-2 sm:p-3 rounded-full shadow-lg ring-4 ring-white hover:scale-110 transition-transform duration-200 cursor-pointer">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Profile Picture</h3>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base px-2">Update your profile picture by entering a new URL below</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <div className="group">
            <label className="block text-sm font-bold text-gray-800 mb-2 sm:mb-3">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-blue-300 text-sm sm:text-base"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-sm font-bold text-gray-800 mb-2 sm:mb-3">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-blue-300 text-sm sm:text-base"
                placeholder="+91-9876543210"
              />
            </div>
          </div>

          <div className="lg:col-span-2 group">
            <label className="block text-sm font-bold text-gray-800 mb-2 sm:mb-3">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="email"
                value={currentUser.email}
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 text-gray-500 cursor-not-allowed text-sm sm:text-base"
                disabled
                placeholder="Email cannot be changed"
              />
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 flex items-center">
              <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
              Email address cannot be modified for security reasons
            </p>
          </div>

          <div className="lg:col-span-2 group">
            <label className="block text-sm font-bold text-gray-800 mb-2 sm:mb-3">Profile Picture URL</label>
            <div className="relative">
              <Camera className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="url"
                name="profilePicture"
                value={formData.profilePicture}
                onChange={handleInputChange}
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-blue-300 text-sm sm:text-base"
                placeholder="https://example.com/your-photo.jpg"
              />
            </div>
          </div>
        </div>

        {/* Account Information (Read-only) */}
        <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-inner">
          <div className="flex flex-col sm:flex-row items-center mb-3 sm:mb-4">
            <div className="p-2 bg-gradient-to-r from-slate-600 to-gray-600 rounded-lg mr-0 sm:mr-3 mb-2 sm:mb-0">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Account Information</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center p-3 bg-white/60 rounded-lg sm:rounded-xl backdrop-blur-sm text-sm sm:text-base">
              <span className="text-gray-600 font-medium mb-1 sm:mb-0 sm:mr-3">Role:</span>
              <span className="px-2 sm:px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs sm:text-sm font-bold rounded-full capitalize shadow-md w-fit">
                {currentUser.role}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center p-3 bg-white/60 rounded-lg sm:rounded-xl backdrop-blur-sm text-sm sm:text-base">
              <span className="text-gray-600 font-medium mb-1 sm:mb-0 sm:mr-3">Status:</span>
              <span className="px-2 sm:px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs sm:text-sm font-bold rounded-full shadow-md w-fit">
                {currentUser.status}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center p-3 bg-white/60 rounded-lg sm:rounded-xl backdrop-blur-sm text-sm sm:text-base">
              <span className="text-gray-600 font-medium mb-1 sm:mb-0 sm:mr-3">Member Since:</span>
              <span className="font-bold text-gray-900">
                {new Date(currentUser.createdAt).toLocaleDateString()}
              </span>
            </div>
            {currentUser.salary && (
              <div className="flex flex-col sm:flex-row sm:items-center p-3 bg-white/60 rounded-lg sm:rounded-xl backdrop-blur-sm text-sm sm:text-base">
                <span className="text-gray-600 font-medium mb-1 sm:mb-0 sm:mr-3">Salary:</span>
                <span className="font-bold text-gray-900">
                  ₹{currentUser.salary.toLocaleString()}/month
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center sm:justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="group relative flex items-center justify-center space-x-2 sm:space-x-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl sm:rounded-2xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-500/50 transition-all duration-300 disabled:opacity-50 shadow-xl hover:shadow-2xl hover:scale-105 transform text-sm sm:text-base lg:text-lg w-full sm:w-auto"
          >
            <Save className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-bold">{saving ? 'Saving Changes...' : 'Save Changes'}</span>
            {saving && (
              <div className="absolute inset-0 bg-white/20 rounded-xl sm:rounded-2xl animate-pulse"></div>
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
);
};

export default ProfileSettings;