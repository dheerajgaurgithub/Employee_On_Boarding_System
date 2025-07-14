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
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {currentUser.name}!
        </h2>
        <p className="text-gray-600">
          Here's what's happening in your {role} dashboard today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-500 text-blue-50',
            green: 'bg-green-500 text-green-50',
            purple: 'bg-purple-500 text-purple-50',
            orange: 'bg-orange-500 text-orange-50',
            indigo: 'bg-indigo-500 text-indigo-50',
            emerald: 'bg-emerald-500 text-emerald-50'
          };

          return (
            <div key={index} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.subtitle}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {role === 'admin' && (
              <>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">System running smoothly with {getUsersByRole('hr').length} HR members active</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">All departments functioning normally</span>
                </div>
              </>
            )}
            {role === 'hr' && (
              <>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">Managing {getUsersByRole('employee').filter(emp => emp.createdBy === currentUser._id).length} employees</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-600">{getLeavesByApprover(currentUser._id).filter(l => l.status === 'pending').length} leave requests pending review</span>
                </div>
              </>
            )}
            {role === 'employee' && (
              <>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">{getTasksByUser(currentUser._id).filter(t => t.status === 'pending').length} tasks pending completion</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Attendance up to date</span>
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