import { useState, useEffect } from 'react';
import api from '../utils/api';

function TeamMatches({ teamName, teamCountry, onClose }) {
  const [matches, setMatches] = useState([]);
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';

    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true
    });
  };

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await api.get('/matches');
        const allMatches = Array.isArray(response.data) ? response.data : [];
        
        const teamMatches = allMatches.filter(match => 
          match.team1_name === teamName || match.team2_name === teamName
        ).sort((a, b) => new Date(a.match_date) - new Date(b.match_date));

        setMatches(teamMatches);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load matches');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [teamName]);

  const pastMatches = matches.filter(m => m.status === 'finished');
  const upcomingMatches = matches.filter(m => m.status === 'scheduled' || m.status === 'live');

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'var(--card-bg)',
          borderRadius: '12px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ 
          padding: '1rem', 
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'var(--primary)',
          color: 'white'
        }}>
          <img 
            src={getFlagUrl(teamCountry)}
            alt={teamCountry}
            style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }}
          />
          <h2 style={{ margin: 0, fontSize: '1.25rem', flex: 1 }}>{teamName}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
          {loading && <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading matches...</p>}
          {error && <p style={{ color: 'var(--danger)', textAlign: 'center' }}>{error}</p>}
          
          {!loading && !error && (
            <>
              {upcomingMatches.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Upcoming ({upcomingMatches.length})
                  </h3>
                  {upcomingMatches.map(match => {
                    const isTeam1 = match.team1_name === teamName;
                    const opponent = isTeam1 ? match.team2_name : match.team1_name;
                    const opponentCountry = isTeam1 ? match.team2_country : match.team1_country;

                    return (
                      <div 
                        key={match.id}
                        style={{
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          padding: '0.75rem',
                          marginBottom: '0.5rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: '600' }}>vs</span>
                          <img 
                            src={getFlagUrl(opponentCountry)}
                            alt={opponentCountry}
                            style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }}
                          />
                          <span style={{ fontWeight: '600', flex: 1 }}>{opponent}</span>
                          {match.status === 'live' && (
                            <span style={{ background: 'var(--danger)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>
                              LIVE
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span>{formatDate(match.match_date)}</span>
                          <span>•</span>
                          <span>{formatTime(match.match_date)}</span>
                          {match.location && (
                            <>
                              <span>•</span>
                              <span>{match.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {pastMatches.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Past Matches ({pastMatches.length})
                  </h3>
                  {pastMatches.map(match => {
                    const isTeam1 = match.team1_name === teamName;
                    const opponent = isTeam1 ? match.team2_name : match.team1_name;
                    const opponentCountry = isTeam1 ? match.team2_country : match.team1_country;
                    const teamScore = isTeam1 ? match.score1 : match.score2;
                    const opponentScore = isTeam1 ? match.score2 : match.score1;
                    
                    const isWin = teamScore > opponentScore;
                    const isDraw = teamScore === opponentScore;
                    const resultColor = isWin ? '#4ade80' : isDraw ? '#fbbf24' : '#f87171';

                    return (
                      <div 
                        key={match.id}
                        style={{
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          padding: '0.75rem',
                          marginBottom: '0.5rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: '600' }}>vs</span>
                          <img 
                            src={getFlagUrl(opponentCountry)}
                            alt={opponentCountry}
                            style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }}
                          />
                          <span style={{ fontWeight: '600', flex: 1 }}>{opponent}</span>
                          <span style={{ fontWeight: '700', fontSize: '1.1rem', color: resultColor }}>
                            {teamScore} - {opponentScore}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span>{formatDate(match.match_date)}</span>
                          {match.location && (
                            <>
                              <span>•</span>
                              <span>{match.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {matches.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                  No matches found for this team
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeamMatches;
