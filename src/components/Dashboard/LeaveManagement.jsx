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
  <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
    {/* Header Section */}
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl shadow-lg">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {role === 'employee' ? 'My Leave Requests' : 'Leave Management'}
            </h2>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              {role === 'employee' ? 'Track your leave applications' : 'Review and manage employee leave requests'}
            </p>
          </div>
        </div>
        {(role === 'employee' || role === 'hr') && (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 sm:space-x-3 px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg sm:rounded-xl hover:from-blue-600 hover:to-blue-700 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl transform sm:hover:scale-105 min-h-[44px]"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-semibold text-sm sm:text-base">Apply for Leave</span>
          </button>
        )}
      </div>
    </div>

    <div className="p-4 sm:p-6 lg:p-8">
      {/* Add Leave Form */}
      {showAddForm && (
        <div className="mb-6 sm:mb-8 p-4 sm:p-6 border-2 border-blue-200 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
            <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-md sm:rounded-lg">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">Apply for Leave</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm text-sm sm:text-base min-h-[44px]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm text-sm sm:text-base min-h-[44px]"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                Reason *
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm resize-none text-sm sm:text-base"
                rows="3"
                placeholder="Please provide a detailed reason for your leave request..."
                required
              />
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-2 sm:pt-4">
              <button
                type="submit"
                className="flex-1 px-4 sm:px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg sm:rounded-xl hover:from-green-600 hover:to-green-700 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl transform sm:hover:scale-105 font-semibold text-sm sm:text-base min-h-[44px]"
              >
                Submit Request
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 sm:px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg sm:rounded-xl hover:from-gray-500 hover:to-gray-600 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl transform sm:hover:scale-105 font-semibold text-sm sm:text-base min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Empty State */}
      {myLeaves.length === 0 ? (
        <div className="text-center py-12 sm:py-16">
          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <FileText className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-400" />
          </div>
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">No Leave Requests</h3>
          <p className="text-gray-500 text-sm sm:text-base lg:text-lg max-w-md mx-auto px-4">
            {role === 'employee'
              ? 'You haven\'t submitted any leave requests yet. Click the button above to apply for your first leave.'
              : 'No leave requests pending for review. All caught up!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {myLeaves.map((leave) => {
            const applicant = getUserById(leave.employeeId);

            return (
              <div
                key={leave._id}
                className="group border-2 border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 transform sm:hover:-translate-y-1 bg-white"
              >
                <div className="flex flex-col lg:flex-row items-start justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1 w-full lg:w-auto">
                    {/* Leave Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-4">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-md sm:rounded-lg">
                          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {role === 'employee'
                            ? 'Leave Request'
                            : `${leave.employeeName}'s Leave`}
                        </h3>
                      </div>
                      <span
                        className={`self-start sm:self-auto px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl shadow-lg ${getStatusColor(
                          leave.status
                        )} ${["approved","rejected"].includes(leave.status) ? "animate-pulse" : ""}`}
                      >
                        {leave.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Reason */}
                    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg sm:rounded-xl border border-gray-100">
                      <p className="text-gray-700 font-medium text-sm sm:text-base lg:text-lg leading-relaxed">{leave.reason}</p>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                      {role !== 'employee' && (
                        <div className="flex items-center space-x-2 sm:space-x-3 p-2.5 sm:p-3 bg-purple-50 rounded-lg sm:rounded-xl border border-purple-100">
                          <div className="p-1.5 sm:p-2 bg-white rounded-md sm:rounded-lg shadow-sm">
                            <User className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                          </div>
                          <div>
                            <span className="text-gray-500 font-medium">Applicant</span>
                            <p className="text-gray-800 font-bold">{leave.employeeName}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2 sm:space-x-3 p-2.5 sm:p-3 bg-green-50 rounded-lg sm:rounded-xl border border-green-100">
                        <div className="p-1.5 sm:p-2 bg-white rounded-md sm:rounded-lg shadow-sm">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                        </div>
                        <div>
                          <span className="text-gray-500 font-medium">Duration</span>
                          <p className="text-gray-800 font-bold">
                            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 sm:space-x-3 p-2.5 sm:p-3 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-100">
                        <div className="p-1.5 sm:p-2 bg-white rounded-md sm:rounded-lg shadow-sm">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
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
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 lg:ml-6 w-full sm:w-auto lg:w-auto">
                      <button
                        onClick={() => handleLeaveAction(leave._id, 'approved')}
                        className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg sm:rounded-xl hover:from-green-600 hover:to-green-700 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl transform sm:hover:scale-105 min-h-[44px]"
                      >
                        <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="font-semibold text-sm sm:text-base">Approve</span>
                      </button>
                      <button
                        onClick={() => handleLeaveAction(leave._id, 'rejected')}
                        className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg sm:rounded-xl hover:from-red-600 hover:to-red-700 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl transform sm:hover:scale-105 min-h-[44px]"
                      >
                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="font-semibold text-sm sm:text-base">Reject</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Response Section */}
                {leave.respondedAt && (
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-2 border-gray-100">
                    <div className="p-3 sm:p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg sm:rounded-xl border border-yellow-200">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="p-1.5 sm:p-2 bg-white rounded-md sm:rounded-lg shadow-sm">
                          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-gray-700 font-bold text-sm sm:text-base lg:text-lg">
                            {leave.status === "approved"
                              ? "🎉 Your leave request has been approved!"
                              : leave.status === "rejected"
                              ? "❌ Your leave request has been rejected."
                              : ""}
                          </p>
                          <p className="text-gray-600 font-medium text-xs sm:text-sm">
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
