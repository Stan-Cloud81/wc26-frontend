import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

function Home({ user }) {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [matchesRes, userRes] = await Promise.all([
        axios.get(`${API_URL}/matches`),
        axios.get(`${API_URL}/users/${user.id}`)
      ]);
      
      setMatches(matchesRes.data.matches || []);
      setTeams(userRes.data.teams || {});
      setError('');
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const userTeamIds = [teams.team1?.id, teams.team2?.id].filter(Boolean);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      {error && <div className="error">{error}</div>}
      
      <div className="my-team">
        <h3>👤 {user.name}'s Teams</h3>
        <div className="team-list">
          {teams.team1 && <div className="team-badge">⭐ {teams.team1.name}</div>}
          {teams.team2 && <div className="team-badge">🎯 {teams.team2.name}</div>}
        </div>
      </div>

      <h2>Matches</h2>
      {matches.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          No matches available yet
        </p>
      ) : (
        matches.map((match) => {
          const isMyMatch = userTeamIds.includes(match.team1_id) || userTeamIds.includes(match.team2_id);
          
          return (
            <div 
              key={match.id} 
              className="match-card"
              style={isMyMatch ? { border: '2px solid var(--primary)' } : {}}
            >
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div className="team">
                    <div className="team-name">{match.team1_name}</div>
                  </div>
                  <div className="score">
                    {match.status === 'finished' ? 
                      `${match.score1} - ${match.score2}` : 
                      'vs'
                    }
                  </div>
                  <div className="team">
                    <div className="team-name">{match.team2_name}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="date">{formatDate(match.match_date)}</div>
                  <span className={`status status-${match.status}`}>{match.status}</span>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default Home;
