import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { CheckSquare, Plus, Clock, CheckCircle, XCircle, User, Calendar } from 'lucide-react';

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

  const targetUsers = role === 'admin' ? getUsersByRole('hr') : getUsersByRole('employee').filter(emp => emp.createdBy === currentUser._id);
  const myTasks = role === 'employee' ? getTasksByUser(currentUser._id) : getTasksByAssigner(currentUser._id);

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
        dueDate: ''
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const [submissionData, setSubmissionData] = useState({
    documentUrl: '',
    documentType: 'other',
    notes: ''
  });

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
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Task Submission</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Document URL</label>
            <input
              type="text"
              value={submissionData.documentUrl}
              onChange={(e) => setSubmissionData({...submissionData, documentUrl: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter document URL"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Document Type</label>
            <select
              value={submissionData.documentType}
              onChange={(e) => setSubmissionData({...submissionData, documentType: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {allowedFormats.map(fmt => (
                <option key={fmt} value={fmt}>{fmt.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Notes</label>
            <textarea
              value={submissionData.notes}
              onChange={(e) => setSubmissionData({...submissionData, notes: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="2"
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
      <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
        <div className="text-sm text-green-600">
          <CheckCircle className="w-4 h-4 inline mr-1" />
          Completed on {new Date(task.submittedAt).toLocaleDateString()}
        </div>
        <div className="text-sm text-gray-600">
          <strong>Submission:</strong>
          <div className="ml-5 space-y-1">
            <div>
              <strong>Document:</strong>{' '}
              <a href={task.submission.documentUrl} target="_blank" rel="noopener noreferrer" 
                className="text-blue-600 hover:underline">
                View Document ({task.submission.documentType.toUpperCase()})
              </a>
            </div>
            {task.submission.notes && (
              <div>
                <strong>Notes:</strong> {task.submission.notes}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckSquare className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              {role === 'employee' ? 'My Tasks' : 'Task Management'}
            </h2>
          </div>
          {role !== 'employee' && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Task</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {showAddForm && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Add New Task</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter task title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign To *
                  </label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select {role === 'admin' ? 'HR' : 'Employee'}</option>
                    {targetUsers.map(user => (
                      <option key={user._id} value={user._id}>{user.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allowed Submission Formats
                </label>
                <div className="flex space-x-4">
                  {['pdf', 'doc', 'text'].map(fmt => (
                    <label key={fmt} className="inline-flex items-center">
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
                        className="form-checkbox"
                      />
                      <span className="ml-2 capitalize">{fmt}</span>
                    </label>
                  ))}
                </div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Enter task description"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Task
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

        {myTasks.length === 0 ? (
          <div className="text-center py-8">
            <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {role === 'employee' ? 'No Tasks Assigned' : 'No Tasks Created'}
            </h3>
            <p className="text-gray-600">
              {role === 'employee' 
                ? 'You have no tasks assigned yet.' 
                : 'Create your first task to get started.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {myTasks.map((task) => {
              const assignedUser = getUserById(task.assignedTo);
              const assigner = getUserById(task.assignedBy);
              
              return (
                <div key={task._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)}`}>
                          {task.priority.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                          {task.status.replace('-', ' ').toUpperCase()}
                        </span>
                        {/* Approval status badge */}
                        {task.status === 'completed' && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${task.approvalStatus === 'approved' ? 'bg-green-100 text-green-800 border-green-200' : task.approvalStatus === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}`}>{task.approvalStatus ? task.approvalStatus.toUpperCase() : 'PENDING APPROVAL'}</span>
                        )}
                      </div>
                      
                      {task.description && (
                        <p className="text-gray-600 mb-3">{task.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>
                            {role === 'employee' 
                              ? `Assigned by: ${assigner?.name}` 
                              : `Assigned to: ${assignedUser?.name}`
                            }
                          </span>
                        </div>
                        {task.dueDate && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    {role === 'employee' && task.status !== 'completed' && (
                      <div className="flex space-x-2 ml-4">
                        {task.status === 'pending' && (
                          <button
                            onClick={() => handleStatusUpdate(task._id, 'in-progress')}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            Start
                          </button>
                        )}
                        {task.status === 'in-progress' && (
                          <button
                            onClick={() => handleStatusUpdate(task._id, 'completed')}
                            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                            disabled={!submissionData.documentUrl.trim()}
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    )}
                    {/* Approve/Reject buttons for HR/Admin */}
                    {role !== 'employee' && task.status === 'completed' && task.approvalStatus === 'pending' && (
                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={async () => await updateTask(task._id, { approvalStatus: 'approved' })}
                          className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          Approve
                        </button>
                        <button
                          onClick={async () => await updateTask(task._id, { approvalStatus: 'rejected' })}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {renderSubmissionForm(task)}
                  {renderSubmissionDetails(task)}
                  
                  {task.submittedAt && (
                    <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      Completed on {new Date(task.submittedAt).toLocaleDateString()}
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

export default TaskManagement;