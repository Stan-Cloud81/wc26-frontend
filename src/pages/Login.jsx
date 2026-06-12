import { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

function Login({ onLogin }) {
  const [step, setStep] = useState('password'); // 'password' or 'user-selection'
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, { password });
      if (response.data.users && response.data.users.length > 0) {
        setUsers(response.data.users);
        setStep('user-selection');
      } else {
        setError('No users found');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user) => {
    onLogin(user);
  };

  if (step === 'user-selection') {
    return (
      <div className="container">
        <div className="card" style={{ marginTop: '2rem' }}>
          <h2>Select Your Name</h2>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
            Choose your name from the list
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className="btn btn-primary"
                style={{ textAlign: 'left' }}
              >
                {user.name}
              </button>
            ))}
          </div>
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
