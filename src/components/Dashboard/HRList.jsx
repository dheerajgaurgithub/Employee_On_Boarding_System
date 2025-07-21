import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Users, Edit, DollarSign, Phone, Mail, Circle, MessageCircle } from 'lucide-react';

const HRList = ({ onMessageHR }) => {
  const { getUsersByRole, updateUser } = useAuth();
  const { getTasksByAssigner, getLeavesByApprover } = useData();
  const [editingSalary, setEditingSalary] = useState(null);
  const [newSalary, setNewSalary] = useState('');

  const hrUsers = getUsersByRole('hr');

  const handleSalaryUpdate = (hrId) => {
    if (!hrId) {
      console.error('Invalid HR ID');
      return;
    }

    if (newSalary && parseFloat(newSalary) > 0) {
      updateUser(hrId, { salary: parseFloat(newSalary) })
        .then(() => {
          setEditingSalary(null);
          setNewSalary('');
        })
        .catch(error => {
          console.error('Failed to update salary:', error);
          alert('Failed to update salary. Please try again.');
        });
    } else {
      alert('Please enter a valid salary amount');
    }
  };

  const startEditingSalary = (hr) => {
    if (!hr || !hr._id) {
      console.error('Invalid HR data');
      return;
    }
    setEditingSalary(hr._id);
    setNewSalary(hr.salary?.toString() || '');
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-8 border-b border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl shadow-lg">
            <Users className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
              HR Management
            </h2>
            <p className="text-gray-600 font-medium mt-1">Manage HR profiles, salaries, and view their status</p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {hrUsers.length === 0 ? (
          <div className="text-center py-16">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Users className="w-12 h-12 text-gray-400" />
              </div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full -z-10 opacity-50"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No HR Members Yet</h3>
            <p className="text-gray-600 text-lg">Add your first HR member to get started with team management.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hrUsers.map((hr) => {
              const assignedTasks = getTasksByAssigner(hr._id);
              const leaveRequests = getLeavesByApprover(hr._id);
              
              return (
                <div key={hr._id} className="group bg-white/70 backdrop-blur-sm border-2 border-gray-100 rounded-2xl p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:border-blue-200 relative overflow-hidden">
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full -translate-y-10 translate-x-10 opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
                  
                  {/* Profile Section */}
                  <div className="flex items-start justify-between mb-6 relative z-10">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={hr.profilePicture}
                          alt={hr.name}
                          className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white shadow-lg group-hover:ring-blue-100 transition-all duration-300"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white shadow-sm ${
                          hr.isOnline ? 'bg-green-400' : 'bg-gray-400'
                        }`}></div>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{hr.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Circle
                            className={`w-3 h-3 ${
                              hr.isOnline ? 'text-green-500 fill-current animate-pulse' : 'text-gray-400'
                            }`}
                          />
                          <span className={`text-sm font-medium ${
                            hr.isOnline ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            {hr.isOnline ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4 mb-6 relative z-10">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Mail className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-gray-700 font-medium">{hr.email}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Phone className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-gray-700 font-medium">{hr.phone}</span>
                    </div>

                    {/* Salary Section */}
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                      </div>
                      {editingSalary === hr._id ? (
                        <div className="flex items-center space-x-2 flex-1">
                          <input
                            type="number"
                            value={newSalary}
                            onChange={(e) => setNewSalary(e.target.value)}
                            className="flex-1 px-3 py-2 text-sm border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                            placeholder="Enter salary"
                          />
                          <button
                            onClick={() => handleSalaryUpdate(hr._id)}
                            className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingSalary(null)}
                            className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between flex-1">
                          <span className="text-emerald-600 font-bold text-lg">
                            ₹{hr.salary?.toLocaleString() || 'Not Set'}
                          </span>
                          <button
                            onClick={() => startEditingSalary(hr)}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-4 mb-6 border border-gray-100 relative z-10">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="group/stat hover:scale-105 transition-transform">
                        <div className="text-2xl font-bold text-blue-600 mb-1">{assignedTasks.length}</div>
                        <div className="text-xs text-gray-600 font-medium">Tasks Assigned</div>
                        <div className="w-8 h-1 bg-blue-200 rounded-full mx-auto mt-2 group-hover/stat:bg-blue-400 transition-colors"></div>
                      </div>
                      <div className="group/stat hover:scale-105 transition-transform">
                        <div className="text-2xl font-bold text-orange-600 mb-1">{leaveRequests.length}</div>
                        <div className="text-xs text-gray-600 font-medium">Leave Requests</div>
                        <div className="w-8 h-1 bg-orange-200 rounded-full mx-auto mt-2 group-hover/stat:bg-orange-400 transition-colors"></div>
                      </div>
                    </div>
                  </div>

                  {/* Message Button */}
                  <div className="relative z-10">
                    <button 
                      className="w-full flex items-center justify-center space-x-3 px-4 py-3 text-sm font-semibold text-blue-600 bg-blue-50 border-2 border-blue-200 rounded-xl hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 hover:text-white hover:border-blue-500 transition-all duration-300 group/btn"
                      onClick={onMessageHR ? () => onMessageHR(hr) : undefined}
                    >
                      <MessageCircle className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                      <span>Message HR</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HRList;