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
  <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 rounded-3xl shadow-2xl border border-gray-100/50 backdrop-blur-sm">
    <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-t-3xl relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
      <div className="absolute -bottom-2 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
      
      <div className="relative flex items-center space-x-4">
        <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl ring-2 ring-white/20">
          <Settings className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white">Profile Settings</h2>
          <p className="text-blue-100 mt-2 font-medium">Manage your personal information and preferences</p>
        </div>
      </div>
    </div>

    <div className="p-8 sm:p-4">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Picture Section */}
        <div className="flex flex-col sm:flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8 p-6 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-2xl border border-blue-100/50">
          <div className="relative group mb-4 md:mb-0">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <img
              src={formData.profilePicture}
              alt="Profile"
              className="relative w-28 h-28 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-blue-100/50"
            />
            <div className="absolute bottom-0 right-0 bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-3 sm:p-2 rounded-full shadow-lg ring-4 ring-white hover:scale-110 transition-transform duration-200 cursor-pointer">
              <Camera className="w-5 h-5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-xl sm:text-lg font-bold text-gray-900 mb-2">Profile Picture</h3>
            <p className="text-gray-600 leading-relaxed text-base sm:text-sm">Update your profile picture by entering a new URL below</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-4">
          <div className="group">
            <label className="block text-sm font-bold text-gray-800 mb-3">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-4 sm:py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-blue-300 text-base sm:text-sm"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-sm font-bold text-gray-800 mb-3">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-4 sm:py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-blue-300 text-base sm:text-sm"
                placeholder="+91-9876543210"
              />
            </div>
          </div>

          <div className="md:col-span-2 group">
            <label className="block text-sm font-bold text-gray-800 mb-3">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={currentUser.email}
                className="w-full pl-12 pr-4 py-4 sm:py-3 border-2 border-gray-200 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 text-gray-500 cursor-not-allowed text-base sm:text-sm"
                disabled
                placeholder="Email cannot be changed"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2 flex items-center">
              <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
              Email address cannot be modified for security reasons
            </p>
          </div>

          <div className="md:col-span-2 group">
            <label className="block text-sm font-bold text-gray-800 mb-3">Profile Picture URL</label>
            <div className="relative">
              <Camera className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="url"
                name="profilePicture"
                value={formData.profilePicture}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-4 sm:py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-blue-300 text-base sm:text-sm"
                placeholder="https://example.com/your-photo.jpg"
              />
            </div>
          </div>
        </div>

        {/* Account Information (Read-only) */}
        <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50/30 rounded-2xl p-6 sm:p-4 border border-gray-100 shadow-inner">
          <div className="flex flex-col sm:flex-row items-center mb-4">
            <div className="p-2 bg-gradient-to-r from-slate-600 to-gray-600 rounded-lg mr-3 mb-2 sm:mb-0">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <h3 className="text-lg sm:text-base font-bold text-gray-900">Account Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-3">
            <div className="flex items-center p-3 bg-white/60 rounded-xl backdrop-blur-sm text-base sm:text-sm">
              <span className="text-gray-600 font-medium mr-3">Role:</span>
              <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-bold rounded-full capitalize shadow-md">
                {currentUser.role}
              </span>
            </div>
            <div className="flex items-center p-3 bg-white/60 rounded-xl backdrop-blur-sm text-base sm:text-sm">
              <span className="text-gray-600 font-medium mr-3">Status:</span>
              <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold rounded-full shadow-md">
                {currentUser.status}
              </span>
            </div>
            <div className="flex items-center p-3 bg-white/60 rounded-xl backdrop-blur-sm text-base sm:text-sm">
              <span className="text-gray-600 font-medium mr-3">Member Since:</span>
              <span className="font-bold text-gray-900">
                {new Date(currentUser.createdAt).toLocaleDateString()}
              </span>
            </div>
            {currentUser.salary && (
              <div className="flex items-center p-3 bg-white/60 rounded-xl backdrop-blur-sm text-base sm:text-sm">
                <span className="text-gray-600 font-medium mr-3">Salary:</span>
                <span className="font-bold text-gray-900">
                  ₹{currentUser.salary.toLocaleString()}/month
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="group relative flex items-center space-x-3 px-8 py-4 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-500/50 transition-all duration-300 disabled:opacity-50 shadow-xl hover:shadow-2xl hover:scale-105 transform text-lg sm:text-base"
          >
            <Save className="w-6 h-6 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-lg sm:text-base font-bold">{saving ? 'Saving Changes...' : 'Save Changes'}</span>
            {saving && (
              <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse"></div>
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
);
};

export default ProfileSettings;