import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

function Leaderboard({ user }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`${API_URL}/leaderboard`);
      setLeaderboard(response.data.leaderboard || []);
      setError('');
    } catch (err) {
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <h2>🏆 Leaderboard</h2>
      {error && <div className="error">{error}</div>}
      
      {leaderboard.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          No scores yet
        </p>
      ) : (
        leaderboard.map((entry, index) => (
          <div 
            key={entry.user_id} 
            className="leaderboard-item"
            style={entry.user_id === user.id ? { border: '2px solid var(--primary)' } : {}}
          >
            <div className="rank">
              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
            </div>
            <div className="user-info">
              <div className="user-name">{entry.name}</div>
              <div className="user-teams">
                {entry.team1_name} • {entry.team2_name}
              </div>
            </div>
            <div className="points">{entry.total_points || 0}</div>
          </div>
        ))
      )}
    </div>
  );
}

export default Leaderboard;
