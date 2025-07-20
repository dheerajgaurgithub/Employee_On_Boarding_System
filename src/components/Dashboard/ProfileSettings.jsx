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
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Settings className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
        </div>
        <p className="text-gray-600 mt-1">Manage your personal information and preferences</p>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Section */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src={formData.profilePicture}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
              />
              <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full">
                <Camera className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Profile Picture</h3>
              <p className="text-sm text-gray-600">Update your profile picture by entering a new URL</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+91-9876543210"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={currentUser.email}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  disabled
                  placeholder="Email cannot be changed"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Email address cannot be modified</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Picture URL
              </label>
              <div className="relative">
                <Camera className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="url"
                  name="profilePicture"
                  value={formData.profilePicture}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/your-photo.jpg"
                />
              </div>
            </div>
          </div>

          {/* Account Information (Read-only) */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Role:</span>
                <span className="ml-2 font-medium text-gray-900 capitalize">{currentUser.role}</span>
              </div>
              <div>
                <span className="text-gray-600">Account Status:</span>
                <span className="ml-2 font-medium text-green-600">{currentUser.status}</span>
              </div>
              <div>
                <span className="text-gray-600">Member Since:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {new Date(currentUser.createdAt).toLocaleDateString()}
                </span>
              </div>
              {currentUser.salary && (
                <div>
                  <span className="text-gray-600">Salary:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    ₹{currentUser.salary.toLocaleString()}/month
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;