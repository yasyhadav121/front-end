// frontend/src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from '../authSlice';

function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  
  useEffect(() => {
    // Check authentication on component mount
    dispatch(checkAuth());
  }, [dispatch]);
  
  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;