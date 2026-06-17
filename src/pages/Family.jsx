import { useState, useEffect } from 'react';
import api from '../utils/api';

function Family({ user }) {
  const [users, setUsers] = useState([]);
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
    return `https://flagcdn.com/w320/${code}.png`;
  };

  const getUserPhoto = (name) => {
    const fileName = name.toLowerCase().replace(/\s+/g, '-');
    return `/users/${fileName}.png`;
  };

  const getFlagBorderColor = (isTopTeam) => {
    return isTopTeam ? 'var(--gold)' : 'var(--silver)';
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get(`/users`);
      setUsers(Array.isArray(response.data) ? response.data : []);
      setError('');
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPoints = (userStats) => {
    const team1Points = userStats.team1_stats ? (userStats.team1_stats.wins * 3 + userStats.team1_stats.draws) : 0;
    const team2Points = userStats.team2_stats ? (userStats.team2_stats.wins * 3 + userStats.team2_stats.draws) : 0;
    return team1Points + team2Points;
  };

  const sortedUsers = [...users].sort((a, b) => {
    const pointsA = calculateTotalPoints(a);
    const pointsB = calculateTotalPoints(b);
    return pointsB - pointsA;
  });

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <h2>👨‍👩‍👧‍👦 Family Teams</h2>
      {error && <div className="error">{error}</div>}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {sortedUsers.map((u, index) => {
          const totalPoints = calculateTotalPoints(u);
          
          let rank = 1;
          for (let i = 0; i < index; i++) {
            if (calculateTotalPoints(sortedUsers[i]) !== totalPoints) {
              rank = i + 2;
            }
          }
          const topTeam = u.team1_is_top ? { name: u.team1_name, country: u.team1_country, stats: u.team1_stats } : { name: u.team2_name, country: u.team2_country, stats: u.team2_stats };
          const notTopTeam = u.team1_is_top ? { name: u.team2_name, country: u.team2_country, stats: u.team2_stats } : { name: u.team1_name, country: u.team1_country, stats: u.team1_stats };
          
          let rankDisplay = `#${rank}`;
          let rankFontSize = '1.1rem';
          let rankColor = 'var(--primary)';
          let rankMinWidth = '35px';
          
          if (rank === 1) {
            rankDisplay = '🥇';
            rankFontSize = '2rem';
            rankMinWidth = '40px';
          } else if (rank === 2) {
            rankDisplay = '🥈';
            rankFontSize = '2rem';
            rankMinWidth = '40px';
          } else if (rank === 3) {
            rankDisplay = '🥉';
            rankFontSize = '2rem';
            rankMinWidth = '40px';
          }

          return (
            <div 
              key={u.id} 
              className="card"
              style={{
                padding: 0,
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                ...(u.id === user.id ? { border: '3px solid var(--primary)' } : {})
              }}
            >
              <div style={{ padding: '0.75rem 1rem', background: 'var(--card-bg)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: '700', fontSize: rankFontSize, minWidth: rankMinWidth, color: rankColor }}>{rankDisplay}</span>
                  <img 
                    src={getUserPhoto(u.name)}
                    alt={u.name}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                    onError={(e) => { 
                      e.target.onerror = null; 
                      e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%231a73e8'/%3E%3Ctext x='50%25' y='50%25' font-size='18' text-anchor='middle' dy='.3em' fill='white' font-weight='bold'%3E${u.name.charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E`; 
                    }}
                  />
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>{u.name}</h3>
                </div>
                <div style={{ fontWeight: '700', fontSize: '1.2rem', color: 'var(--primary)' }}>
                  {totalPoints} pts
                </div>
              </div>

              <div style={{ display: 'flex', height: '180px' }}>
              {topTeam.name && (
                <div style={{ flex: 1, position: 'relative', borderRight: `3px solid var(--gold)` }}>
                  <img 
                    src={getFlagUrl(topTeam.country)}
                    alt={topTeam.country}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.onerror = null; e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='120'%3E%3Crect fill='%23ddd' width='100' height='120'/%3E%3C/svg%3E`; }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 40%, transparent 70%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', padding: '1rem 0.75rem' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'white', marginBottom: '0.5rem', textAlign: 'center', lineHeight: '1.2' }}>
                      {topTeam.name}
                    </div>
                    {topTeam.stats && (
                      <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.85rem', fontWeight: '600' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1rem' }}>
                          <span style={{ color: '#4ade80', fontSize: '1.1rem' }}>{topTeam.stats.wins || 0}</span>
                          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}>W</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1rem' }}>
                          <span style={{ color: '#fbbf24', fontSize: '1.1rem' }}>{topTeam.stats.draws || 0}</span>
                          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}>D</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1rem' }}>
                          <span style={{ color: '#f87171', fontSize: '1.1rem' }}>{topTeam.stats.losses || 0}</span>
                          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}>L</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {notTopTeam.name && (
                <div style={{ flex: 1, position: 'relative', borderLeft: `3px solid var(--silver)` }}>
                  <img 
                    src={getFlagUrl(notTopTeam.country)}
                    alt={notTopTeam.country}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.onerror = null; e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='120'%3E%3Crect fill='%23ddd' width='100' height='120'/%3E%3C/svg%3E`; }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 40%, transparent 70%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', padding: '1rem 0.75rem' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'white', marginBottom: '0.5rem', textAlign: 'center', lineHeight: '1.2' }}>
                      {notTopTeam.name}
                    </div>
                    {notTopTeam.stats && (
                      <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.85rem', fontWeight: '600' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1rem' }}>
                          <span style={{ color: '#4ade80', fontSize: '1.1rem' }}>{notTopTeam.stats.wins || 0}</span>
                          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}>W</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1rem' }}>
                          <span style={{ color: '#fbbf24', fontSize: '1.1rem' }}>{notTopTeam.stats.draws || 0}</span>
                          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}>D</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1rem' }}>
                          <span style={{ color: '#f87171', fontSize: '1.1rem' }}>{notTopTeam.stats.losses || 0}</span>
                          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}>L</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Family;
