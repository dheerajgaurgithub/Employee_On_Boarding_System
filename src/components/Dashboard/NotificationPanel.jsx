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
    <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* Header Section */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 p-6 sm:p-8">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative flex items-center space-x-4">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl ring-1 ring-white/30">
            <Bell className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Notifications
            </h2>
            <p className="text-indigo-100 mt-1 text-sm sm:text-base font-medium">
              Stay updated with your latest activities
            </p>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Content Section */}
      <div className="p-6 sm:p-8 bg-gradient-to-b from-gray-50/50 to-white">
        {notifications.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-indigo-100 via-purple-100 to-blue-100 rounded-full flex items-center justify-center shadow-lg">
                <Bell className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-500" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
              All Caught Up!
            </h3>
            <p className="text-gray-500 text-base sm:text-lg max-w-sm mx-auto leading-relaxed">
              No new notifications right now. We'll notify you when something important happens.
            </p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const iconColor = getNotificationColor(notification.type);
              
              return (
                <div 
                  key={notification._id} 
                  className={`group relative overflow-hidden rounded-2xl transition-all duration-300 transform hover:-translate-y-1 ${
                    notification.read 
                      ? 'bg-white border-2 border-gray-100 hover:shadow-xl hover:border-gray-200' 
                      : 'bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-indigo-200 shadow-md hover:shadow-2xl hover:border-indigo-300'
                  }`}
                >
                  {/* New Badge */}
                  {!notification.read && (
                    <div className="absolute top-0 right-0 overflow-hidden">
                      <div className="absolute top-4 right-[-28px] bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold py-1 px-8 transform rotate-45 shadow-lg">
                        NEW
                      </div>
                    </div>
                  )}
                  
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start space-x-4">
                      {/* Icon Section */}
                      <div className={`relative flex-shrink-0 p-3 rounded-2xl transition-all duration-300 ${
                        notification.read 
                          ? 'bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-gray-200 group-hover:to-gray-300' 
                          : 'bg-gradient-to-br from-white to-blue-100 shadow-lg ring-2 ring-blue-200/50'
                      }`}>
                        <Icon className={`w-6 h-6 ${iconColor} transition-transform duration-300 group-hover:scale-110`} />
                        {!notification.read && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full ring-2 ring-white shadow-sm"></div>
                        )}
                      </div>
                      
                      {/* Content Section */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 pr-4">
                            <h3 className={`text-lg font-bold mb-2 transition-colors ${
                              notification.read ? 'text-gray-800' : 'text-indigo-900'
                            }`}>
                              {notification.title}
                            </h3>
                            <p className={`text-sm leading-relaxed transition-colors ${
                              notification.read ? 'text-gray-600' : 'text-indigo-700'
                            }`}>
                              {notification.message}
                            </p>
                          </div>
                          
                          {/* Mark Read Button */}
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkRead(notification._id)}
                              className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform active:scale-95"
                            >
                              Mark Read
                            </button>
                          )}
                        </div>
                        
                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500 font-medium">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                          {!notification.read && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                              Unread
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom Accent Line */}
                  {!notification.read && (
                    <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500"></div>
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