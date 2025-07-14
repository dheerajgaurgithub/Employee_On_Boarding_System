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
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Clock className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Attendance Tracker</h2>
        </div>
        <p className="text-gray-600 mt-1">Mark and track employee attendance</p>
      </div>

      <div className="p-6">
        {/* Mark Attendance Form */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Mark Attendance</h3>
          <form onSubmit={handleMarkAttendance} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Employee *
                </label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose Employee</option>
                  {employees.map(employee => (
                    <option key={employee._id} value={employee._id}>{employee.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  value={attendanceStatus}
                  onChange={(e) => setAttendanceStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                </select>
              </div>

              {attendanceStatus === 'present' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in Time
                  </label>
                  <input
                    type="time"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
            
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Mark Attendance
            </button>
          </form>
        </div>

        {/* Today's Attendance */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Today's Attendance ({new Date().toLocaleDateString()})</h3>
          {todayAttendance.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Attendance Marked</h4>
              <p className="text-gray-600">Start marking attendance for your employees.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayAttendance.map((attendance) => (
                <div key={attendance.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{attendance.employeeName}</h4>
                    {getStatusIcon(attendance.status)}
                  </div>
                  <div className="space-y-2">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(attendance.status)}`}>
                      {attendance.status.toUpperCase()}
                    </span>
                    {attendance.checkInTime && (
                      <div className="text-sm text-gray-600">
                        Check-in: {attendance.checkInTime}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
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
          <h3 className="text-lg font-semibold mb-4">Employee Attendance Summary</h3>
          {employees.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Employees</h4>
              <p className="text-gray-600">Add employees to track their attendance.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {employees.map((employee) => {
                const employeeAttendance = getAttendanceByUser(employee._id);
                const presentDays = employeeAttendance.filter(a => a.status === 'present').length;
                const lateDays = employeeAttendance.filter(a => a.status === 'late').length;
                const absentDays = employeeAttendance.filter(a => a.status === 'absent').length;
                
                return (
                  <div key={employee._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-4 mb-3">
                      <img
                        src={employee.profilePicture}
                        alt={employee.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900">{employee.name}</h4>
                        <p className="text-sm text-gray-600">Total Records: {employeeAttendance.length}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-green-600">{presentDays}</div>
                        <div className="text-xs text-gray-600">Present</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-yellow-600">{lateDays}</div>
                        <div className="text-xs text-gray-600">Late</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-red-600">{absentDays}</div>
                        <div className="text-xs text-gray-600">Absent</div>
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