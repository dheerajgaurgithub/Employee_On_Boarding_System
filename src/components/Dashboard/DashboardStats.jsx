import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { 
  Users, 
  CheckSquare, 
  Calendar, 
  FileText, 
  Clock,
  TrendingUp,
  Activity,
  DollarSign
} from 'lucide-react';

const DashboardStats = ({ role }) => {
  const { currentUser, getUsersByRole } = useAuth();
  const { 
    tasks, 
    leaveRequests, 
    meetings, 
    attendance,
    getTasksByUser,
    getTasksByAssigner,
    getLeavesByUser,
    getLeavesByApprover,
    getMeetingsByUser,
    getTodayAttendance,
    refresh,
    loading
  } = useData();

  // Refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, 30000);

    return () => clearInterval(interval);
  }, [refresh]);

  const getStatsForRole = () => {
    switch (role) {
      case 'admin':
        const hrUsers = getUsersByRole('hr');
        const employeeUsers = getUsersByRole('employee');
        const totalTasks = tasks.length;
        const pendingLeaves = leaveRequests.filter(l => l.status === 'pending').length;
        const totalMeetings = meetings.length;
        const onlineHRs = hrUsers.filter(hr => hr.isOnline).length;

        return [
          { 
            title: 'Total HRs', 
            value: hrUsers.length, 
            icon: Users, 
            color: 'blue',
            subtitle: `${onlineHRs} online`
          },
          { 
            title: 'Total Employees', 
            value: employeeUsers.length, 
            icon: Users, 
            color: 'green',
            subtitle: 'Across all departments'
          },
          { 
            title: 'Total Tasks', 
            value: totalTasks, 
            icon: CheckSquare, 
            color: 'purple',
            subtitle: 'System-wide tasks'
          },
          { 
            title: 'Pending Leaves', 
            value: pendingLeaves, 
            icon: FileText, 
            color: 'orange',
            subtitle: 'Awaiting approval'
          },
          { 
            title: 'Total Meetings', 
            value: totalMeetings, 
            icon: Calendar, 
            color: 'indigo',
            subtitle: 'Scheduled & completed'
          },
          {
            title: 'HR Salaries',
            value: `₹${hrUsers.reduce((sum, hr) => sum + (hr.salary || 0), 0).toLocaleString()}`,
            icon: DollarSign,
            color: 'emerald',
            subtitle: 'Total monthly cost'
          }
        ];

      case 'hr':
        const myEmployees = getUsersByRole('employee').filter(emp => emp.createdBy === currentUser._id);
        const myTasks = getTasksByAssigner(currentUser._id);
        const myLeaveRequests = getLeavesByApprover(currentUser._id);
        const myMeetings = getMeetingsByUser(currentUser._id);
        const pendingTasks = myTasks.filter(t => t.status === 'pending').length;
        const todayAttendance = getTodayAttendance();

        return [
          { 
            title: 'My Employees', 
            value: myEmployees.length, 
            icon: Users, 
            color: 'blue',
            subtitle: 'Under your management'
          },
          { 
            title: 'Tasks Assigned', 
            value: myTasks.length, 
            icon: CheckSquare, 
            color: 'purple',
            subtitle: `${pendingTasks} pending`
          },
          { 
            title: 'Leave Requests', 
            value: myLeaveRequests.length, 
            icon: FileText, 
            color: 'orange',
            subtitle: 'To review'
          },
          { 
            title: 'My Meetings', 
            value: myMeetings.length, 
            icon: Calendar, 
            color: 'indigo',
            subtitle: 'Scheduled & attended'
          },
          { 
            title: 'Today Attendance', 
            value: todayAttendance.length, 
            icon: Clock, 
            color: 'green',
            subtitle: 'Marked today'
          },
          {
            title: 'Employee Salaries',
            value: `₹${myEmployees.reduce((sum, emp) => sum + (emp.salary || 0), 0).toLocaleString()}`,
            icon: DollarSign,
            color: 'emerald',
            subtitle: 'Total monthly cost'
          }
        ];

      case 'employee':
        const myAssignedTasks = getTasksByUser(currentUser._id);
        const myLeaves = getLeavesByUser(currentUser._id);
        const myEmployeeMeetings = getMeetingsByUser(currentUser._id);
        const completedTasks = myAssignedTasks.filter(t => t.status === 'completed').length;
        const myAttendance = attendance.filter(a => a.employeeId._id === currentUser._id);

        return [
          { 
            title: 'My Tasks', 
            value: myAssignedTasks.length, 
            icon: CheckSquare, 
            color: 'blue',
            subtitle: `${completedTasks} completed`
          },
          { 
            title: 'Leave Requests', 
            value: myLeaves.length, 
            icon: FileText, 
            color: 'orange',
            subtitle: 'Applied leaves'
          },
          { 
            title: 'My Meetings', 
            value: myEmployeeMeetings.length, 
            icon: Calendar, 
            color: 'indigo',
            subtitle: 'To attend'
          },
          { 
            title: 'Attendance', 
            value: myAttendance.length, 
            icon: Clock, 
            color: 'green',
            subtitle: 'Days present'
          },
          {
            title: 'My Salary',
            value: `₹${(currentUser.salary || 0).toLocaleString()}`,
            icon: DollarSign,
            color: 'emerald',
            subtitle: 'Monthly salary'
          }
        ];

      default:
        return [];
    }
  };

  const stats = getStatsForRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
  <div className="px-4 sm:px-6">
    {/* Welcome Message */}
    <div className="mb-8">
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl px-4 py-5 sm:px-6 sm:py-6 border border-white/50 shadow-sm">
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2 sm:mb-3">
          Welcome back, {currentUser.name}! 👋
        </h2>
        <p className="text-gray-600 text-base sm:text-lg font-medium">
          Here's what's happening in your <span className="text-blue-600 font-semibold">{role}</span> dashboard today.
        </p>
      </div>
    </div>

    {/* Stats Section */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const colorClasses = {
          blue: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-200',
          green: 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-green-200',
          purple: 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-purple-200',
          orange: 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-orange-200',
          indigo: 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-indigo-200',
          emerald: 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-200'
        };

        return (
          <div
            key={index}
            className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-white/50 overflow-hidden"
          >
            <div className="px-4 py-5 sm:px-6 relative">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full -translate-y-10 translate-x-10 opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="flex items-center relative z-10">
                <div className={`p-4 rounded-2xl shadow-lg ${colorClasses[stat.color]} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">{stat.title}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 group-hover:text-blue-600 transition-colors">{stat.value}</p>
                  <p className="text-sm text-gray-600 mt-1 font-medium">{stat.subtitle}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>

    {/* Recent Activity */}
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="p-2 bg-blue-500 rounded-lg shadow-md">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Recent Activity</h3>
          <div className="flex-1"></div>
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
          <span className="text-sm text-gray-500 font-medium">Live</span>
        </div>
      </div>
      <div className="px-4 py-5 sm:px-6">
        <div className="space-y-4">
          {role === 'admin' && (
            <>
              <div className="flex flex-wrap items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-200">
                <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm animate-pulse"></div>
                <div className="flex-1 text-sm sm:text-base">
                  <span className="text-gray-700 font-medium">System running smoothly with</span>
                  <span className="text-blue-600 font-bold mx-1">{getUsersByRole('hr').length}</span>
                  <span className="text-gray-700 font-medium">HR members active</span>
                </div>
                <div className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">HEALTHY</div>
              </div>
              <div className="flex flex-wrap items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:shadow-md transition-all duration-200">
                <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                <div className="flex-1 text-sm sm:text-base">
                  <span className="text-gray-700 font-medium">All departments functioning normally</span>
                </div>
                <div className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">OPERATIONAL</div>
              </div>
            </>
          )}
          {role === 'hr' && (
            <>
              <div className="flex flex-wrap items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-200">
                <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
                <div className="flex-1 text-sm sm:text-base">
                  <span className="text-gray-700 font-medium">Managing</span>
                  <span className="text-blue-600 font-bold mx-1">{getUsersByRole('employee').filter(emp => emp.createdBy === currentUser._id).length}</span>
                  <span className="text-gray-700 font-medium">employees</span>
                </div>
                <div className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">MANAGING</div>
              </div>
              <div className="flex flex-wrap items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100 hover:shadow-md transition-all duration-200">
                <div className="w-3 h-3 bg-orange-500 rounded-full shadow-sm animate-pulse"></div>
                <div className="flex-1 text-sm sm:text-base">
                  <span className="text-orange-600 font-bold">{getLeavesByApprover(currentUser._id).filter(l => l.status === 'pending').length}</span>
                  <span className="text-gray-700 font-medium mx-1">leave requests pending review</span>
                </div>
                <div className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">PENDING</div>
              </div>
            </>
          )}
          {role === 'employee' && (
            <>
              <div className="flex flex-wrap items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-200">
                <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm animate-pulse"></div>
                <div className="flex-1 text-sm sm:text-base">
                  <span className="text-blue-600 font-bold">{getTasksByUser(currentUser._id).filter(t => t.status === 'pending').length}</span>
                  <span className="text-gray-700 font-medium mx-1">tasks pending completion</span>
                </div>
                <div className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">IN PROGRESS</div>
              </div>
              <div className="flex flex-wrap items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:shadow-md transition-all duration-200">
                <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                <div className="flex-1 text-sm sm:text-base">
                  <span className="text-gray-700 font-medium">Attendance up to date</span>
                </div>
                <div className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">UP TO DATE</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  </div>
);
};

export default DashboardStats;