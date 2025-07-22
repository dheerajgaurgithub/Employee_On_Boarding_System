import React, { useEffect, useState } from 'react';
import {
  CheckSquare, Plus, Clock, CheckCircle, XCircle, User, Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import axios from 'axios';

const TaskManagement = ({ role }) => {
  const { currentUser, token } = useAuth();
  const { getUsersByRole, getUserById } = useData();

  const [formData, setFormData] = useState({
    title: '',
    assignedTo: '',
    priority: 'low',
    dueDate: '',
    allowedFormats: [],
    description: ''
  });
  const [targetUsers, setTargetUsers] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submissionData, setSubmissionData] = useState({
    notes: '',
    documentType: 'pdf',
    documentUrl: ''
  });

  // Fetch target users for task assignment
  useEffect(() => {
    const fetchUsers = async () => {
      const roleToFetch = role === 'admin' ? 'hr' : 'employee';
      const users = await getUsersByRole(roleToFetch);
      setTargetUsers(users || []);
    };
    if (role !== 'employee') fetchUsers();
  }, [role]);

  // Fetch tasks for current user
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get('/tasks', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMyTasks(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to load tasks:', err);
        setMyTasks([]);
      }
    };
    fetchTasks();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/tasks', {
        ...formData,
        assignedBy: currentUser._id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyTasks(prev => [...prev, res.data]);
      setShowAddForm(false);
      setFormData({
        title: '',
        assignedTo: '',
        priority: 'low',
        dueDate: '',
        allowedFormats: [],
        description: ''
      });
    } catch (err) {
      console.error('Task creation failed:', err);
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      const payload = { status: newStatus };
      if (newStatus === 'completed') {
        payload.submission = { ...submissionData };
        payload.submittedAt = new Date();
        payload.approvalStatus = 'pending';
      }
      const res = await axios.put(`/tasks/${taskId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyTasks(prev => prev.map(task => task._id === taskId ? res.data : task));
      setSubmissionData({ notes: '', documentType: 'pdf', documentUrl: '' });
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      const res = await axios.put(`/tasks/${taskId}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyTasks(prev => prev.map(task => task._id === taskId ? res.data : task));
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const renderSubmissionForm = (task) => {
    if (role !== 'employee' || task.status !== 'in-progress') return null;
    return (
      <div className="mt-4 p-3 border rounded bg-gray-50">
        <h4 className="text-sm font-semibold mb-2">Submit Task</h4>
        <div className="space-y-2">
          <input
            type="url"
            value={submissionData.documentUrl}
            onChange={e => setSubmissionData({ ...submissionData, documentUrl: e.target.value })}
            placeholder="Document URL"
            className="w-full px-3 py-2 border rounded"
            required
          />
          <select
            value={submissionData.documentType}
            onChange={e => setSubmissionData({ ...submissionData, documentType: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          >
            {task.allowedFormats.map(fmt => (
              <option key={fmt} value={fmt}>{fmt.toUpperCase()}</option>
            ))}
          </select>
          <textarea
            value={submissionData.notes}
            onChange={e => setSubmissionData({ ...submissionData, notes: e.target.value })}
            placeholder="Additional notes (optional)"
            className="w-full px-3 py-2 border rounded"
            rows="2"
          />
        </div>
      </div>
    );
  };

  const renderSubmissionDetails = (task) => {
    if (task.status !== 'completed' || !task.submission?.documentUrl) return null;
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
      {/* Header */}
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
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              <span>Add Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Add Task Form */}
      <div className="p-6">
        {showAddForm && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Add New Task</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign To *</label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Select {role === 'admin' ? 'HR' : 'Employee'}</option>
                    {targetUsers.map(user => (
                      <option key={user._id} value={user._id}>{user.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              {/* Allowed Formats and Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allowed Submission Formats</label>
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
                <label className="block text-sm font-medium text-gray-700 mt-4">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="3"
                  placeholder="Enter task description"
                />
              </div>

              {/* Action buttons */}
              <div className="flex space-x-3">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add Task</button>
                <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Task List */}
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
            {(Array.isArray(myTasks) ? myTasks : []).map((task) => {
              const assignedUser = getUserById(task.assignedTo);
              const assigner = getUserById(task.assignedBy);
              return (
                <div key={task._id} className="border p-4 rounded-lg hover:shadow-md">
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">{task.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(task.priority)}`}>
                          {task.priority.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                          {task.status.replace('-', ' ').toUpperCase()}
                        </span>
                        {task.status === 'completed' && (
                          <span className={`px-2 py-1 text-xs rounded-full border ${task.approvalStatus === 'approved' ? 'bg-green-100 text-green-800 border-green-200' : task.approvalStatus === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}`}>
                            {task.approvalStatus?.toUpperCase() || 'PENDING APPROVAL'}
                          </span>
                        )}
                      </div>
                      {task.description && <p className="text-gray-600 mb-3">{task.description}</p>}
                      <div className="text-sm text-gray-500 space-x-4 flex">
                        <span className="flex items-center"><User className="w-4 h-4 mr-1" />
                          {role === 'employee' ? `Assigned by: ${assigner?.name}` : `Assigned to: ${assignedUser?.name}`}
                        </span>
                        {task.dueDate && <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" />Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                        <span className="flex items-center"><Clock className="w-4 h-4 mr-1" />Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {role === 'employee' && task.status !== 'completed' && (
                      <div className="flex space-x-2">
                        {task.status === 'pending' && (
                          <button onClick={() => handleStatusUpdate(task._id, 'in-progress')} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">
                            Start
                          </button>
                        )}
                        {task.status === 'in-progress' && (
                          <button
                            onClick={() => handleStatusUpdate(task._id, 'completed')}
                            className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200"
                            disabled={!submissionData.documentUrl.trim()}
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    )}
                    {role !== 'employee' && task.status === 'completed' && task.approvalStatus === 'pending' && (
                      <div className="flex flex-col space-y-2 ml-4">
                        <button onClick={() => updateTask(task._id, { approvalStatus: 'approved' })} className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200">Approve</button>
                        <button onClick={() => updateTask(task._id, { approvalStatus: 'rejected' })} className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200">Reject</button>
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
