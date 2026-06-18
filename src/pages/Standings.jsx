import { useState, useEffect } from 'react';
import api from '../utils/api';
import ErrorWithRetry from '../components/ErrorWithRetry';
import usePullToRefresh from '../hooks/usePullToRefresh';

function Standings() {
  const [standings, setStandings] = useState([]);
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

  const getUserInitial = (name) => {
    return name.charAt(0).toUpperCase();
  };

  const fetchStandings = async () => {
    try {
      const response = await api.get('/standings');
      setStandings(Array.isArray(response.data) ? response.data : []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load standings');
    } finally {
      setLoading(false);
    }
  };

  const { isPulling } = usePullToRefresh(fetchStandings);

  useEffect(() => {
    fetchStandings();
  }, []);

  const groupStandings = standings.reduce((acc, team) => {
    if (!acc[team.pool_name]) {
      acc[team.pool_name] = [];
    }
    acc[team.pool_name].push(team);
    return acc;
  }, {});

  const allThirdPlaceTeams = Object.values(groupStandings)
    .map(teams => teams[2])
    .filter(team => team)
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
      if (b.goals_for !== a.goals_for) return b.goals_for - a.goals_for;
      return 0;
    });

  const top8ThirdPlaceTeamIds = new Set(
    allThirdPlaceTeams.slice(0, 8).map(team => team.team_id)
  );

  if (loading) {
    return (
      <div className="container">
        <h2>🏆 Standings</h2>
        <div className="card" style={{ padding: '1rem' }}>
          <div className="skeleton" style={{ height: '40px', marginBottom: '1rem' }} />
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton" style={{ height: '60px', marginBottom: '0.5rem' }} />
          ))}
        </div>
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
      <h2>🏆 Standings</h2>
      {error && <ErrorWithRetry message={error} onRetry={fetchStandings} />}
      
      {Object.keys(groupStandings).length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          No standings available yet
        </p>
      ) : (
        Object.entries(groupStandings).map(([groupName, teams]) => (
          <div key={groupName} className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
            <h3 style={{ 
              textAlign: 'center', 
              background: 'linear-gradient(135deg, var(--accent), #1f2d70)', 
              color: 'white', 
              padding: '0.75rem', 
              borderRadius: '8px', 
              marginBottom: '1rem',
              fontSize: '1.1rem',
              fontWeight: '700'
            }}>
              {groupName}
            </h3>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '0.75rem 0.1rem', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)', width: '20px' }}>#</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)' }}>Team</th>
                    <th style={{ padding: '0.75rem 0.1rem', textAlign: 'center', fontWeight: '700', color: 'var(--text-secondary)', width: '22px' }}>M</th>
                    <th style={{ padding: '0.75rem 0.1rem', textAlign: 'center', fontWeight: '700', color: 'var(--text-secondary)', width: '22px' }}>W</th>
                    <th style={{ padding: '0.75rem 0.1rem', textAlign: 'center', fontWeight: '700', color: 'var(--text-secondary)', width: '22px' }}>D</th>
                    <th style={{ padding: '0.75rem 0.1rem', textAlign: 'center', fontWeight: '700', color: 'var(--text-secondary)', width: '22px' }}>L</th>
                    <th style={{ padding: '0.75rem 0.15rem', textAlign: 'center', fontWeight: '700', color: 'var(--text-secondary)', width: '30px' }}>PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team, index) => {
                    let rank = 1;
                    for (let i = 0; i < index; i++) {
                      if (teams[i].points !== team.points || 
                          teams[i].goal_difference !== team.goal_difference || 
                          teams[i].goals_for !== team.goals_for) {
                        rank = i + 2;
                      }
                    }

                    let bgColor = 'transparent';
                    if (rank === 1) {
                      bgColor = 'rgba(255, 215, 0, 0.15)';
                    } else if (rank === 2) {
                      bgColor = 'rgba(192, 192, 192, 0.15)';
                    } else if (rank === 3 && top8ThirdPlaceTeamIds.has(team.team_id)) {
                      bgColor = 'rgba(205, 127, 50, 0.15)';
                    }
                    
                    return (
                      <tr 
                        key={team.team_id}
                        style={{ 
                          borderBottom: '1px solid var(--border)',
                          background: bgColor
                        }}
                      >
                      <td style={{ padding: '0.75rem 0.1rem', fontWeight: '700', color: 'var(--primary)' }}>
                        {rank}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                            <img 
                              src={getFlagUrl(team.country)}
                              alt={team.country}
                              style={{ width: '24px', height: '16px', objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }}
                              onError={(e) => { e.target.onerror = null; e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='16'%3E%3Crect fill='%23ddd' width='24' height='16'/%3E%3C/svg%3E`; }}
                            />
                            <span style={{ fontWeight: '600', wordBreak: 'break-word', hyphens: 'auto', flex: 1 }}>{team.team_name}</span>
                          </div>
                          {team.users && team.users.length > 0 && (
                            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', justifyContent: 'flex-end', flexShrink: 0 }}>
                              {team.users.map((u) => (
                                <div key={u.user_id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(26, 115, 232, 0.1)', padding: '0.1rem 0.4rem', borderRadius: '10px', fontSize: '0.7rem' }}>
                                  <img 
                                    src={getUserPhoto(u.user_name)}
                                    alt={u.user_name}
                                    style={{ width: '14px', height: '14px', borderRadius: '50%', objectFit: 'cover' }}
                                    onError={(e) => { 
                                      e.target.onerror = null; 
                                      e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14'%3E%3Ccircle cx='7' cy='7' r='7' fill='%231a73e8'/%3E%3Ctext x='50%25' y='50%25' font-size='8' text-anchor='middle' dy='.3em' fill='white' font-weight='bold'%3E${getUserInitial(u.user_name)}%3C/text%3E%3C/svg%3E`; 
                                    }}
                                  />
                                  <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '500' }}>{u.user_name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 0.1rem', textAlign: 'center', fontWeight: '600' }}>
                        {team.matches_played}
                      </td>
                      <td style={{ padding: '0.75rem 0.1rem', textAlign: 'center', color: '#22c55e', fontWeight: '600' }}>
                        {team.wins}
                      </td>
                      <td style={{ padding: '0.75rem 0.1rem', textAlign: 'center', color: '#f59e0b', fontWeight: '600' }}>
                        {team.draws}
                      </td>
                      <td style={{ padding: '0.75rem 0.1rem', textAlign: 'center', color: '#ef4444', fontWeight: '600' }}>
                        {team.losses}
                      </td>
                      <td style={{ padding: '0.75rem 0.15rem', textAlign: 'center', fontWeight: '700', fontSize: '1rem', color: 'var(--primary)' }}>
                        {team.points}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Standings;
