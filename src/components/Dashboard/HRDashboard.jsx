import React, { useState, useEffect } from 'react';
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
  LogOut,
} from 'lucide-react';
import { Bars3, XMark } from '@heroicons/react/24/outline'; // ✅ Updated here

const HRDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTarget, setChatTarget] = useState(null);
  const [employeeUsers, setEmployeeUsers] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // ✅ Needed

  const { currentUser, logout, getUsersByRole } = useAuth();
  const { getNotificationsByUser } = useData();

  useEffect(() => {
    setEmployeeUsers(getUsersByRole('employee'));
    setAdminUsers(getUsersByRole('admin'));
  }, [getUsersByRole]);

  useEffect(() => {
    if (chatOpen && !chatTarget) {
      if (employeeUsers.length > 0) {
        setChatTarget(employeeUsers[0]);
      } else if (adminUsers.length > 0) {
        setChatTarget(adminUsers[0]);
      }
    }
  }, [chatOpen, chatTarget, employeeUsers, adminUsers]);

  if (!currentUser) return <div className="p-10 text-center">Loading...</div>;

  const notifications = getNotificationsByUser(currentUser.id) || [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMessageEmployee = (employee) => {
    setChatTarget(employee);
    setChatOpen(true);
    setActiveTab('chat');
  };

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
    { id: 'profile', label: 'Profile', icon: Settings },
  ];

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
      case 'notifications':
        return <NotificationPanel />;
      case 'profile':
        return <ProfileSettings />;
      default:
        return <DashboardStats role="hr" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg shadow-lg border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16 lg:h-20">
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
              <div className="p-1.5 sm:p-2 lg:p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg sm:rounded-xl shadow-lg">
                <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-white rounded-md sm:rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xs sm:text-sm lg:text-lg">HR</span>
                </div>
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent truncate">
                  HR Dashboard
                </h1>
                <p className="text-slate-600 text-xs lg:text-sm hidden lg:block">Manage your workforce efficiently</p>
              </div>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
              <button
                onClick={() => setActiveTab('notifications')}
                className="relative p-2 sm:p-2.5 lg:p-3 bg-slate-100/80 hover:bg-blue-100 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-105 group"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-slate-600 group-hover:text-blue-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 flex items-center justify-center shadow-lg animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* User Info */}
              <div className="hidden md:flex items-center space-x-3 lg:space-x-4 bg-slate-100/80 rounded-lg lg:rounded-xl px-3 lg:px-4 py-2 shadow-md hover:shadow-lg transition-all duration-200">
                <div className="relative">
                  <img
                    src={currentUser.profilePicture || '/default-avatar.png'}
                    alt={currentUser.name || 'User Avatar'}
                    className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 border-white shadow-md object-cover"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 lg:-bottom-1 lg:-right-1 w-3 h-3 lg:w-4 lg:h-4 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div className="min-w-0">
                  <span className="text-sm lg:text-base font-semibold text-slate-800 truncate block max-w-24 lg:max-w-32">
                    {currentUser.name || 'User'}
                  </span>
                  <p className="text-xs text-slate-600 hidden lg:block">HR Manager</p>
                </div>
              </div>

              {/* Mobile Avatar */}
              <div className="md:hidden relative">
                <img
                  src={currentUser.profilePicture || '/default-avatar.png'}
                  alt={currentUser.name || 'User Avatar'}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white shadow-md object-cover"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>

              {/* Logout */}
              <button
                onClick={logout}
                className="hidden lg:flex items-center space-x-2 px-3 py-2 lg:px-4 lg:py-3 bg-slate-100/80 hover:bg-red-100 rounded-lg lg:rounded-xl transition-all duration-200 hover:scale-105 group"
              >
                <LogOut className="w-4 h-4 lg:w-5 lg:h-5 text-slate-600 group-hover:text-red-600" />
                <span className="font-medium text-slate-700 group-hover:text-red-600 text-sm">Logout</span>
              </button>

              {/* Mobile Menu */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 bg-slate-100/80 hover:bg-slate-200 rounded-lg transition-all duration-200"
              >
                <Bars3 className="w-5 h-5 text-slate-600" /> {/* ✅ Fixed */}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-80 max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-800">Menu</h3>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <XMark className="w-5 h-5 text-slate-600" /> {/* ✅ Fixed */}
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center space-x-3 mb-6 p-3 bg-slate-50 rounded-xl">
                <img
                  src={currentUser.profilePicture || '/default-avatar.png'}
                  alt={currentUser.name || 'User Avatar'}
                  className="w-12 h-12 rounded-full border-2 border-white shadow-md object-cover"
                />
                <div>
                  <p className="font-semibold text-slate-800">{currentUser.name || 'User'}</p>
                  <p className="text-sm text-slate-600">HR Manager</p>
                </div>
              </div>

              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard */}
      <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-8 py-2 sm:py-3 lg:py-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:gap-6">
          {/* Sidebar + Content */}
          <div className="hidden lg:block lg:w-80 flex-shrink-0">
            {/* Sidebar here (same as your original sidebar) */}
            {/* ... */}
          </div>

          <div className="flex-1 mb-20 lg:mb-0">
            <div className="bg-white/90 backdrop-blur-lg rounded-xl lg:rounded-2xl shadow-xl min-h-96 p-4 sm:p-6 lg:p-8 border border-slate-200/60">
              <div className="space-y-4 sm:space-y-6">
                {renderTabContent()}
                {activeTab === 'chat' && chatOpen && (
                  <div className="mt-6 border-t border-slate-200 pt-6">
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
    </div>
  );
};

export default HRDashboard;
