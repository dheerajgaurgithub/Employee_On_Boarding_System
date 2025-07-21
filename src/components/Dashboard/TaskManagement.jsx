import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  CheckSquare, Plus, Clock, CheckCircle, XCircle, User, Calendar
} from 'lucide-react';

const TaskManagement = ({ role }) => {
  const { currentUser, getUsersByRole, getUserById } = useAuth();
  const { addTask, updateTask, getTasksByUser, getTasksByAssigner } = useData();

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: '',
    allowedFormats: ['pdf', 'doc', 'text']
  });

  const [submissionData, setSubmissionData] = useState({
    documentUrl: '',
    documentType: 'other',
    notes: ''
  });

  const targetUsers = role === 'admin'
    ? getUsersByRole('hr')
    : getUsersByRole('employee').filter(emp => emp.createdBy === currentUser._id);

  const myTasks = role === 'employee'
    ? getTasksByUser(currentUser._id)
    : getTasksByAssigner(currentUser._id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.assignedTo) return;

    try {
      await addTask({
        ...formData,
        assignedBy: currentUser._id
      });

      setFormData({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'medium',
        dueDate: '',
        allowedFormats: ['pdf', 'doc', 'text']
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      const updates = {
        status: newStatus,
        ...(newStatus === 'completed' && {
          submittedAt: new Date(),
          submission: submissionData
        })
      };
      await updateTask(taskId, updates);
      setSubmissionData({ documentUrl: '', documentType: 'other', notes: '' });
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const renderSubmissionForm = (task) => {
    if (role !== 'employee' || task.status !== 'in-progress') return null;
    const allowedFormats = task.allowedFormats || ['pdf', 'doc', 'text'];

    return (
      <div className="mt-6 pt-6 border-t border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-blue-600" />
          Task Submission
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Document URL</label>
            <input
              type="text"
              value={submissionData.documentUrl}
              onChange={(e) => setSubmissionData({ ...submissionData, documentUrl: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
              placeholder="Enter document URL"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
            <select
              value={submissionData.documentType}
              onChange={(e) => setSubmissionData({ ...submissionData, documentType: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
            >
              {allowedFormats.map(fmt => (
                <option key={fmt} value={fmt}>{fmt.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={submissionData.notes}
              onChange={(e) => setSubmissionData({ ...submissionData, notes: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm resize-none"
              rows="3"
              placeholder="Add submission notes"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderSubmissionDetails = (task) => {
    if (!task.submission || !task.submission.documentUrl) return null;

    return (
      <div className="mt-6 pt-6 border-t border-gray-200 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
        <div className="text-sm text-green-700 flex items-start sm:items-center mb-4">
          <CheckCircle className="w-5 h-5 mr-3 mt-0.5 sm:mt-0 flex-shrink-0 text-green-600" />
          <span className="break-words font-medium">
            Completed on {new Date(task.submittedAt).toLocaleDateString()}
          </span>
        </div>
        
        <div className="text-sm text-gray-700">
          <div className="font-semibold mb-3 text-gray-800">Submission Details:</div>
          <div className="ml-0 sm:ml-6 space-y-3">
            <div className="break-words bg-white p-3 rounded-md border border-green-100">
              <span className="font-semibold text-gray-700">Document:</span>{' '}
              <a 
                href={task.submission.documentUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline decoration-dotted hover:decoration-solid break-all inline-block mt-1 sm:mt-0 font-medium transition-colors duration-200"
              >
                View Document ({task.submission.documentType.toUpperCase()})
              </a>
            </div>
            
            {task.submission.notes && (
              <div className="break-words bg-white p-3 rounded-md border border-green-100">
                <span className="font-semibold text-gray-700">Notes:</span>
                <div className="mt-2 text-gray-600 leading-relaxed">
                  {task.submission.notes}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300 ring-1 ring-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300 ring-1 ring-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-300 ring-1 ring-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-300 ring-1 ring-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 ring-1 ring-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 ring-1 ring-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200';
      default: return 'bg-gray-100 text-gray-800 ring-1 ring-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">
              {role === 'employee' ? 'My Tasks' : 'Task Management'}
            </h2>
          </div>
          {role !== 'employee' && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 px-5 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-all duration-200 font-medium backdrop-blur-sm border border-white border-opacity-20"
            >
              <Plus className="w-5 h-5" />
              <span>Add Task</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {showAddForm && (
          <div className="mb-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200 p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Plus className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Add New Task</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Task Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assign To *</label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                    required
                  >
                    <option value="">Select {role === 'admin' ? 'HR' : 'Employee'}</option>
                    {targetUsers.map(user => (
                      <option key={user._id} value={user._id}>{user.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Allowed Submission Formats</label>
                <div className="flex flex-wrap gap-4">
                  {['pdf', 'doc', 'text'].map(fmt => (
                    <label key={fmt} className="inline-flex items-center bg-white px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.allowedFormats.includes(fmt)}
                        onChange={e => {
                          setFormData(prev => ({
                            ...prev,
                            allowedFormats: e.target.checked
                              ? [...prev.allowedFormats, fmt]
                              : prev.allowedFormats.filter(f => f !== fmt)
                          }));
                        }}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="ml-3 font-medium capitalize text-gray-700">{fmt}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm resize-none"
                  rows="4"
                  placeholder="Enter task description"
                />
              </div>
              
              <div className="flex space-x-4 pt-4 border-t border-gray-200">
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                >
                  Add Task
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)} 
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {myTasks.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200">
            <div className="p-4 bg-white bg-opacity-60 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <CheckSquare className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              {role === 'employee' ? 'No Tasks Assigned' : 'No Tasks Created'}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {role === 'employee'
                ? 'You have no tasks assigned yet. Check back later or contact your manager.'
                : 'Create your first task to get started with task management.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {myTasks.map(task => {
              const assignedUser = getUserById(task.assignedTo);
              const assigner = getUserById(task.assignedBy);

              return (
                <div key={task._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 bg-white hover:border-gray-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-3 mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">{task.title}</h3>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(task.priority)}`}>
                          {task.priority.toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                          {task.status.replace('-', ' ').toUpperCase()}
                        </span>
                        {task.status === 'completed' && (
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                            task.approvalStatus === 'approved' ? 'bg-green-100 text-green-800 border-green-300 ring-1 ring-green-200'
                              : task.approvalStatus === 'rejected' ? 'bg-red-100 text-red-800 border-red-300 ring-1 ring-red-200'
                                : 'bg-yellow-100 text-yellow-800 border-yellow-300 ring-1 ring-yellow-200'
                          }`}>
                            {task.approvalStatus?.toUpperCase() || 'PENDING APPROVAL'}
                          </span>
                        )}
                      </div>
                      
                      {task.description && (
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-400">
                          <p className="text-gray-700 leading-relaxed">{task.description}</p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                          <User className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">
                            {role === 'employee' ? `Assigned by: ${assigner?.name}` : (() => {
                              if (!task.assignedTo) return "Assigned to: Unassigned";
                              if (typeof task.assignedTo === "object" && task.assignedTo.name) return `Assigned to: ${task.assignedTo.name}`;
                              if (typeof task.assignedTo === "string" && getUserById) {
                                const user = getUserById(task.assignedTo);
                                return user ? `Assigned to: ${user.name}` : "Assigned to: Unknown";
                              }
                              return "Assigned to: Unknown";
                            })()}
                          </span>
                        </div>
                        
                        {task.dueDate && (
                          <div className="flex items-center space-x-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <Calendar className="w-4 h-4 text-orange-600" />
                            <span className="font-medium">Due: {formatDate(task.dueDate)}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                          <Clock className="w-4 h-4 text-green-600" />
                          <span className="font-medium">Created: {formatDate(task.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {role === 'employee' && task.status !== 'completed' && (
                      <div className="flex flex-col space-y-2 ml-6">
                        {task.status === 'pending' && (
                          <button 
                            onClick={() => handleStatusUpdate(task._id, 'in-progress')} 
                            className="px-4 py-2 text-sm font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 border border-blue-200"
                          >
                            Start Task
                          </button>
                        )}
                        {task.status === 'in-progress' && (
                          <button
                            onClick={() => handleStatusUpdate(task._id, 'completed')}
                            className="px-4 py-2 text-sm font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200 border border-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!submissionData.documentUrl.trim()}
                          >
                            Complete Task
                          </button>
                        )}
                      </div>
                    )}

                    {role !== 'employee' && task.status === 'completed' && task.approvalStatus === 'pending' && (
                      <div className="flex flex-col space-y-2 ml-6">
                        <button
                          onClick={async () => await updateTask(task._id, { approvalStatus: 'approved' })}
                          className="px-4 py-2 text-sm font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200 border border-green-200"
                        >
                          Approve
                        </button>
                        <button
                          onClick={async () => await updateTask(task._id, { approvalStatus: 'rejected' })}
                          className="px-4 py-2 text-sm font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 border border-red-200"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>

                  {renderSubmissionForm(task)}
                  {renderSubmissionDetails(task)}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManagement;

// Utility function to format date as DD/MM/YYYY
function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d)) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}