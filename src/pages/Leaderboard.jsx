import { useState, useEffect } from 'react';
import api from '../utils/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorWithRetry from '../components/ErrorWithRetry';
import usePullToRefresh from '../hooks/usePullToRefresh';

function Leaderboard({ user }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get(`/leaderboard`);
      setLeaderboard(response.data.leaderboard || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const { isPulling } = usePullToRefresh(fetchLeaderboard);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="container">
        <h2>🏆 Leaderboard</h2>
        <LoadingSkeleton type="leaderboard" />
        <LoadingSkeleton type="leaderboard" />
        <LoadingSkeleton type="leaderboard" />
      </div>
    );
  }

  return (
    <div className="container">
      {isPulling && (
        <div className="pull-to-refresh">
          <div className="pull-to-refresh-icon">⚽</div>
        </div>
      )}
      <h2>🏆 Leaderboard</h2>
      {error && <ErrorWithRetry message={error} onRetry={fetchLeaderboard} />}
      
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
