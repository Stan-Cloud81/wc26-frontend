import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

function Home({ user }) {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const getFlagUrl = (country) => {
    const code = countryToISO[country] || country.toLowerCase().substring(0, 2);
    return `https://flagcdn.com/w80/${code}.png`;
  };

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
        <div className="team-flags">
          {teams.team1 && (
            <div className="flag-container">
              <div className="flag-circle">
                <img 
                  src={getFlagUrl(teams.team1.country)}
                  alt={teams.team1.country}
                  onError={(e) => { e.target.onerror = null; e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23ddd' width='80' height='80'/%3E%3Ctext x='50%25' y='50%25' font-size='24' text-anchor='middle' dy='.3em' fill='%23999'%3E1%3C/text%3E%3C/svg%3E`; }}
                />
                <div className="flag-number">1</div>
              </div>
              <div className="team-name-flag">{teams.team1.name}</div>
            </div>
          )}
          {teams.team2 && (
            <div className="flag-container">
              <div className="flag-circle">
                <img 
                  src={getFlagUrl(teams.team2.country)}
                  alt={teams.team2.country}
                  onError={(e) => { e.target.onerror = null; e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23ddd' width='80' height='80'/%3E%3Ctext x='50%25' y='50%25' font-size='24' text-anchor='middle' dy='.3em' fill='%23999'%3E2%3C/text%3E%3C/svg%3E`; }}
                />
                <div className="flag-number">2</div>
              </div>
              <div className="team-name-flag">{teams.team2.name}</div>
            </div>
          )}
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
