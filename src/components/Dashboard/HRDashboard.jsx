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
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTarget, setChatTarget] = useState(null);
  const { getUsersByRole } = useAuth();
  const employeeUsers = getUsersByRole('employee');
  const adminUsers = getUsersByRole('admin');

  // Auto-select first employee or admin as chat target when opening chat tab
  React.useEffect(() => {
    if (chatOpen && !chatTarget) {
      if (employeeUsers.length > 0) {
        setChatTarget(employeeUsers[0]);
      } else if (adminUsers.length > 0) {
        setChatTarget(adminUsers[0]);
      }
    }
  }, [chatOpen, chatTarget, employeeUsers, adminUsers]);
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

  const handleMessageEmployee = (employee) => {
    setChatTarget(employee);
    setChatOpen(true);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardStats role="hr" />;
      case 'add-employee':
        return <AddEmployeeForm />;
      case 'employees':
        return <EmployeeList onChat={handleMessageEmployee} />;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">HR</span>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  HR Dashboard
                </h1>
                <p className="text-slate-600 text-sm">Manage your workforce efficiently</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setActiveTab('notifications')}
                className="relative p-3 bg-slate-100 hover:bg-blue-100 rounded-xl transition-all duration-200 hover:scale-110 group"
              >
                <Bell className="w-6 h-6 text-slate-600 group-hover:text-blue-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              <div className="flex items-center space-x-4 bg-slate-100 rounded-xl px-4 py-2 shadow-md hover:shadow-lg transition-shadow duration-200">
                <div className="relative">
                  <img
                    src={currentUser.profilePicture}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-800">{currentUser.name}</span>
                  <p className="text-xs text-slate-600">HR Manager</p>
                </div>
              </div>
              
              <button
                onClick={logout}
                className="flex items-center space-x-3 px-4 py-3 bg-slate-100 hover:bg-red-100 rounded-xl transition-all duration-200 hover:scale-105 group"
              >
                <LogOut className="w-5 h-5 text-slate-600 group-hover:text-red-600" />
                <span className="font-medium text-slate-700 group-hover:text-red-600">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-72">
            <nav className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-slate-200">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-800 mb-2">Navigation</h2>
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
                        className={`w-full flex items-center space-x-4 px-4 py-4 rounded-xl text-left transition-all duration-200 group ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105'
                            : 'text-slate-700 hover:bg-slate-100 hover:scale-102'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          activeTab === tab.id 
                            ? 'bg-white/20' 
                            : 'bg-slate-200 group-hover:bg-blue-100'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            activeTab === tab.id 
                              ? 'text-white' 
                              : 'text-slate-600 group-hover:text-blue-600'
                          }`} />
                        </div>
                        <span className="font-semibold">{tab.label}</span>
                        {tab.id === 'notifications' && unreadCount > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-md">
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
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 min-h-[600px]">
              {activeTab !== 'chat' && (
                <div className="p-8">
                  {renderTabContent()}
                </div>
              )}
              {activeTab === 'chat' && chatOpen && (
                <div className="p-6">
                  <ChatSystem
                    chatRole="hr"
                    initialTarget={chatTarget}
                    onClose={() => setChatOpen(false)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;