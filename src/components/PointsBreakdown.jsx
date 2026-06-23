import { useState, useEffect } from 'react';
import api from '../utils/api';

function PointsBreakdown({ userId, userName, onClose }) {
  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBreakdown = async () => {
      try {
        const response = await api.get(`/users/${userId}/points-breakdown`);
        setBreakdown(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load points breakdown');
      } finally {
        setLoading(false);
      }
    };

    fetchBreakdown();
  }, [userId]);

  const getFlagUrl = (country) => {
    const countryToISO = {
      'Algeria': 'dz', 'Argentina': 'ar', 'Australia': 'au', 'Austria': 'at',
      'Belgium': 'be', 'Bosnia and Herzegovina': 'ba', 'Brazil': 'br', 'Canada': 'ca',
      'Cape Verde': 'cv', 'Colombia': 'co', 'Croatia': 'hr', 'Curaçao': 'cw',
      'Czech Republic': 'cz', 'Democratic Republic of the Congo': 'cd',
      'Ecuador': 'ec', 'Egypt': 'eg', 'England': 'gb-eng', 'France': 'fr',
      'Germany': 'de', 'Ghana': 'gh', 'Haiti': 'ht', 'Iran': 'ir',
      'Iraq': 'iq', 'Ivory Coast': 'ci', 'Japan': 'jp', 'Jordan': 'jo',
      'Mexico': 'mx', 'Morocco': 'ma', 'Netherlands': 'nl', 'New Zealand': 'nz',
      'Norway': 'no', 'Panama': 'pa', 'Paraguay': 'py', 'Portugal': 'pt',
      'Qatar': 'qa', 'Saudi Arabia': 'sa', 'Scotland': 'gb-sct', 'Senegal': 'sn',
      'South Africa': 'za', 'South Korea': 'kr', 'Spain': 'es', 'Sweden': 'se',
      'Switzerland': 'ch', 'Tunisia': 'tn', 'Turkey': 'tr', 'United States': 'us',
      'Uruguay': 'uy', 'Uzbekistan': 'uz'
    };
    const code = countryToISO[country] || country.toLowerCase().substring(0, 2);
    return `https://flagcdn.com/w80/${code}.png`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📊 {userName}'s Points Breakdown</h2>
          <button onClick={onClose} className="modal-close" aria-label="Close">×</button>
        </div>
        
        <div className="modal-body">
          {loading && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="spinner">⚽</div>
              <p>Loading breakdown...</p>
            </div>
          )}
          
          {error && (
            <div className="error-message" style={{ margin: '1rem' }}>
              {error}
            </div>
          )}
          
          {breakdown && !loading && !error && (
            <>
              <div className="points-summary">
                <div className="summary-item">
                  <span className="summary-label">Total Points</span>
                  <span className="summary-value">{breakdown.total_points}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Matches Played</span>
                  <span className="summary-value">{breakdown.matches_played}</span>
                </div>
              </div>

              {breakdown.teams && breakdown.teams.length > 0 && (
                <div className="teams-breakdown">
                  <h3>Teams Performance</h3>
                  {breakdown.teams.map((team) => (
                    <div key={team.team_id} className="team-breakdown-card">
                      <div className="team-header">
                        <img 
                          src={getFlagUrl(team.country)} 
                          alt={team.team_name}
                          className="team-flag-small"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <span className="team-name">{team.team_name}</span>
                        <span className="team-points">{team.points} pts</span>
                      </div>
                      <div className="team-stats">
                        <span className="stat-item win">✅ {team.wins}W</span>
                        <span className="stat-item draw">⚖️ {team.draws}D</span>
                        <span className="stat-item loss">❌ {team.losses}L</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {breakdown.matches && breakdown.matches.length > 0 && (
                <div className="matches-breakdown">
                  <h3>Match History</h3>
                  {breakdown.matches.map((match) => (
                    <div key={match.match_id} className="match-breakdown-item">
                      <div className="match-teams">
                        <div className="match-team">
                          <img 
                            src={getFlagUrl(match.team1_country)} 
                            alt={match.team1_name}
                            className="team-flag-tiny"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          <span>{match.team1_name}</span>
                        </div>
                        <div className="match-score">
                          {match.team1_score} - {match.team2_score}
                        </div>
                        <div className="match-team">
                          <img 
                            src={getFlagUrl(match.team2_country)} 
                            alt={match.team2_name}
                            className="team-flag-tiny"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          <span>{match.team2_name}</span>
                        </div>
                      </div>
                      <div className="match-points">
                        +{match.points_earned} pts
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PointsBreakdown;
