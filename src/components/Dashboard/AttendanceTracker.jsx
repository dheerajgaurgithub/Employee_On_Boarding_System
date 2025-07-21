import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Clock, CheckCircle, XCircle, AlertCircle, Calendar, User } from 'lucide-react';

const AttendanceTracker = () => {
  const { currentUser, getUsersByRole, getUserById } = useAuth();
  const { addAttendance, getAttendanceByUser, getTodayAttendance } = useData();
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState('present');
  const [checkInTime, setCheckInTime] = useState('');

  const employees = getUsersByRole('employee').filter(emp => emp.createdBy === currentUser._id);
  const todayAttendance = getTodayAttendance();

  const handleMarkAttendance = (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    const employee = getUserById(selectedEmployee);
    if (!employee) return;

    // Check if attendance already marked for today
    const today = new Date().toDateString();
    const alreadyMarked = todayAttendance.some(
      a => a.employeeId === selectedEmployee && new Date(a.date).toDateString() === today
    );

    if (alreadyMarked) {
      alert('Attendance already marked for this employee today!');
      return;
    }

    addAttendance({
      employeeId: selectedEmployee,
      employeeName: employee.name,
      status: attendanceStatus,
      checkInTime: attendanceStatus === 'present' ? checkInTime : undefined,
      markedBy: currentUser._id
    });

    // Reset form
    setSelectedEmployee('');
    setAttendanceStatus('present');
    setCheckInTime('');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'late':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg sm:rounded-xl shadow-xl border border-slate-200">
      <div className="p-4 sm:p-6 lg:p-8 border-b border-slate-200 bg-white rounded-t-lg sm:rounded-t-xl">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800">Attendance Tracker</h2>
            <p className="text-slate-600 mt-1 text-sm sm:text-base lg:text-lg">Mark and track employee attendance</p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        {/* Mark Attendance Form */}
        <div className="mb-6 sm:mb-8 lg:mb-10 p-4 sm:p-6 border-2 border-blue-200 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm hover:shadow-md transition-shadow duration-300">
          <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-slate-800 flex items-center">
            <div className="w-2 h-6 sm:h-8 bg-blue-500 rounded-full mr-2 sm:mr-3"></div>
            Mark Attendance
          </h3>
          <form onSubmit={handleMarkAttendance} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select Employee *
                </label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-slate-300 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                  required
                >
                  <option value="">Choose Employee</option>
                  {employees.map(employee => (
                    <option key={employee._id} value={employee._id}>{employee.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Status *
                </label>
                <select
                  value={attendanceStatus}
                  onChange={(e) => setAttendanceStatus(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-slate-300 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                </select>
              </div>

              {attendanceStatus === 'present' && (
                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Check-in Time
                  </label>
                  <input
                    type="time"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-slate-300 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                  />
                </div>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Mark Attendance
            </button>
          </form>
        </div>

        {/* Today's Attendance */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 text-slate-800 flex items-center">
            <div className="w-2 h-6 sm:h-8 bg-emerald-500 rounded-full mr-2 sm:mr-3"></div>
            <span className="truncate">Today's Attendance</span>
          </h3>
          <div className="text-xs sm:text-sm text-slate-600 mb-4 sm:mb-6">
            {new Date().toLocaleDateString()}
          </div>
          {todayAttendance.length === 0 ? (
            <div className="text-center py-8 sm:py-12 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg sm:rounded-xl border-2 border-dashed border-slate-300">
              <div className="p-3 sm:p-4 bg-slate-200 rounded-full w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                <Clock className="w-8 h-8 sm:w-12 sm:h-12 text-slate-500" />
              </div>
              <h4 className="text-lg sm:text-xl font-semibold text-slate-800 mb-2 sm:mb-3">No Attendance Marked</h4>
              <p className="text-slate-600 text-sm sm:text-base lg:text-lg px-4">Start marking attendance for your employees.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {todayAttendance.map((attendance) => (
                <div key={attendance.id} className="border-2 border-slate-200 rounded-lg sm:rounded-xl p-4 sm:p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h4 className="font-bold text-slate-900 text-base sm:text-lg truncate mr-2">{attendance.employeeName}</h4>
                    <div className="p-1.5 sm:p-2 rounded-full bg-slate-100 flex-shrink-0">
                      {getStatusIcon(attendance.status)}
                    </div>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <span className={`inline-block px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-bold rounded-full ${getStatusColor(attendance.status)} shadow-sm`}>
                      {attendance.status.toUpperCase()}
                    </span>
                    {attendance.checkInTime && (
                      <div className="text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
                        Check-in: {attendance.checkInTime}
                      </div>
                    )}
                    <div className="text-xs text-slate-500 bg-slate-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
                      Marked at: {new Date(attendance.date).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Employee Attendance History */}
        <div>
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 text-slate-800 flex items-center">
            <div className="w-2 h-6 sm:h-8 bg-purple-500 rounded-full mr-2 sm:mr-3"></div>
            <span className="truncate">Employee Summary</span>
          </h3>
          {employees.length === 0 ? (
            <div className="text-center py-8 sm:py-12 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg sm:rounded-xl border-2 border-dashed border-slate-300">
              <div className="p-3 sm:p-4 bg-slate-200 rounded-full w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                <User className="w-8 h-8 sm:w-12 sm:h-12 text-slate-500" />
              </div>
              <h4 className="text-lg sm:text-xl font-semibold text-slate-800 mb-2 sm:mb-3">No Employees</h4>
              <p className="text-slate-600 text-sm sm:text-base lg:text-lg px-4">Add employees to track their attendance.</p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {employees.map((employee) => {
                const employeeAttendance = getAttendanceByUser(employee._id);
                const presentDays = employeeAttendance.filter(a => a.status === 'present').length;
                const lateDays = employeeAttendance.filter(a => a.status === 'late').length;
                const absentDays = employeeAttendance.filter(a => a.status === 'absent').length;
                
                return (
                  <div key={employee._id} className="border-2 border-slate-200 rounded-lg sm:rounded-xl p-4 sm:p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 lg:space-x-6 mb-4 sm:mb-6">
                      <div className="relative mx-auto sm:mx-0">
                        <img
                          src={employee.profilePicture}
                          alt={employee.name}
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-blue-200 shadow-md"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="text-center sm:text-left">
                        <h4 className="font-bold text-slate-900 text-lg sm:text-xl">{employee.name}</h4>
                        <p className="text-xs sm:text-sm font-medium text-slate-600 bg-slate-100 px-2 sm:px-3 py-1 rounded-full inline-block mt-1">
                          Total Records: {employeeAttendance.length}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                      <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg sm:rounded-xl border-2 border-green-200">
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 mb-1 sm:mb-2">{presentDays}</div>
                        <div className="text-xs sm:text-sm font-semibold text-green-700">Present</div>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg sm:rounded-xl border-2 border-yellow-200">
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-600 mb-1 sm:mb-2">{lateDays}</div>
                        <div className="text-xs sm:text-sm font-semibold text-yellow-700">Late</div>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg sm:rounded-xl border-2 border-red-200">
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600 mb-1 sm:mb-2">{absentDays}</div>
                        <div className="text-xs sm:text-sm font-semibold text-red-700">Absent</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracker;