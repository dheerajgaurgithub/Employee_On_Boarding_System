import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Users, Edit, DollarSign, Phone, Mail, Circle, MessageCircle } from 'lucide-react';

const HRList = () => {
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
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">HR Management</h2>
        </div>
        <p className="text-gray-600 mt-1">Manage HR profiles, salaries, and view their status</p>
      </div>

      <div className="p-6">
        {hrUsers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No HR Members Yet</h3>
            <p className="text-gray-600">Add your first HR member to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hrUsers.map((hr) => {
              const assignedTasks = getTasksByAssigner(hr._id);
              const leaveRequests = getLeavesByApprover(hr._id);
              
              return (
                <div key={hr._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={hr.profilePicture}
                        alt={hr.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{hr.name}</h3>
                        <div className="flex items-center space-x-2">
                          <Circle
                            className={`w-3 h-3 ${
                              hr.isOnline ? 'text-green-500 fill-current' : 'text-gray-400'
                            }`}
                          />
                          <span className={`text-sm ${
                            hr.isOnline ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            {hr.isOnline ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{hr.email}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{hr.phone}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      {editingSalary === hr._id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={newSalary}
                            onChange={(e) => setNewSalary(e.target.value)}
                            className="w-24 px-2 py-1 text-sm border border-gray-300 rounded"
                            placeholder="Salary"
                          />
                          <button
                            onClick={() => handleSalaryUpdate(hr._id)}
                            className="text-green-600 hover:text-green-700 text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingSalary(null)}
                            className="text-gray-500 hover:text-gray-600 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="text-green-600 font-medium">
                            ₹{hr.salary?.toLocaleString() || 'Not Set'}
                          </span>
                          <button
                            onClick={() => startEditingSalary(hr)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-blue-600">{assignedTasks.length}</div>
                        <div className="text-xs text-gray-600">Tasks Assigned</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-orange-600">{leaveRequests.length}</div>
                        <div className="text-xs text-gray-600">Leave Requests</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                      <MessageCircle className="w-4 h-4" />
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