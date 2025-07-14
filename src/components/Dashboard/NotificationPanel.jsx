import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Bell, CheckCircle, AlertCircle, Calendar, CheckSquare, FileText } from 'lucide-react';

const NotificationPanel = () => {
  const { currentUser } = useAuth();
  const { getNotificationsByUser, markNotificationRead } = useData();

  const notifications = getNotificationsByUser(currentUser.id);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task': return CheckSquare;
      case 'leave': return FileText;
      case 'meeting': return Calendar;
      default: return Bell;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'task': return 'text-blue-600';
      case 'leave': return 'text-orange-600';
      case 'meeting': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const handleMarkRead = (notificationId) => {
    markNotificationRead(notificationId);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Bell className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
        </div>
        <p className="text-gray-600 mt-1">Stay updated with your latest activities</p>
      </div>

      <div className="p-6">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications</h3>
            <p className="text-gray-600">You're all caught up! Check back later for updates.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const iconColor = getNotificationColor(notification.type);
              
              return (
                <div 
                  key={notification.id} 
                  className={`border rounded-lg p-4 transition-all ${
                    notification.read 
                      ? 'border-gray-200 bg-white' 
                      : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      notification.read ? 'bg-gray-100' : 'bg-white'
                    }`}>
                      <Icon className={`w-5 h-5 ${iconColor}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className={`text-sm font-semibold ${
                            notification.read ? 'text-gray-900' : 'text-blue-900'
                          }`}>
                            {notification.title}
                          </h3>
                          <p className={`text-sm mt-1 ${
                            notification.read ? 'text-gray-600' : 'text-blue-800'
                          }`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkRead(notification.id)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
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

export default NotificationPanel;