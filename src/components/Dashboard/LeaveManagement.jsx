import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { FileText, Plus, Calendar, User, Clock, Check, X } from 'lucide-react';

const LeaveManagement = ({ role }) => {
  const { currentUser, getUserById, users } = useAuth();
  const {
    addLeaveRequest,
    updateLeaveRequest,
    getLeavesByUser,
    getLeavesByApprover,
  } = useData();

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
  });

  const myLeaves =
    role === 'employee'
      ? getLeavesByUser(currentUser._id)
      : getLeavesByApprover(currentUser._id);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.startDate) {
      alert('Please select a start date');
      return;
    }
    if (!formData.endDate) {
      alert('Please select an end date');
      return;
    }
    if (!formData.reason.trim()) {
      alert('Please provide a reason for leave');
      return;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    if (endDate < startDate) {
      alert('End date cannot be before start date');
      return;
    }

    let appliedTo;
    if (role === 'employee') {
      // For employees, their leave requests should go to their assigned HR (createdBy)
      if (!currentUser.createdBy) {
        console.error('Employee has no assigned HR:', currentUser);
        alert('Could not determine your HR approver. Please contact support.');
        return;
      }
      const hr = users.find(u => u._id === currentUser.createdBy && u.role === 'hr');
      if (!hr) {
        console.error('Assigned HR not found:', currentUser.createdBy);
        alert('Could not determine your HR approver. Please contact support.');
        return;
      }
      appliedTo = hr._id;
    } else if (role === 'hr') {
      // For HR, their leave requests should go to any admin
      const admins = users.filter(u => u.role === 'admin');
      if (!admins.length) {
        console.error('No admin users found');
        alert('Could not determine admin approver. Please contact support.');
        return;
      }
      // Select the first admin as the approver
      appliedTo = admins[0]._id;
    } else {
      console.error('Invalid role for leave request:', role);
      alert('You are not authorized to create leave requests.');
      return;
    }

    try {
      await addLeaveRequest({
        ...formData,
        employeeId: currentUser._id,
        employeeName: currentUser.name,
        appliedTo,
      });

      setShowAddForm(false);
      setFormData({
        startDate: '',
        endDate: '',
        reason: '',
      });
    } catch (error) {
      console.error('Failed to submit leave request:', error);
      alert(error.message || 'Failed to submit leave request. Please try again.');
    }
  };

  const handleLeaveAction = async (leaveId, status) => {
    try {
      await updateLeaveRequest(leaveId, { status });
    } catch (error) {
      console.error('Failed to update leave request:', error);
      alert(error.message || `Failed to ${status} leave request. Please try again.`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
  <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
    {/* Header Section */}
    <div className="p-8 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {role === 'employee' ? 'My Leave Requests' : 'Leave Management'}
            </h2>
            <p className="text-gray-600 mt-1">
              {role === 'employee' ? 'Track your leave applications' : 'Review and manage employee leave requests'}
            </p>
          </div>
        </div>
        {(role === 'employee' || role === 'hr') && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">Apply for Leave</span>
          </button>
        )}
      </div>
    </div>

    <div className="p-8">
      {/* Add Leave Form */}
      {showAddForm && (
        <div className="mb-8 p-6 border-2 border-blue-200 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Apply for Leave</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                Reason *
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm resize-none"
                rows="4"
                placeholder="Please provide a detailed reason for your leave request..."
                required
              />
            </div>
            
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
              >
                Submit Request
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Empty State */}
      {myLeaves.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">No Leave Requests</h3>
          <p className="text-gray-500 text-lg max-w-md mx-auto">
            {role === 'employee'
              ? 'You haven\'t submitted any leave requests yet. Click the button above to apply for your first leave.'
              : 'No leave requests pending for review. All caught up!'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {myLeaves.map((leave) => {
            const applicant = getUserById(leave.employeeId);

            return (
              <div
                key={leave._id}
                className="group border-2 border-gray-200 rounded-2xl p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 bg-white"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Leave Header */}
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {role === 'employee'
                            ? 'Leave Request'
                            : `${leave.employeeName}'s Leave`}
                        </h3>
                      </div>
                      <span
                        className={`px-4 py-2 text-sm font-bold rounded-xl shadow-lg ${getStatusColor(
                          leave.status
                        )} ${["approved","rejected"].includes(leave.status) ? "animate-pulse" : ""}`}
                      >
                        {leave.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Reason */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100">
                      <p className="text-gray-700 font-medium text-lg leading-relaxed">{leave.reason}</p>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {role !== 'employee' && (
                        <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <User className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <span className="text-gray-500 font-medium">Applicant</span>
                            <p className="text-gray-800 font-bold">{leave.employeeName}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl border border-green-100">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Calendar className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <span className="text-gray-500 font-medium">Duration</span>
                          <p className="text-gray-800 font-bold">
                            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <span className="text-gray-500 font-medium">Applied</span>
                          <p className="text-gray-800 font-bold">
                            {new Date(leave.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {role !== 'employee' && leave.status === 'pending' && (
                    <div className="flex space-x-3 ml-6">
                      <button
                        onClick={() => handleLeaveAction(leave._id, 'approved')}
                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <Check className="w-5 h-5" />
                        <span className="font-semibold">Approve</span>
                      </button>
                      <button
                        onClick={() => handleLeaveAction(leave._id, 'rejected')}
                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <X className="w-5 h-5" />
                        <span className="font-semibold">Reject</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Response Section */}
                {leave.respondedAt && (
                  <div className="mt-6 pt-6 border-t-2 border-gray-100">
                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Clock className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-gray-700 font-bold text-lg">
                            {leave.status === "approved"
                              ? "🎉 Your leave request has been approved!"
                              : leave.status === "rejected"
                              ? "❌ Your leave request has been rejected."
                              : ""}
                          </p>
                          <p className="text-gray-600 font-medium">
                            Response given on {new Date(leave.respondedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
);
};

export default LeaveManagement;
