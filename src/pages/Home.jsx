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

  const getUserPhoto = (name) => {
    const fileName = name.toLowerCase().replace(/\s+/g, '-');
    return `/users/${fileName}.png`;
  };

  const getFlagBorderColor = (isTopTeam) => {
    return isTopTeam ? '#FFD700' : '#C0C0C0';
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [matchesRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/matches?userId=${user.id}`),
        axios.get(`${API_URL}/users`)
      ]);
      
      setMatches(Array.isArray(matchesRes.data) ? matchesRes.data : []);
      
      const currentUser = Array.isArray(usersRes.data) 
        ? usersRes.data.find(u => u.id === user.id) 
        : null;
      
      if (currentUser) {
        const teamsData = {};
        if (currentUser.team1_name) {
          teamsData.team1 = {
            id: currentUser.team1_id,
            name: currentUser.team1_name,
            country: currentUser.team1_country,
            is_top: currentUser.team1_is_top,
            stats: currentUser.team1_stats || { wins: 0, draws: 0, losses: 0 }
          };
        }
        if (currentUser.team2_name) {
          teamsData.team2 = {
            id: currentUser.team2_id,
            name: currentUser.team2_name,
            country: currentUser.team2_country,
            is_top: currentUser.team2_is_top,
            stats: currentUser.team2_stats || { wins: 0, draws: 0, losses: 0 }
          };
        }
        setTeams(teamsData);
      }
      
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

  const myMatches = matches;

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      {error && <div className="error">{error}</div>}
      
      <div className="my-team">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <img 
            src={getUserPhoto(user.name)}
            alt={user.name}
            style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
            onError={(e) => { 
              e.target.onerror = null; 
              e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3E%3Ccircle cx='25' cy='25' r='25' fill='%231a73e8'/%3E%3Ctext x='50%25' y='50%25' font-size='22' text-anchor='middle' dy='.3em' fill='white' font-weight='bold'%3E${user.name.charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E`; 
            }}
          />
          <h3 style={{ margin: 0 }}>My Teams</h3>
        </div>
        <div className="team-flags">
          {teams.team1 && (
            <div className="flag-container">
              <div className="flag-circle" style={{ border: `3px solid ${getFlagBorderColor(teams.team1.is_top)}` }}>
                <img 
                  src={getFlagUrl(teams.team1.country)}
                  alt={teams.team1.country}
                  onError={(e) => { e.target.onerror = null; e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23ddd' width='80' height='80'/%3E%3Ctext x='50%25' y='50%25' font-size='24' text-anchor='middle' dy='.3em' fill='%23999'%3E1%3C/text%3E%3C/svg%3E`; }}
                />
                <div className="flag-number">1</div>
              </div>
              <div className="team-name-flag">{teams.team1.name}</div>
              {teams.team1.stats && (
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  <span style={{ color: 'var(--secondary)' }}>W: {teams.team1.stats.wins || 0}</span>
                  <span>D: {teams.team1.stats.draws || 0}</span>
                  <span style={{ color: 'var(--danger)' }}>L: {teams.team1.stats.losses || 0}</span>
                </div>
              )}
            </div>
          )}
          {teams.team2 && (
            <div className="flag-container">
              <div className="flag-circle" style={{ border: `3px solid ${getFlagBorderColor(teams.team2.is_top)}` }}>
                <img 
                  src={getFlagUrl(teams.team2.country)}
                  alt={teams.team2.country}
                  onError={(e) => { e.target.onerror = null; e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23ddd' width='80' height='80'/%3E%3Ctext x='50%25' y='50%25' font-size='24' text-anchor='middle' dy='.3em' fill='%23999'%3E2%3C/text%3E%3C/svg%3E`; }}
                />
                <div className="flag-number">2</div>
              </div>
              <div className="team-name-flag">{teams.team2.name}</div>
              {teams.team2.stats && (
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  <span style={{ color: 'var(--secondary)' }}>W: {teams.team2.stats.wins || 0}</span>
                  <span>D: {teams.team2.stats.draws || 0}</span>
                  <span style={{ color: 'var(--danger)' }}>L: {teams.team2.stats.losses || 0}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <h2>My Matches</h2>
      {myMatches.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          No matches available yet
        </p>
      ) : (
        myMatches.map((match) => {
          const opponentUsers = match.opponent_users || [];
          const myTeam = match.user_team;
          const opponentTeam = match.opponent_team;
          
          const myTeamId = myTeam === 'team1' ? match.team1_id : match.team2_id;
          const myTeamName = myTeam === 'team1' ? match.team1_name : match.team2_name;
          const myTeamCountry = myTeam === 'team1' ? match.team1_country : match.team2_country;
          const myTeamIsTop = myTeam === 'team1' ? match.team1_is_top : match.team2_is_top;
          const myScore = myTeam === 'team1' ? match.score1 : match.score2;
          
          const oppTeamId = opponentTeam === 'team1' ? match.team1_id : match.team2_id;
          const oppTeamName = opponentTeam === 'team1' ? match.team1_name : match.team2_name;
          const oppTeamCountry = opponentTeam === 'team1' ? match.team1_country : match.team2_country;
          const oppTeamIsTop = opponentTeam === 'team1' ? match.team1_is_top : match.team2_is_top;
          const oppScore = opponentTeam === 'team1' ? match.score1 : match.score2;

          return (
            <div 
              key={match.id} 
              className="match-card"
              style={{ border: '2px solid var(--primary)', position: 'relative' }}
            >
              {opponentUsers.length > 0 && (
                <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                  {opponentUsers.map((opp) => (
                    <div key={opp.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(26, 115, 232, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '12px' }}>
                      <img 
                        src={getUserPhoto(opp.name)}
                        alt={opp.name}
                        style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover', border: '1px solid white' }}
                        onError={(e) => { 
                          e.target.onerror = null; 
                          e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Ccircle cx='10' cy='10' r='10' fill='%231a73e8'/%3E%3Ctext x='50%25' y='50%25' font-size='12' text-anchor='middle' dy='.3em' fill='white' font-weight='bold'%3E${opp.name.charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E`; 
                        }}
                      />
                      <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--primary)' }}>{opp.name}</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div className="team" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <img 
                      src={getFlagUrl(myTeamCountry)}
                      alt={myTeamCountry}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${getFlagBorderColor(myTeamIsTop)}`, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
                      onError={(e) => { e.target.onerror = null; e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect fill='%23ddd' width='40' height='40'/%3E%3C/svg%3E`; }}
                    />
                    <div className="team-name">{myTeamName}</div>
                  </div>
                  <div className="score">
                    {match.status === 'finished' ? 
                      `${myScore} - ${oppScore}` : 
                      'vs'
                    }
                  </div>
                  <div className="team" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <img 
                      src={getFlagUrl(oppTeamCountry)}
                      alt={oppTeamCountry}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${getFlagBorderColor(oppTeamIsTop)}`, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
                      onError={(e) => { e.target.onerror = null; e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect fill='%23ddd' width='40' height='40'/%3E%3C/svg%3E`; }}
                    />
                    <div className="team-name">{oppTeamName}</div>
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
