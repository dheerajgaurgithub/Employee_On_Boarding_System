import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import DashboardStats from './DashboardStats';
import AddHRForm from './AddHRForm';
import HRList from './HRList';
import TaskManagement from './TaskManagement';
import LeaveManagement from './LeaveManagement';
import MeetingScheduler from './MeetingScheduler';
import ProfileSettings from './ProfileSettings';
import NotificationPanel from './NotificationPanel';
import EmployeeList from './EmployeeList';
import ChatSystem from './ChatSystem';
import { 
  Users, 
  UserPlus, 
  CheckSquare, 
  Calendar, 
  FileText, 
  Settings,
  Bell,
  LogOut,
  MessageCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { currentUser, logout, getUsersByRole } = useAuth();
  const { getNotificationsByUser } = useData();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTarget, setChatTarget] = useState(null);
  const hrUsers = getUsersByRole('hr');
  const notifications = getNotificationsByUser(currentUser.id);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Auto-select first HR as chat target when opening chat tab
  useEffect(() => {
    if (chatOpen && !chatTarget && hrUsers.length > 0) {
      setChatTarget(hrUsers[0]);
    }
  }, [chatOpen, chatTarget, hrUsers]);
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Users },
    { id: 'add-hr', label: 'Add HR', icon: UserPlus },
    { id: 'hr-list', label: 'HR Management', icon: Users },
    { id: 'employees', label: 'Employee Management', icon: Users },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'meetings', label: 'Meetings', icon: Calendar },
    { id: 'leaves', label: 'Leave Requests', icon: FileText },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: Settings }
  ];

  const handleMessageHR = (hr) => {
    setChatTarget(hr);
    setChatOpen(true);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardStats role="admin" />;
      case 'add-hr':
        return <AddHRForm />;
      case 'hr-list':
        return <HRList onMessageHR={handleMessageHR} />;
      case 'employees':
        return <EmployeeList showAll={true} />;
      case 'tasks':
        return <TaskManagement role="admin" />;
      case 'meetings':
        return <MeetingScheduler role="admin" />;
      case 'leaves':
        return <LeaveManagement role="admin" />;
      case 'chat':
        return <ChatSystem chatRole="admin" />;
      case 'notifications':
        return <NotificationPanel />;
      case 'profile':
        return <ProfileSettings />;
      default:
        return <DashboardStats role="admin" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg mr-3 flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab('notifications')}
                className="relative p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 group"
              >
                <Bell className="w-6 h-6 group-hover:scale-110 transition-transform" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse shadow-lg">
                    {unreadCount}
                  </span>
                )}
              </button>
              <div className="flex items-center space-x-3 bg-gray-50 rounded-xl px-4 py-2">
                <div className="relative">
                  <img
                    src={currentUser.profilePicture}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full ring-2 ring-blue-100 object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <span className="text-sm font-semibold text-gray-700">{currentUser.name}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl transition-all duration-200 group"
              >
                <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Sidebar */}
          <div className="lg:w-72 w-full mb-4 lg:mb-0">
            <nav className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 sticky top-24">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Navigation</h2>
                <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
              </div>
              <ul className="space-y-3">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <li key={tab.id}>
                      <button
                        onClick={() => {
                          setActiveTab(tab.id);
                          if (tab.id === 'chat') {
                            setChatOpen(true);
                          }
                        }}
                        className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl text-left transition-all duration-300 group relative overflow-hidden ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105'
                            : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 hover:scale-102'
                        }`}
                      >
                        {activeTab === tab.id && (
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90 rounded-xl"></div>
                        )}
                        <div className="relative z-10 flex items-center space-x-4 w-full">
                          <Icon className={`w-5 h-5 transition-all duration-200 ${
                            activeTab === tab.id ? 'text-white' : 'group-hover:scale-110'
                          }`} />
                          <span className="font-medium flex-1">{tab.label}</span>
                          {tab.id === 'notifications' && unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-md">
                              {unreadCount}
                            </span>
                          )}
                          {activeTab === tab.id && (
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 w-full">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 min-h-96 overflow-hidden">
              <div className="p-4 sm:p-8">
                {renderTabContent()}
              </div>
            </div>
            {chatOpen && (
              <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl border border-white/20 max-w-4xl w-full max-h-[80vh] overflow-hidden">
                  <ChatSystem
                    chatRole="admin"
                    initialTarget={chatTarget}
                    onClose={() => setChatOpen(false)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;