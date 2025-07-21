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
  <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
    {/* Header Section */}
    <div className="p-8 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-100">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
          <Users className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Employee Management
          </h2>
          <p className="text-gray-600 mt-2 text-lg">Manage employee profiles, salaries, and monitor their activities</p>
        </div>
      </div>
    </div>

    <div className="p-8">
      {employees.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">No Employees Yet</h3>
          <p className="text-gray-500 text-lg">Add your first employee to get started with team management.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {employees.map((employee) => {
            const employeeTasks = getTasksByUser(employee.id);
            const employeeAttendance = getAttendanceByUser(employee.id);
            const completedTasks = employeeTasks.filter(t => t.status === 'completed').length;
            
            return (
              <div key={employee.id} className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1">
                {/* Employee Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={employee.profilePicture}
                        alt={employee.name}
                        className="w-16 h-16 rounded-full border-4 border-white shadow-lg object-cover"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-3 border-white ${
                        employee.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      } shadow-lg`}></div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {employee.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${
                          employee.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                        }`}></div>
                        <span className={`text-sm font-medium ${
                          employee.isOnline ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {employee.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group/item">
                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover/item:bg-blue-100 transition-colors">
                      <Mail className="w-4 h-4 text-gray-600 group-hover/item:text-blue-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{employee.email}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-green-50 transition-colors group/item">
                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover/item:bg-green-100 transition-colors">
                      <Phone className="w-4 h-4 text-gray-600 group-hover/item:text-green-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{employee.phone}</span>
                  </div>

                  {/* Salary Section */}
                  <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <DollarSign className="w-4 h-4 text-green-600" />
                      </div>
                      {editingSalary === employee.id ? (
                        <div className="flex items-center space-x-2 flex-1">
                          <input
                            type="number"
                            value={newSalary}
                            onChange={(e) => setNewSalary(e.target.value)}
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter salary"
                          />
                          <button
                            onClick={() => handleSalaryUpdate(employee.id)}
                            className="px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingSalary(null)}
                            className="px-3 py-2 bg-gray-400 text-white text-sm rounded-lg hover:bg-gray-500 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between flex-1">
                          <span className="text-green-700 font-bold text-lg">
                            ₹{employee.salary?.toLocaleString() || 'Not Set'}
                          </span>
                          <button
                            onClick={() => startEditingSalary(employee)}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg">
                        <span className="text-xl font-bold text-white">{employeeTasks.length}</span>
                      </div>
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total Tasks</div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg">
                        <span className="text-xl font-bold text-white">{completedTasks}</span>
                      </div>
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg">
                        <span className="text-xl font-bold text-white">{employeeAttendance.length}</span>
                      </div>
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Attendance</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button 
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    onClick={onChat ? () => onChat(employee) : undefined}
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-semibold">Chat</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                    <CheckSquare className="w-5 h-5" />
                    <span className="font-semibold">Tasks</span>
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