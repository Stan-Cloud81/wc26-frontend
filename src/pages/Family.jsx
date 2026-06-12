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
    return `https://flagcdn.com/w80/${code}.png`;
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

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <h2>👨‍👩‍👧‍👦 Family Teams</h2>
      {error && <div className="error">{error}</div>}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {users.map((u) => (
          <div 
            key={u.id} 
            className="card"
            style={u.id === user.id ? { border: '2px solid var(--primary)' } : {}}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <img 
                src={getUserPhoto(u.name)}
                alt={u.name}
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                onError={(e) => { 
                  e.target.onerror = null; 
                  e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%231a73e8'/%3E%3Ctext x='50%25' y='50%25' font-size='18' text-anchor='middle' dy='.3em' fill='white' font-weight='bold'%3E${u.name.charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E`; 
                }}
              />
              <h3 style={{ margin: 0 }}>{u.name}</h3>
            </div>
            
            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
              {u.team1_name && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '50%', border: `3px solid ${getFlagBorderColor(u.team1_is_top)}`, boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
                    <img 
                      src={getFlagUrl(u.team1_country)}
                      alt={u.team1_country}
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                      onError={(e) => { e.target.onerror = null; e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect fill='%23ddd' width='60' height='60'/%3E%3C/svg%3E`; }}
                    />
                    <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', width: '24px', height: '24px', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.8rem', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', zIndex: '10' }}>
                      1
                    </div>
                  </div>
                  <div style={{ fontWeight: '600', fontSize: '0.8rem', textAlign: 'center', maxWidth: '80px' }}>
                    {u.team1_name}
                  </div>
                  {u.team1_stats && (
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--secondary)' }}>W: {u.team1_stats.wins || 0}</span>
                      <span>D: {u.team1_stats.draws || 0}</span>
                      <span style={{ color: 'var(--danger)' }}>L: {u.team1_stats.losses || 0}</span>
                    </div>
                  )}
                </div>
              )}
              
              {u.team2_name && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '50%', border: `3px solid ${getFlagBorderColor(u.team2_is_top)}`, boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
                    <img 
                      src={getFlagUrl(u.team2_country)}
                      alt={u.team2_country}
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                      onError={(e) => { e.target.onerror = null; e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect fill='%23ddd' width='60' height='60'/%3E%3C/svg%3E`; }}
                    />
                    <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', width: '24px', height: '24px', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.8rem', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', zIndex: '10' }}>
                      2
                    </div>
                  </div>
                  <div style={{ fontWeight: '600', fontSize: '0.8rem', textAlign: 'center', maxWidth: '80px' }}>
                    {u.team2_name}
                  </div>
                  {u.team2_stats && (
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--secondary)' }}>W: {u.team2_stats.wins || 0}</span>
                      <span>D: {u.team2_stats.draws || 0}</span>
                      <span style={{ color: 'var(--danger)' }}>L: {u.team2_stats.losses || 0}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Family;
