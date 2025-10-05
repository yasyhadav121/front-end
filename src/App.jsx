// src/App.jsx
import { Routes, Route, Navigate, useLocation } from "react-router";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Homepage from "./pages/Homepage";
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from "./authSlice";
import { useEffect } from "react";
import AdminPanel from "./components/AdminPanel";
import ProblemPage from "./pages/ProblemPage";
import Admin from "./pages/Admin";
import AdminVideo from "./components/AdminVideo";
import AdminDelete from "./components/AdminDelete";
import AdminUpload from "./components/AdminUpload";

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // Save current location in state before redirecting
  return isAuthenticated ? children : <Navigate to="/login" state={{ from: location }} replace />;
}

// Admin Route Component
function AdminRoute({ children }) {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Public Route (Redirect if authenticated)
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // IMPORTANT: Don't redirect authenticated users from public routes during reload
  // This allows them to stay on the current page
  return children;
}

function App() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  // Check authentication ONCE on app mount
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Show loading screen during initial auth check
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes - No redirect */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Homepage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/problem/:problemId" 
        element={
          <ProtectedRoute>
            <ProblemPage />
          </ProtectedRoute>
        } 
      />

      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/create" 
        element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/delete" 
        element={
          <AdminRoute>
            <AdminDelete />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/video" 
        element={
          <AdminRoute>
            <AdminVideo />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/upload/:problemId" 
        element={
          <AdminRoute>
            <AdminUpload />
          </AdminRoute>
        } 
      />

      {/* 404 Route */}
      <Route 
        path="*" 
        element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-6xl font-bold">404</h1>
              <p className="text-xl mt-4">Page Not Found</p>
            </div>
          </div>
        } 
      />
    </Routes>
  );
}

export default App;