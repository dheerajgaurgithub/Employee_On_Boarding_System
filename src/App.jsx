import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Login from './components/Login';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import HRDashboard from './components/Dashboard/HRDashboard';
import EmployeeDashboard from './components/Dashboard/EmployeeDashboard';

const AppContent = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  if (!currentUser) {
    return <Login />;
  }

  switch (currentUser.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'hr':
      return <HRDashboard />;
    case 'employee':
      return <EmployeeDashboard />;
    default:
      return <Login />;
  }
};

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;