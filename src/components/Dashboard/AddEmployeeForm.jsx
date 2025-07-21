import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { generateCredentials } from '../../data/mockData';
import { UserPlus, Mail, Lock, Phone, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

const AddEmployeeForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    salary: '',
    profilePicture: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150'
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

      const { email, password } = generateCredentials(formData.name, 'employee');
      
      const employeeData = {
        ...formData,
        email,
        password,
        role: 'employee',
        createdBy: currentUser._id,
        salary: parseFloat(formData.salary)
      };

      const newEmployee = addUser(employeeData);
      setCredentials({ email, password });
      
      // Reset form
      setFormData({
        name: '',
        phone: '',
        salary: '',
        profilePicture: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150'
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
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl p-4 sm:p-8 border border-slate-200">
      <div className="flex flex-col sm:flex-row items-center sm:space-x-4 mb-8 space-y-4 sm:space-y-0">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg">
          <UserPlus className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Add New Employee</h2>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">Create a new employee profile with auto-generated credentials</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-xl flex items-start space-x-3 shadow-md">
          <div className="p-1 bg-red-200 rounded-full mt-0.5">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h4 className="font-semibold text-red-800 mb-1">Error Occurred</h4>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {credentials && (
        <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-100 border-2 border-green-200 rounded-xl shadow-lg">
          <div className="flex items-center text-green-700 mb-4">
            <div className="p-2 bg-green-200 rounded-full mr-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-green-800">Employee Added Successfully!</h3>
              <p className="text-sm text-green-600">Save these credentials securely</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-green-200">
              <Mail className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-slate-700">Email:</span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-mono text-sm">{credentials.email}</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-green-200">
              <Lock className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-slate-700">Password:</span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-mono text-sm">{credentials.password}</span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
              <div className="w-2 h-4 bg-blue-500 rounded-full mr-2"></div>
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md placeholder-slate-400"
              placeholder="Enter employee's full name"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
              <div className="w-2 h-4 bg-green-500 rounded-full mr-2"></div>
              Phone Number *
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 p-1 bg-slate-100 rounded-full">
                <Phone className="text-slate-600 w-4 h-4" />
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md placeholder-slate-400"
                placeholder="+91-9876543210"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
              <div className="w-2 h-4 bg-yellow-500 rounded-full mr-2"></div>
              Monthly Salary (₹) *
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 p-1 bg-slate-100 rounded-full">
                <DollarSign className="text-slate-600 w-4 h-4" />
              </div>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md placeholder-slate-400"
                placeholder="30000"
                min="0"
                step="1000"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
              <div className="w-2 h-4 bg-purple-500 rounded-full mr-2"></div>
              Profile Picture URL
            </label>
            <input
              type="url"
              name="profilePicture"
              value={formData.profilePicture}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md placeholder-slate-400"
              placeholder="https://example.com/photo.jpg"
            />
          </div>
        </div>

        <div className="border-2 border-blue-200 rounded-xl p-6 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-blue-200 rounded-full">
              <Lock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-blue-900 mb-2 text-lg">Auto-Generated Credentials</h3>
              <p className="text-blue-700 leading-relaxed">
                Email and password will be automatically generated based on the employee's name.
                The credentials will be displayed after successful creation for secure sharing.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-200 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-3"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Adding Employee...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                <span>Add Employee</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployeeForm;