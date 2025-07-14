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
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-3 mb-6">
        <UserPlus className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Add New HR</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {credentials && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center text-green-700 mb-2">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">HR Added Successfully!</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span className="font-medium">Email:</span>
              <span className="bg-green-100 px-2 py-1 rounded">{credentials.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4" />
              <span className="font-medium">Password:</span>
              <span className="bg-green-100 px-2 py-1 rounded">{credentials.password}</span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter HR's full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+91-9876543210"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Salary (₹) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="50000"
                min="0"
                step="1000"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Picture URL
            </label>
            <input
              type="url"
              name="profilePicture"
              value={formData.profilePicture}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/photo.jpg"
            />
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-blue-50">
          <h3 className="font-medium text-blue-900 mb-2">Auto-Generated Credentials</h3>
          <p className="text-sm text-blue-700">
            Email and password will be automatically generated based on the HR's name.
            The credentials will be displayed after successful creation.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Adding HR...' : 'Add HR'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddHRForm;