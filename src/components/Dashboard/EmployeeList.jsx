import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Users, Edit, DollarSign, Phone, Mail, Circle, MessageCircle, CheckSquare, Calendar } from 'lucide-react';

const EmployeeList = ({ showAll = false, onChat }) => {
  const { currentUser, getUsersByRole, updateUser } = useAuth();
  const { getTasksByUser, getAttendanceByUser } = useData();
  const [editingSalary, setEditingSalary] = useState(null);
  const [newSalary, setNewSalary] = useState('');

  const employees = showAll
    ? getUsersByRole('employee')
    : getUsersByRole('employee').filter(emp => emp.createdBy === currentUser._id);

  const handleSalaryUpdate = (employeeId) => {
    if (newSalary && parseFloat(newSalary) > 0) {
      updateUser(employeeId, { salary: parseFloat(newSalary) });
      setEditingSalary(null);
      setNewSalary('');
    }
  };

  const startEditingSalary = (employee) => {
    setEditingSalary(employee.id);
    setNewSalary(employee.salary?.toString() || '');
  };

  return (
  <div className="bg-white rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl border border-gray-100 overflow-hidden mx-2 sm:mx-0">
    {/* Header Section */}
    <div className="p-3 sm:p-6 lg:p-8 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-100">
      <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-4 mb-3 sm:mb-6 space-y-3 sm:space-y-0">
        <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl shadow-lg">
          <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Employee Management
          </h2>
          <p className="text-gray-600 mt-1 text-xs sm:text-sm lg:text-base">Manage employee profiles, salaries, and monitor their activities</p>
        </div>
      </div>
    </div>

    <div className="p-3 sm:p-6 lg:p-8">
      {employees.length === 0 ? (
        <div className="text-center py-8 sm:py-12 lg:py-16">
          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Users className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-3">No Employees Yet</h3>
          <p className="text-gray-500 text-sm sm:text-base lg:text-lg px-4">Add your first employee to get started with team management.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {employees.map((employee) => {
            const employeeTasks = getTasksByUser(employee.id);
            const employeeAttendance = getAttendanceByUser(employee.id);
            const completedTasks = employeeTasks.filter(t => t.status === 'completed').length;
            
            return (
              <div key={employee.id} className="group bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1">
                {/* Employee Header */}
                <div className="flex items-start justify-between mb-4 sm:mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={employee.profilePicture}
                        alt={employee.name}
                        className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full border-2 sm:border-4 border-white shadow-lg object-cover"
                      />
                      <div className={`absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 rounded-full border-2 sm:border-3 border-white ${
                        employee.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      } shadow-lg`}></div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                        {employee.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                          employee.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                        }`}></div>
                        <span className={`text-xs sm:text-sm font-medium ${
                          employee.isOnline ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {employee.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-gray-50 rounded-lg sm:rounded-xl hover:bg-blue-50 transition-colors group/item">
                    <div className="p-1.5 sm:p-2 bg-white rounded-md sm:rounded-lg shadow-sm group-hover/item:bg-blue-100 transition-colors flex-shrink-0">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 group-hover/item:text-blue-600" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">{employee.email}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-gray-50 rounded-lg sm:rounded-xl hover:bg-green-50 transition-colors group/item">
                    <div className="p-1.5 sm:p-2 bg-white rounded-md sm:rounded-lg shadow-sm group-hover/item:bg-green-100 transition-colors flex-shrink-0">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 group-hover/item:text-green-600" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700">{employee.phone}</span>
                  </div>

                  {/* Salary Section */}
                  <div className="p-2 sm:p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg sm:rounded-xl border border-green-100">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="p-1.5 sm:p-2 bg-white rounded-md sm:rounded-lg shadow-sm flex-shrink-0">
                        <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                      </div>
                      {editingSalary === employee.id ? (
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <input
                            type="number"
                            value={newSalary}
                            onChange={(e) => setNewSalary(e.target.value)}
                            className="flex-1 min-w-0 px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md sm:rounded-lg focus:ring-1 sm:focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter salary"
                          />
                          <button
                            onClick={() => handleSalaryUpdate(employee.id)}
                            className="px-2 py-1.5 sm:px-3 sm:py-2 bg-green-500 text-white text-xs sm:text-sm rounded-md sm:rounded-lg hover:bg-green-600 transition-colors flex-shrink-0"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingSalary(null)}
                            className="px-2 py-1.5 sm:px-3 sm:py-2 bg-gray-400 text-white text-xs sm:text-sm rounded-md sm:rounded-lg hover:bg-gray-500 transition-colors flex-shrink-0"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between flex-1 min-w-0">
                          <span className="text-green-700 font-bold text-sm sm:text-base lg:text-lg truncate">
                            ₹{employee.salary?.toLocaleString() || 'Not Set'}
                          </span>
                          <button
                            onClick={() => startEditingSalary(employee)}
                            className="p-1.5 sm:p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-md sm:rounded-lg transition-all flex-shrink-0"
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg sm:rounded-xl border border-gray-100">
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
                    <div className="text-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-1 sm:mb-2 shadow-lg">
                        <span className="text-sm sm:text-base lg:text-xl font-bold text-white">{employeeTasks.length}</span>
                      </div>
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Tasks</div>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-1 sm:mb-2 shadow-lg">
                        <span className="text-sm sm:text-base lg:text-xl font-bold text-white">{completedTasks}</span>
                      </div>
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Done</div>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-1 sm:mb-2 shadow-lg">
                        <span className="text-sm sm:text-base lg:text-xl font-bold text-white">{employeeAttendance.length}</span>
                      </div>
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Attend</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <button 
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2.5 sm:px-4 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg sm:rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    onClick={onChat ? () => onChat(employee) : undefined}
                  >
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-semibold text-sm sm:text-base">Chat</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2.5 sm:px-4 sm:py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg sm:rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                    <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-semibold text-sm sm:text-base">Tasks</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
);
};

export default EmployeeList;