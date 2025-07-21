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
  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100">
    <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
          <Bell className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white">Notifications</h2>
          <p className="text-blue-100 mt-1 font-medium">Stay updated with your latest activities</p>
        </div>
      </div>
    </div>

    <div className="p-8 sm:p-4">
      {notifications.length === 0 ? (
        <div className="text-center py-16 sm:py-8">
          <div className="relative">
            <div className="w-20 h-20 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Bell className="w-10 h-10 sm:w-7 sm:h-7 text-blue-500" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-4 sm:h-4 bg-green-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 sm:w-1.5 sm:h-1.5 bg-white rounded-full"></div>
            </div>
          </div>
          <h3 className="text-xl sm:text-lg font-bold text-gray-900 mb-3">All Caught Up!</h3>
          <p className="text-gray-500 text-lg sm:text-base max-w-md mx-auto leading-relaxed">
            No new notifications right now. We'll let you know when something important happens.
          </p>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-4">
          {notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            const iconColor = getNotificationColor(notification.type);
            
            return (
              <div 
                key={notification._id} 
                className={`group relative overflow-hidden rounded-2xl p-6 sm:p-4 transition-all duration-300 hover:scale-[1.02] ${
                  notification.read 
                    ? 'border-2 border-gray-100 bg-white hover:shadow-lg' 
                    : 'border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 hover:shadow-xl shadow-md'
                }`}
              >
                {!notification.read && (
                  <div className="absolute top-0 right-0 w-16 h-16">
                    <div className="absolute transform rotate-45 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold py-1 right-[-35px] top-[32px] w-[170px] text-center shadow-sm">
                      NEW
                    </div>
                  </div>
                )}
                
                <div className="flex items-start space-x-5">
                  <div className={`relative p-4 rounded-2xl transition-all duration-300 ${
                    notification.read 
                      ? 'bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-gray-100 group-hover:to-gray-200' 
                      : 'bg-gradient-to-br from-white to-blue-50 shadow-sm ring-2 ring-blue-100'
                  }`}>
                    <Icon className={`w-6 h-6 ${iconColor} transition-transform duration-300 group-hover:scale-110`} />
                    {!notification.read && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full ring-2 ring-white"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className={`text-lg font-bold mb-2 transition-colors ${
                          notification.read ? 'text-gray-900' : 'text-blue-900'
                        }`}>
                          {notification.title}
                        </h3>
                        <p className={`text-base leading-relaxed transition-colors ${
                          notification.read ? 'text-gray-600' : 'text-blue-800'
                        }`}>
                          {notification.message}
                        </p>
                      </div>
                      
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkRead(notification._id)}
                          className="ml-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <p className="text-sm text-gray-500 font-medium">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                      {!notification.read && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          Unread
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Subtle animation line */}
                {!notification.read && (
                  <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 w-full"></div>
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

export default NotificationPanel;