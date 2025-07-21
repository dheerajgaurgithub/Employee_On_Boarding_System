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
  <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen p-4 md:p-6">
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 md:p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <CheckSquare className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">
                  {role === 'employee' ? 'My Tasks' : 'Task Management'}
                </h2>
                <p className="text-blue-100 mt-1">
                  {role === 'employee' ? 'Stay on top of your assignments' : 'Manage and track team tasks'}
                </p>
              </div>
            </div>
            {role !== 'employee' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center space-x-3 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/30 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span className="font-semibold">Add Task</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-6 md:p-8">
          {/* Add Task Form */}
          {showAddForm && (
            <div className="mb-8 p-6 border-2 border-dashed border-blue-200 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Plus className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Create New Task</h3>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Task Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 bg-white shadow-sm hover:shadow-md"
                      placeholder="Enter a descriptive task title"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Assign To <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.assignedTo}
                      onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 bg-white shadow-sm hover:shadow-md"
                      required
                    >
                      <option value="">Select {role === 'admin' ? 'HR' : 'Employee'}</option>
                      {targetUsers.map(user => (
                        <option key={user._id} value={user._id}>{user.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Priority Level</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 bg-white shadow-sm hover:shadow-md"
                    >
                      <option value="low">🟢 Low Priority</option>
                      <option value="medium">🟡 Medium Priority</option>
                      <option value="high">🔴 High Priority</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Due Date</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 bg-white shadow-sm hover:shadow-md"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Allowed Submission Formats
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {['pdf', 'doc', 'text'].map(fmt => (
                        <label key={fmt} className="inline-flex items-center space-x-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-300">
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
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium capitalize text-gray-700">{fmt.toUpperCase()}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 bg-white shadow-sm hover:shadow-md resize-none"
                      rows="4"
                      placeholder="Provide detailed instructions and requirements for this task..."
                    />
                  </div>
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    Create Task
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold border border-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Empty State */}
          {myTasks.length === 0 ? (
            <div className="text-center py-16">
              <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl w-32 h-32 mx-auto mb-8 flex items-center justify-center">
                <CheckSquare className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {role === 'employee' ? 'No Tasks Assigned' : 'No Tasks Created'}
              </h3>
              <p className="text-gray-600 text-lg max-w-md mx-auto">
                {role === 'employee' 
                  ? 'You\'re all caught up! New tasks will appear here when assigned.' 
                  : 'Get started by creating your first task for your team.'
                }
              </p>
            </div>
          ) : (
            /* Task List */
            <div className="space-y-6">
              {myTasks.map((task) => {
                const assignedUser = getUserById(task.assignedTo);
                const assigner = getUserById(task.assignedBy);
                
                return (
                  <div key={task._id} className="group border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 bg-white hover:border-blue-200 hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        {/* Task Header */}
                        <div className="flex items-center flex-wrap gap-3 mb-4">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                            {task.title}
                          </h3>
                          
                          <span className={`px-3 py-1.5 text-xs font-bold rounded-full border-2 ${getPriorityColor(task.priority)} shadow-sm`}>
                            {task.priority === 'high' ? '🔴 HIGH' : task.priority === 'medium' ? '🟡 MEDIUM' : '🟢 LOW'}
                          </span>
                          
                          <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${getStatusColor(task.status)} shadow-sm`}>
                            {task.status.replace('-', ' ').toUpperCase()}
                          </span>
                          
                          {/* Approval Status Badge */}
                          {task.status === 'completed' && (
                            <span className={`px-3 py-1.5 text-xs font-bold rounded-full border-2 shadow-sm ${
                              task.approvalStatus === 'approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 
                              task.approvalStatus === 'rejected' ? 'bg-red-100 text-red-800 border-red-300' : 
                              'bg-amber-100 text-amber-800 border-amber-300'
                            }`}>
                              {task.approvalStatus === 'approved' ? '✅ APPROVED' : 
                               task.approvalStatus === 'rejected' ? '❌ REJECTED' : 
                               '⏳ PENDING APPROVAL'}
                            </span>
                          )}
                        </div>
                        
                        {task.description && (
                          <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-gray-700 leading-relaxed">{task.description}</p>
                          </div>
                        )}
                        
                        {/* Task Metadata */}
                        <div className="flex items-center flex-wrap gap-6 text-sm">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <div className="p-1.5 bg-blue-100 rounded-lg">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="font-medium">
                              {role === 'employee' 
                                ? `Assigned by: ${assigner?.name}` 
                                : `Assigned to: ${assignedUser?.name}`
                              }
                            </span>
                          </div>
                          
                          {task.dueDate && (
                            <div className="flex items-center space-x-2 text-gray-600">
                              <div className="p-1.5 bg-orange-100 rounded-lg">
                                <Calendar className="w-4 h-4 text-orange-600" />
                              </div>
                              <span className="font-medium">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-2 text-gray-600">
                            <div className="p-1.5 bg-gray-100 rounded-lg">
                              <Clock className="w-4 h-4 text-gray-600" />
                            </div>
                            <span className="font-medium">Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col space-y-2 ml-6">
                        {role === 'employee' && task.status !== 'completed' && (
                          <>
                            {task.status === 'pending' && (
                              <button
                                onClick={() => handleStatusUpdate(task._id, 'in-progress')}
                                className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                              >
                                🚀 Start Task
                              </button>
                            )}
                            {task.status === 'in-progress' && (
                              <button
                                onClick={() => handleStatusUpdate(task._id, 'completed')}
                                className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                disabled={!submissionData.documentUrl.trim()}
                              >
                                ✅ Complete
                              </button>
                            )}
                          </>
                        )}
                        
                        {/* Approve/Reject buttons for HR/Admin */}
                        {role !== 'employee' && task.status === 'completed' && task.approvalStatus === 'pending' && (
                          <div className="flex flex-col space-y-2">
                            <button
                              onClick={async () => await updateTask(task._id, { approvalStatus: 'approved' })}
                              className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                            >
                              ✅ Approve
                            </button>
                            <button
                              onClick={async () => await updateTask(task._id, { approvalStatus: 'rejected' })}
                              className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                            >
                              ❌ Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {renderSubmissionForm(task)}
                    {renderSubmissionDetails(task)}
                    
                    {task.submittedAt && (
                      <div className="mt-6 pt-4 border-t-2 border-green-100">
                        <div className="flex items-center space-x-2 text-green-700 bg-green-50 p-3 rounded-xl border border-green-200">
                          <CheckCircle className="w-5 h-5 flex-shrink-0" />
                          <span className="font-semibold">
                            Task completed on {new Date(task.submittedAt).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </span>
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
    </div>
  </div>
);
};

export default TaskManagement;