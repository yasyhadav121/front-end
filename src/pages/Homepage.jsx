import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all'
  });

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        setError(null);
        // Backend route check karo - yeh sahi hai?
        const response = await axiosClient.get('/problem/getAllProblem');
        setProblems(response.data || []);
      } catch (error) {
        console.error('Error fetching problems:', error);
        setError(error.response?.data?.message || 'Failed to fetch problems');
      } finally {
        setLoading(false);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const response = await axiosClient.get('/problem/problemSolvedByUser');
        setSolvedProblems(response.data || []);
      } catch (error) {
        console.error('Error fetching solved problems:', error);
        // Don't show error for solved problems if user is not logged in
      }
    };

    fetchProblems();
    if (user) {
      fetchSolvedProblems();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      setSolvedProblems([]);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const filteredProblems = problems.filter(problem => {
    const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
    const tagMatch = filters.tag === 'all' || problem.tags === filters.tag;
    const statusMatch = filters.status === 'all' ||
      (filters.status === 'solved' && solvedProblems.some(sp => sp._id === problem._id));
    return difficultyMatch && tagMatch && statusMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4">Loading problems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navigation Bar */}
      <nav className="navbar bg-base-100 shadow-lg px-4">
        <div className="flex-1">
          <NavLink to="/" className="btn btn-ghost text-xl">CodeOn</NavLink>
        </div>
        <div className="flex-none gap-4">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost">
              {user?.firstName || 'User'}
            </div>
            <ul tabIndex={0} className="mt-3 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52 z-50">
              <li><button onClick={handleLogout}>Logout</button></li>
              {user?.role === 'admin' && <li><NavLink to="/admin">Admin</NavLink></li>}
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto p-4">
        {/* Error Alert */}
        {error && (
          <div className="alert alert-error mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            className="select select-bordered"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="all">All Problems</option>
            <option value="solved">Solved Problems</option>
          </select>

          <select
            className="select select-bordered"
            value={filters.difficulty}
            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select
            className="select select-bordered"
            value={filters.tag}
            onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
          >
            <option value="all">All Tags</option>
            <option value="array">Array</option>
            <option value="linkedList">Linked List</option>
            <option value="graph">Graph</option>
            <option value="dp">DP</option>
          </select>
        </div>

        {/* Problems List */}
        {filteredProblems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">No problems found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredProblems.map(problem => (
              <div key={problem._id} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <h2 className="card-title">
                      <NavLink to={`/problem/${problem._id}`} className="hover:text-primary">
                        {problem.title}
                      </NavLink>
                    </h2>
                    {solvedProblems.some(sp => sp._id === problem._id) && (
                      <div className="badge badge-success gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Solved
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <div className={`badge ${getDifficultyBadgeColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </div>
                    <div className="badge badge-info">
                      {problem.tags}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const getDifficultyBadgeColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return 'badge-success';
    case 'medium': return 'badge-warning';
    case 'hard': return 'badge-error';
    default: return 'badge-neutral';
  }
};

export default Homepage;