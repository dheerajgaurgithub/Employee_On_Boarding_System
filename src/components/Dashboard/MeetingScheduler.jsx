import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Calendar, Plus, Clock, Users, User } from 'lucide-react';

const MeetingScheduler = ({ role }) => {
  const { currentUser, getUsersByRole, getUserById } = useAuth();
  const { addMeeting, updateMeeting, getMeetingsByUser } = useData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dateTime: '',
    duration: 60,
    attendees: []
  });

  const targetUsers = role === 'admin' ? getUsersByRole('hr') : getUsersByRole('employee').filter(emp => emp.createdBy === currentUser._id);
  const myMeetings = getMeetingsByUser(currentUser._id);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.dateTime || formData.attendees.length === 0) {
      alert('Please fill in all required fields and select at least one attendee');
      return;
    }

    addMeeting({
      ...formData,
      scheduledBy: currentUser._id
    });

    setFormData({
      title: '',
      description: '',
      dateTime: '',
      duration: 60,
      attendees: []
    });
    setShowAddForm(false);
  };

  const handleAttendeeChange = (userId) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.includes(userId)
        ? prev.attendees.filter(id => id !== userId)
        : [...prev.attendees, userId]
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              {role === 'employee' ? 'My Meetings' : 'Meeting Scheduler'}
            </h2>
          </div>
          {role !== 'employee' && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Schedule Meeting</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {showAddForm && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Schedule New Meeting</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter meeting title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.dateTime}
                    onChange={(e) => setFormData({...formData, dateTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attendees * (Select {role === 'admin' ? 'HR' : 'Employee'} members)
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {targetUsers.map(user => (
                    <label key={user._id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.attendees.includes(user._id)}
                        onChange={() => handleAttendeeChange(user._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{user.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Enter meeting description"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Schedule Meeting
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

        {myMeetings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Meetings Scheduled</h3>
            <p className="text-gray-600">
              {role === 'employee' 
                ? 'You have no meetings scheduled yet.' 
                : 'Schedule your first meeting to get started.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {myMeetings.map((meeting) => {
              const organizer = getUserById(meeting.scheduledBy);
              
              return (
                <div key={meeting._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(meeting.status)}`}>
                          {meeting.status.toUpperCase()}
                        </span>
                      </div>
                      
                      {meeting.description && (
                        <p className="text-gray-600 mb-3">{meeting.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>
                            {role === 'employee' 
                              ? `Organized by: ${organizer?.name}` 
                              : `Organizer: You`
                            }
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(meeting.dateTime).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(meeting.dateTime).toLocaleTimeString()} ({meeting.duration} min)
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{meeting.attendees.length} attendees</span>
                        </div>
                      </div>
                    </div>
                    
                    {role !== 'employee' && meeting.status === 'scheduled' && (
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => updateMeeting(meeting.id, { status: 'completed' })}
                          className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          Mark Complete
                        </button>
                        <button
                          onClick={() => updateMeeting(meeting.id, { status: 'cancelled' })}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    {meeting.status === 'scheduled' && meeting.googleMeetLink && (
                      <div className="flex space-x-2 ml-4 mt-2">
                        <a
                          href={meeting.googleMeetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Join Meeting
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {meeting.attendees.map(attendeeId => {
                        const attendee = getUserById(attendeeId);
                        return attendee ? (
                          <span key={attendeeId} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {attendee.name}
                          </span>
                        ) : null;
                      })}
                    </div>
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

export default MeetingScheduler;