import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/student/StudentDashboard';
import ComplaintForm from './pages/student/ComplaintForm';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageFaculty from './pages/admin/ManageFaculty';
import ProtectedRoute from './components/ProtectedRoute';

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/student" 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/complaint/:facultyId" 
          element={
            <ProtectedRoute requiredRole="student">
              <ComplaintForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/manage" 
          element={
            <ProtectedRoute requiredRole="admin">
              <ManageFaculty />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </>
  );
}

export default App;
