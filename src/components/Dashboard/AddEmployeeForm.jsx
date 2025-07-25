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
    if (loading) return;

    setError('');
    setLoading(true);

    try {
      if (!formData.name.trim()) throw new Error('Name is required');
      if (!/^\d{10}$/.test(formData.phone)) throw new Error('Valid 10-digit phone number is required');
      const salary = parseFloat(formData.salary);
      if (!salary || salary <= 0) throw new Error('Valid salary is required');

      const { email, password } = generateCredentials(formData.name, 'employee');

      const employeeData = {
        ...formData,
        email,
        password,
        role: 'employee',
        createdBy: currentUser._id,
        salary
      };

      const newEmployee = await addUser(employeeData);
      setCredentials({ email, password });

      setFormData({
        name: '',
        phone: '',
        salary: '',
        profilePicture: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150'
      });

    } catch (err) {
      setError(err?.message || 'Failed to add employee.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl p-3 sm:p-6 lg:p-8 border border-slate-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-6 sm:mb-8">
        <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg">
          <UserPlus className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800">Add New Employee</h2>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">Create a new employee profile with auto-generated credentials</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-lg sm:rounded-xl shadow-md">
          <div className="flex items-start space-x-3">
            <div className="p-1 bg-red-200 rounded-full mt-0.5 flex-shrink-0">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-red-800 mb-1 text-sm sm:text-base">Error Occurred</h4>
              <p className="text-red-700 text-sm break-words">{error}</p>
            </div>
          </div>
        </div>
      )}

      {credentials && (
        <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-r from-green-50 to-emerald-100 border-2 border-green-200 rounded-lg sm:rounded-xl shadow-lg">
          <div className="flex items-start space-x-3 text-green-700 mb-4">
            <div className="p-1.5 sm:p-2 bg-green-200 rounded-full flex-shrink-0">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-base sm:text-lg text-green-800">Employee Added Successfully!</h3>
              <p className="text-xs sm:text-sm text-green-600">Save these credentials securely</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 p-3 bg-white rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                <span className="font-semibold text-slate-700 text-sm sm:text-base">Email:</span>
              </div>
              <span className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full font-mono text-xs sm:text-sm break-all">{credentials.email}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 p-3 bg-white rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                <span className="font-semibold text-slate-700 text-sm sm:text-base">Password:</span>
              </div>
              <span className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full font-mono text-xs sm:text-sm break-all">{credentials.password}</span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <div className="space-y-2">
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2 flex items-center">
              <div className="w-1.5 h-3 sm:w-2 sm:h-4 bg-blue-500 rounded-full mr-2 flex-shrink-0"></div>
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="input-style"
              placeholder="Enter employee's full name"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2 flex items-center">
              <div className="w-1.5 h-3 sm:w-2 sm:h-4 bg-green-500 rounded-full mr-2 flex-shrink-0"></div>
              Phone Number *
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 p-1 bg-slate-100 rounded-full">
                <Phone className="text-slate-600 w-4 h-4" />
              </div>
              <input
                type="tel"
                name="phone"
                pattern="[0-9]{10}"
                title="Enter a valid 10-digit phone number"
                value={formData.phone}
                onChange={handleInputChange}
                className="input-style pl-10"
                placeholder="9876543210"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2 flex items-center">
              <div className="w-1.5 h-3 sm:w-2 sm:h-4 bg-yellow-500 rounded-full mr-2 flex-shrink-0"></div>
              Monthly Salary (₹) *
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 p-1 bg-slate-100 rounded-full">
                <DollarSign className="text-slate-600 w-4 h-4" />
              </div>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                className="input-style pl-10"
                placeholder="30000"
                min="0"
                step="1000"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2 flex items-center">
              <div className="w-1.5 h-3 sm:w-2 sm:h-4 bg-purple-500 rounded-full mr-2 flex-shrink-0"></div>
              Profile Picture URL
            </label>
            <input
              type="url"
              name="profilePicture"
              value={formData.profilePicture}
              onChange={handleInputChange}
              className="input-style"
              placeholder="https://example.com/photo.jpg"
            />
          </div>
        </div>

        <div className="border-2 border-blue-200 rounded-lg sm:rounded-xl p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md">
          <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="p-2 bg-blue-200 rounded-full flex-shrink-0">
              <Lock className="w-5 h-5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-blue-900 mb-2 text-base sm:text-lg">Auto-Generated Credentials</h3>
              <p className="text-blue-700 text-sm sm:text-base">
                Email and password will be automatically generated based on the employee's name.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                <span>Adding Employee...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
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
