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
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              {role === 'employee' ? 'My Leave Requests' : 'Leave Management'}
            </h2>
          </div>
          {(role === 'employee' || role === 'hr') && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Apply for Leave</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {showAddForm && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Apply for Leave</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason *
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Enter reason for leave"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {myLeaves.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Leave Requests</h3>
            <p className="text-gray-600">
              {role === 'employee'
                ? 'You have no leave requests yet.'
                : 'No leave requests to review.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {myLeaves.map((leave) => {
              const applicant = getUserById(leave.employeeId);

              return (
                <div
                  key={leave._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {role === 'employee'
                            ? 'Leave Request'
                            : `${leave.employeeName}'s Leave`}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            leave.status
                          )} ${["approved","rejected"].includes(leave.status) ? "font-bold italic" : ""}`}
                        >
                          {leave.status.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-3">{leave.reason}</p>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {role !== 'employee' && (
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>Applicant: {leave.employeeName}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(leave.startDate).toLocaleDateString()} -{' '}
                            {new Date(leave.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            Applied: {new Date(leave.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {role !== 'employee' && leave.status === 'pending' && (
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleLeaveAction(leave._id, 'approved')}
                          className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleLeaveAction(leave._id, 'rejected')}
                          className="flex items-center space-x-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          <X className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {leave.respondedAt && (
                    <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600">
                      <span className="font-bold italic">
                        {leave.status === "approved"
                          ? "Your leave request has been approved. "
                          : leave.status === "rejected"
                          ? "Your leave request has been rejected. "
                          : ""}
                      </span>
                      Response given on{' '}
                      {new Date(leave.respondedAt).toLocaleDateString()}
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
