import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import DashboardStats from './DashboardStats';
import AddEmployeeForm from './AddEmployeeForm';
import EmployeeList from './EmployeeList';
import TaskManagement from './TaskManagement';
import LeaveManagement from './LeaveManagement';
import MeetingScheduler from './MeetingScheduler';
import AttendanceTracker from './AttendanceTracker';
import ChatSystem from './ChatSystem';
import ProfileSettings from './ProfileSettings';
import NotificationPanel from './NotificationPanel';
import { 
  Users, 
  UserPlus, 
  CheckSquare, 
  Calendar, 
  FileText, 
  Clock,
  MessageCircle,
  Settings,
  Bell,
  LogOut
} from 'lucide-react';

const HRDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { currentUser, logout } = useAuth();
  const { getNotificationsByUser } = useData();

  const notifications = getNotificationsByUser(currentUser.id);
  const unreadCount = notifications.filter(n => !n.read).length;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Users },
    { id: 'add-employee', label: 'Add Employee', icon: UserPlus },
    { id: 'employees', label: 'Employee Management', icon: Users },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'meetings', label: 'Meetings', icon: Calendar },
    { id: 'leaves', label: 'Leave Requests', icon: FileText },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: Settings }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardStats role="hr" />;
      case 'add-employee':
        return <AddEmployeeForm />;
      case 'employees':
        return <EmployeeList />;
      case 'tasks':
        return <TaskManagement role="hr" />;
      case 'attendance':
        return <AttendanceTracker />;
      case 'meetings':
        return <MeetingScheduler role="hr" />;
      case 'leaves':
        return <LeaveManagement role="hr" />;
      case 'chat':
        return <ChatSystem />;
      case 'notifications':
        return <NotificationPanel />;
      case 'profile':
        return <ProfileSettings />;
      default:
        return <DashboardStats role="hr" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">HR Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab('notifications')}
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <div className="flex items-center space-x-3">
                <img
                  src={currentUser.profilePicture}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium text-gray-700">{currentUser.name}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="bg-white rounded-lg shadow p-4">
              <ul className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{tab.label}</span>
                        {tab.id === 'notifications' && unreadCount > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;