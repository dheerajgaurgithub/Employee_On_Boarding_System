import React, { useEffect, useState } from "react";
import axios from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";

const TaskManagement = () => {
  const { currentUser, token } = useAuth();
  const { getUsersByRole } = useData();

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "medium",
    dueDate: "",
  });

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editValues, setEditValues] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
  });

  // Fetch all tasks on load
  useEffect(() => {
    fetchTasks();
    if (currentUser?.role === "hr" || currentUser?.role === "admin") {
      fetchUsers();
    }
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get("/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTasks(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const employeeUsers = await getUsersByRole("employee");
      setUsers(employeeUsers);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch users");
    }
  };

  const handleInputChange = (e) => {
    setNewTask({ ...newTask, [e.target.name]: e.target.value });
  };

  const handleEditInputChange = (e) => {
    setEditValues({ ...editValues, [e.target.name]: e.target.value });
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/tasks", newTask, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNewTask({
        title: "",
        description: "",
        assignedTo: "",
        priority: "medium",
        dueDate: "",
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
      setError("Failed to create task");
    }
  };

  const handleEditTask = (task) => {
    setEditingTaskId(task._id);
    setEditValues({
      title: task.title,
      description: task.description,
      priority: task.priority || "medium",
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
    });
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/tasks/${editingTaskId}`, editValues, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEditingTaskId(null);
      fetchTasks();
    } catch (err) {
      console.error(err);
      setError("Failed to update task");
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await axios.delete(`/tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
      setError("Failed to delete task");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(
        `/tasks/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchTasks();
    } catch (err) {
      console.error(err);
      setError("Failed to update status");
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Task Management</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}

      {/* Form */}
      {(currentUser?.role === "hr" || currentUser?.role === "admin") && (
        <form
          onSubmit={handleCreateTask}
          className="grid gap-3 grid-cols-1 md:grid-cols-2 mb-6"
        >
          <input
            name="title"
            value={newTask.title}
            onChange={handleInputChange}
            placeholder="Title"
            className="border p-2 rounded"
            required
          />
          <input
            name="description"
            value={newTask.description}
            onChange={handleInputChange}
            placeholder="Description"
            className="border p-2 rounded"
            required
          />
          <select
            name="assignedTo"
            value={newTask.assignedTo}
            onChange={handleInputChange}
            className="border p-2 rounded"
            required
          >
            <option value="">Assign To</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          <select
            name="priority"
            value={newTask.priority}
            onChange={handleInputChange}
            className="border p-2 rounded"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input
            name="dueDate"
            type="date"
            value={newTask.dueDate}
            onChange={handleInputChange}
            className="border p-2 rounded"
          />
          <button type="submit" className="bg-blue-600 text-white p-2 rounded col-span-full">
            Create Task
          </button>
        </form>
      )}

      {/* Task list */}
      {loading ? (
        <p>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p>No tasks found</p>
      ) : (
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li key={task._id} className="border p-4 rounded shadow">
              {editingTaskId === task._id ? (
                <form onSubmit={handleUpdateTask} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    name="title"
                    value={editValues.title}
                    onChange={handleEditInputChange}
                    className="border p-2 rounded"
                    required
                  />
                  <input
                    name="description"
                    value={editValues.description}
                    onChange={handleEditInputChange}
                    className="border p-2 rounded"
                    required
                  />
                  <select
                    name="priority"
                    value={editValues.priority}
                    onChange={handleEditInputChange}
                    className="border p-2 rounded"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <input
                    type="date"
                    name="dueDate"
                    value={editValues.dueDate}
                    onChange={handleEditInputChange}
                    className="border p-2 rounded"
                  />
                  <div className="col-span-full flex gap-2">
                    <button className="bg-green-600 text-white px-3 py-1 rounded" type="submit">
                      Save
                    </button>
                    <button
                      type="button"
                      className="bg-gray-500 text-white px-3 py-1 rounded"
                      onClick={() => setEditingTaskId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="font-semibold text-lg">{task.title}</div>
                  <div className="text-gray-600">{task.description}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Assigned To: {task.assignedTo?.name || "N/A"} | Priority:{" "}
                    {task.priority} | Due: {task.dueDate?.slice(0, 10) || "N/A"}
                  </div>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {(currentUser.role === "hr" || currentUser.role === "admin") && (
                      <>
                        <button
                          onClick={() => handleEditTask(task)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className="bg-red-600 text-white px-3 py-1 rounded"
                        >
                          Delete
                        </button>
                      </>
                    )}
                    <button
                      onClick={() =>
                        handleStatusChange(
                          task._id,
                          task.status === "completed" ? "pending" : "completed"
                        )
                      }
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Mark as {task.status === "completed" ? "Pending" : "Completed"}
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskManagement;
