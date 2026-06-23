import { useState, useEffect } from 'react';
import api from '../utils/api';
import { hashPassword, setAuthToken, getAuthToken, clearAuthToken } from '../utils/auth';
import LoadingSkeleton from '../components/LoadingSkeleton';

function Login({ onLogin }) {
  const [step, setStep] = useState('password'); // 'password' or 'user-selection'
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getUserPhoto = (name) => {
    const fileName = name.toLowerCase().replace(/\s+/g, '-');
    return `/users/${fileName}.png`;
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users');
      const availableUsers = response.data.filter(u => !u.is_selected);
      if (availableUsers.length > 0) {
        setUsers(availableUsers);
        setStep('user-selection');
      } else {
        setError('No available users');
      }
    } catch {
      clearAuthToken();
      setStep('password');
      setError('Session expired. Please login again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      fetchUsers();
    }
  }, []);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = await hashPassword(password);
      setAuthToken(token);
      
      const response = await api.post('/auth/login', { password });
      if (response.data.users && response.data.users.length > 0) {
        setUsers(response.data.users);
        setStep('user-selection');
      } else {
        setError('No users found');
      }
    } catch (err) {
      clearAuthToken();
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = async (user) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/select', { 
        user_id: user.id 
      });
      if (response.data.success) {
        onLogin(response.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to select user');
      setLoading(false);
    }
  };

  if (loading && step === 'password') {
    return (
      <div className="container">
        <div className="card" style={{ marginTop: '2rem' }}>
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (step === 'user-selection') {
    return (
      <div className="container">
        <div className="card" style={{ marginTop: '2rem' }}>
          <h2>Select Your Name</h2>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
            Choose your name from the list
          </p>
          
          {loading ? (
            <div className="loading">Loading users...</div>
          ) : (
            <div className="user-grid">
              {users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className="user-grid-item"
                >
                  <img 
                    src={getUserPhoto(user.name)}
                    alt={user.name}
                    className="user-grid-photo"
                    onError={(e) => { 
                      e.target.onerror = null; 
                      e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Ccircle cx='40' cy='40' r='40' fill='%231a73e8'/%3E%3Ctext x='50%25' y='50%25' font-size='36' text-anchor='middle' dy='.3em' fill='white' font-weight='bold'%3E${user.name.charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E`; 
                    }}
                  />
                  <div className="user-grid-name">{user.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card" style={{ marginTop: '2rem' }}>
        <h1>🏆 World Cup 2026</h1>
        <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
          Enter the shared password to access the competition
        </p>
        
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handlePasswordSubmit}>
          <input
            type="password"
            className="input"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Verifying...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
