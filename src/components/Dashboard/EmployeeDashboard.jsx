import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import DashboardStats from './DashboardStats';
import TaskManagement from './TaskManagement';
import LeaveManagement from './LeaveManagement';
import MeetingScheduler from './MeetingScheduler';
import ProfileSettings from './ProfileSettings';
import NotificationPanel from './NotificationPanel';
import { 
  CheckSquare, 
  Calendar, 
  FileText, 
  Settings,
  Bell,
  LogOut,
  Activity,
  MessageCircle
} from 'lucide-react';
import ChatSystem from './ChatSystem';

const EmployeeDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTarget, setChatTarget] = useState(null);
  const { currentUser, logout } = useAuth();
  const { getNotificationsByUser } = useData();
  const { getUsersByRole } = useAuth();
  const hrUsers = getUsersByRole('hr');

  // Auto-select first HR as chat target when opening chat tab
  React.useEffect(() => {
    if (chatOpen && !chatTarget && hrUsers.length > 0) {
      setChatTarget(hrUsers[0]);
    }
  }, [chatOpen, chatTarget, hrUsers]);
  const notifications = getNotificationsByUser(currentUser.id);
  const unreadCount = notifications.filter(n => !n.read).length;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'tasks', label: 'My Tasks', icon: CheckSquare },
    { id: 'meetings', label: 'Meetings', icon: Calendar },
    { id: 'leaves', label: 'Leave Requests', icon: FileText },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: Settings }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardStats role="employee" />;
      case 'tasks':
        return <TaskManagement role="employee" />;
      case 'meetings':
        return <MeetingScheduler role="employee" />;
      case 'leaves':
        return <LeaveManagement role="employee" />;
      case 'chat':
        return <ChatSystem chatRole="employee" />;
      case 'notifications':
        return <NotificationPanel />;
      case 'profile':
        return <ProfileSettings />;
      default:
        return <DashboardStats role="employee" />;
    }
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    {/* Header */}
    <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Employee Dashboard
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveTab('notifications')}
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200 group"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-4.5-4.5M9 17H4l4.5-4.5M12 3v0a7 7 0 017 7v4l2 2H3l2-2v-4a7 7 0 017-7z"/>
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
            
            <div className="relative group">
              <button className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg transition-all duration-200 border border-blue-200">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="text-gray-800 font-medium">{currentUser.name}</span>
                <svg className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <button className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (tab.id === 'chat') {
                        setChatOpen(true);
                      }
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 group ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-blue-700 hover:shadow-md'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${
                      activeTab === tab.id 
                        ? 'text-white' 
                        : 'text-gray-500 group-hover:text-blue-600'
                    } transition-colors`} />
                    <span className="font-medium">{tab.label}</span>
                    {tab.id === 'notifications' && unreadCount > 0 && (
                      <span className={`ml-auto inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full ${
                        activeTab === tab.id
                          ? 'bg-white bg-opacity-20 text-white'
                          : 'bg-red-500 text-white'
                      }`}>
                        {unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 min-h-[600px]">
            <div className="p-6">
              {renderTabContent()}
            </div>
          </div>
        </main>
      </div>
    </div>

    {chatOpen && (
      <ChatComponent
        onClose={() => setChatOpen(false)}
      />
    )}
  </div>
);
};

export default EmployeeDashboard;