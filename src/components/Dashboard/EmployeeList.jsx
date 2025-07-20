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
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Employee Management</h2>
        </div>
        <p className="text-gray-600 mt-1">Manage employee profiles, salaries, and monitor their activities</p>
      </div>

      <div className="p-6">
        {employees.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Employees Yet</h3>
            <p className="text-gray-600">Add your first employee to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map((employee) => {
              const employeeTasks = getTasksByUser(employee.id);
              const employeeAttendance = getAttendanceByUser(employee.id);
              const completedTasks = employeeTasks.filter(t => t.status === 'completed').length;
              
              return (
                <div key={employee.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={employee.profilePicture}
                        alt={employee.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                        <div className="flex items-center space-x-2">
                          <Circle
                            className={`w-3 h-3 ${
                              employee.isOnline ? 'text-green-500 fill-current' : 'text-gray-400'
                            }`}
                          />
                          <span className={`text-sm ${
                            employee.isOnline ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            {employee.isOnline ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{employee.email}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{employee.phone}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      {editingSalary === employee.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={newSalary}
                            onChange={(e) => setNewSalary(e.target.value)}
                            className="w-24 px-2 py-1 text-sm border border-gray-300 rounded"
                            placeholder="Salary"
                          />
                          <button
                            onClick={() => handleSalaryUpdate(employee.id)}
                            className="text-green-600 hover:text-green-700 text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingSalary(null)}
                            className="text-gray-500 hover:text-gray-600 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="text-green-600 font-medium">
                            ₹{employee.salary?.toLocaleString() || 'Not Set'}
                          </span>
                          <button
                            onClick={() => startEditingSalary(employee)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-blue-600">{employeeTasks.length}</div>
                        <div className="text-xs text-gray-600">Total Tasks</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-green-600">{completedTasks}</div>
                        <div className="text-xs text-gray-600">Completed</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-purple-600">{employeeAttendance.length}</div>
                        <div className="text-xs text-gray-600">Attendance</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                      onClick={onChat ? () => onChat(employee) : undefined}>
                      <MessageCircle className="w-4 h-4" />
                      <span>Chat</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
                      <CheckSquare className="w-4 h-4" />
                      <span>Tasks</span>
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