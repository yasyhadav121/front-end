// src/pages/Login.jsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../authSlice';
import { useNavigate, useLocation, Link } from 'react-router-dom';

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    emailId: '',
    password: '',
  });

  // Get the page user was trying to access
  const from = location.state?.from?.pathname || '/';

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await dispatch(loginUser(formData));
    
    if (loginUser.fulfilled.match(result)) {
      // Redirect to the page user was trying to access
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold text-center">Login</h2>
          
          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                name="emailId"
                placeholder="Enter your email"
                className="input input-bordered"
                value={formData.emailId}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                className="input input-bordered"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-control mt-6">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  'Login'
                )}
              </button>
            </div>
          </form>
          
          <div className="divider">OR</div>
          
          <Link to="/signup" className="btn btn-outline">
            Create New Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;