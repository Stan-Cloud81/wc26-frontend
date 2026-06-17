import { useState, useEffect } from 'react';
import api from '../utils/api';
import { subscribeToPushNotifications } from '../utils/notifications';
import WinAnimation from '../components/WinAnimation';

function Home({ user }) {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notificationStatus, setNotificationStatus] = useState('checking');
  const [showTiedUsers, setShowTiedUsers] = useState(false);
  const [winAnimationData, setWinAnimationData] = useState(null);

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

  const calculateTotalPoints = (userStats) => {
    const team1Points = userStats.team1_stats ? (userStats.team1_stats.wins * 3 + userStats.team1_stats.draws) : 0;
    const team2Points = userStats.team2_stats ? (userStats.team2_stats.wins * 3 + userStats.team2_stats.draws) : 0;
    return team1Points + team2Points;
  };

  const getUserRankInfo = () => {
    const sortedUsers = [...users].sort((a, b) => {
      const pointsA = calculateTotalPoints(a);
      const pointsB = calculateTotalPoints(b);
      return pointsB - pointsA;
    });

    const currentUserPoints = calculateTotalPoints(users.find(u => u.id === user.id) || {});
    let rank = 1;
    const tiedUsers = [];
    
    for (let i = 0; i < sortedUsers.length; i++) {
      if (sortedUsers[i].id === user.id) {
        for (let j = 0; j < i; j++) {
          if (calculateTotalPoints(sortedUsers[j]) !== currentUserPoints) {
            rank = j + 2;
          }
        }
        break;
      }
    }
    
    for (const u of sortedUsers) {
      if (calculateTotalPoints(u) === currentUserPoints && u.id !== user.id) {
        tiedUsers.push(u.name);
      }
    }
    
    return { rank, tiedUsers };
  };

  const getRankDisplay = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankStyle = (rank) => {
    if (rank <= 3) {
      return { fontSize: '2rem', minWidth: '40px' };
    }
    return { fontSize: '1.1rem', minWidth: '35px', color: 'var(--primary)' };
  };

  useEffect(() => {
    fetchData();
    checkPendingWinAnimation();
    // checkNotificationStatus();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkPendingWinAnimation = async () => {
    try {
      const response = await api.get(`/win-animation/pending?userId=${user.id}`);
      if (response.data) {
        console.log('Win animation data:', response.data);
        setWinAnimationData(response.data);
      }
    } catch (err) {
      console.error('Failed to check pending win animation:', err);
    }
  };

  const handleWinAnimationClose = async () => {
    if (winAnimationData) {
      try {
        await api.post('/win-animation/mark-shown', {
          user_id: user.id,
          match_id: winAnimationData.match_id,
          team_id: winAnimationData.team_id
        });
        setWinAnimationData(null);
      } catch (err) {
        console.error('Failed to mark animation as shown:', err);
        setWinAnimationData(null);
      }
    }
  };

  // const checkNotificationStatus = () => {
  //   if (!('Notification' in window)) {
  //     setNotificationStatus('unsupported');
  //     return;
  //   }

  //   if (Notification.permission === 'granted') {
  //     setNotificationStatus('granted');
  //   } else if (Notification.permission === 'denied') {
  //     setNotificationStatus('denied');
  //   } else {
  //     setNotificationStatus('default');
  //   }
  // };

  // const handleEnableNotifications = async () => {
  //   const result = await subscribeToPushNotifications(user.id);
  //   if (result) {
  //     setNotificationStatus('granted');
  //   } else {
  //     checkNotificationStatus();
  //   }
  // };

  const fetchData = async () => {
    try {
      const [matchesRes, usersRes] = await Promise.all([
        api.get(`/matches?userId=${user.id}`),
        api.get(`/users`)
      ]);
      
      setMatches(Array.isArray(matchesRes.data) ? matchesRes.data : []);
      
      const usersData = Array.isArray(usersRes.data) ? usersRes.data : [];
      setUsers(usersData);
      
      const currentUser = usersData.find(u => u.id === user.id);
      
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
    const utcDate = new Date(date.getTime() + (4 * 60 * 60 * 1000));
    return utcDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  };

  const myMatches = matches;

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      {error && <div className="error">{error}</div>}
      
      {/* {notificationStatus === 'denied' && (
        <div style={{ 
          background: 'var(--danger)', 
          color: 'white', 
          padding: '0.75rem', 
          borderRadius: '8px', 
          marginBottom: '1rem',
          fontSize: '0.85rem'
        }}>
          <strong>Notifications Blocked</strong>
          <p style={{ margin: '0.25rem 0 0 0' }}>
            You've blocked notifications. To receive match updates, please enable notifications in your browser/phone settings.
          </p>
        </div>
      )}
      
      {notificationStatus === 'default' && (
        <div style={{ 
          background: 'var(--primary)', 
          color: 'white', 
          padding: '0.75rem', 
          borderRadius: '8px', 
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.85rem'
        }}>
          <span>Enable notifications to get match updates!</span>
          <button 
            onClick={handleEnableNotifications}
            style={{
              background: 'white',
              color: 'var(--primary)',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Enable
          </button>
        </div>
      )} */}
      
      <div 
        className="card"
        style={{
          padding: 0,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '3px solid var(--primary)',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ padding: '0.75rem 1rem', background: 'var(--card-bg)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {users.length > 0 && (() => {
                const { rank } = getUserRankInfo();
                const rankStyle = getRankStyle(rank);
                return <span style={{ fontWeight: '700', ...rankStyle }}>{getRankDisplay(rank)}</span>;
              })()}
              <img 
                src={getUserPhoto(user.name)}
                alt={user.name}
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                onError={(e) => { 
                  e.target.onerror = null; 
                  e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%231a73e8'/%3E%3Ctext x='50%25' y='50%25' font-size='18' text-anchor='middle' dy='.3em' fill='white' font-weight='bold'%3E${user.name.charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E`; 
                }}
              />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>{user.name}</h3>
            </div>
            {users.length > 0 && (() => {
              const totalPoints = calculateTotalPoints(users.find(u => u.id === user.id) || {});
              return (
                <div style={{ fontWeight: '700', fontSize: '1.2rem', color: 'var(--primary)' }}>
                  {totalPoints} pts
                </div>
              );
            })()}
          </div>
          {users.length > 0 && (() => {
            const { tiedUsers } = getUserRankInfo();
            if (tiedUsers.length > 0) {
              return (
                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tied with:</span>
                  <div 
                    style={{ display: 'flex', gap: '0.25rem', cursor: 'pointer' }}
                    onClick={() => setShowTiedUsers(!showTiedUsers)}
                  >
                    {tiedUsers.map((name) => (
                      <img 
                        key={name}
                        src={getUserPhoto(name)}
                        alt={name}
                        title={name}
                        style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--primary)' }}
                        onError={(e) => { 
                          e.target.onerror = null; 
                          e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='12' fill='%231a73e8'/%3E%3Ctext x='50%25' y='50%25' font-size='12' text-anchor='middle' dy='.3em' fill='white' font-weight='bold'%3E${name.charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E`; 
                        }}
                      />
                    ))}
                  </div>
                  {showTiedUsers && (
                    <div 
                      style={{ 
                        position: 'absolute', 
                        top: '100%', 
                        left: '5rem',
                        marginTop: '0.25rem',
                        background: 'var(--card-bg)', 
                        border: '1px solid var(--border)', 
                        borderRadius: '8px', 
                        padding: '0.5rem', 
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        zIndex: 10,
                        fontSize: '0.85rem'
                      }}
                    >
                      {tiedUsers.join(', ')}
                    </div>
                  )}
                </div>
              );
            }
            return null;
          })()}
        </div>

        <div style={{ display: 'flex', height: '180px' }}>
          {teams.team1 && (
            <div style={{ flex: 1, position: 'relative', borderRight: `3px solid ${getFlagBorderColor(teams.team1.is_top)}` }}>
              <img 
                src={getFlagUrl(teams.team1.country)}
                alt={teams.team1.country}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.onerror = null; e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='120'%3E%3Crect fill='%23ddd' width='100' height='120'/%3E%3C/svg%3E`; }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 40%, transparent 70%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', padding: '1rem 0.75rem' }}>
                <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'white', marginBottom: '0.5rem', textAlign: 'center', lineHeight: '1.2' }}>
                  {teams.team1.name}
                </div>
                {teams.team1.stats && (
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.85rem', fontWeight: '600' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1rem' }}>
                      <span style={{ color: '#4ade80', fontSize: '1.1rem' }}>{teams.team1.stats.wins || 0}</span>
                      <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}>W</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1rem' }}>
                      <span style={{ color: '#fbbf24', fontSize: '1.1rem' }}>{teams.team1.stats.draws || 0}</span>
                      <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}>D</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1rem' }}>
                      <span style={{ color: '#f87171', fontSize: '1.1rem' }}>{teams.team1.stats.losses || 0}</span>
                      <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}>L</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {teams.team2 && (
            <div style={{ flex: 1, position: 'relative', borderLeft: `3px solid ${getFlagBorderColor(teams.team2.is_top)}` }}>
              <img 
                src={getFlagUrl(teams.team2.country)}
                alt={teams.team2.country}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.onerror = null; e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='120'%3E%3Crect fill='%23ddd' width='100' height='120'/%3E%3C/svg%3E`; }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 40%, transparent 70%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', padding: '1rem 0.75rem' }}>
                <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'white', marginBottom: '0.5rem', textAlign: 'center', lineHeight: '1.2' }}>
                  {teams.team2.name}
                </div>
                {teams.team2.stats && (
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.85rem', fontWeight: '600' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1rem' }}>
                      <span style={{ color: '#4ade80', fontSize: '1.1rem' }}>{teams.team2.stats.wins || 0}</span>
                      <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}>W</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1rem' }}>
                      <span style={{ color: '#fbbf24', fontSize: '1.1rem' }}>{teams.team2.stats.draws || 0}</span>
                      <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}>D</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1rem' }}>
                      <span style={{ color: '#f87171', fontSize: '1.1rem' }}>{teams.team2.stats.losses || 0}</span>
                      <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}>L</span>
                    </div>
                  </div>
                )}
              </div>
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

      {winAnimationData && (() => {
        console.log('Rendering animation with:', {
          team1Name: winAnimationData.team_name,
          team1Country: winAnimationData.team_country,
          score1: winAnimationData.team_score,
          team2Name: winAnimationData.opponent_name,
          team2Country: winAnimationData.opponent_country,
          score2: winAnimationData.opponent_score
        });
        return (
          <WinAnimation 
            show={!!winAnimationData}
            team1Name={winAnimationData.team_name}
            team1Country={winAnimationData.team_country}
            team2Name={winAnimationData.opponent_name}
            team2Country={winAnimationData.opponent_country}
            score1={winAnimationData.team_score}
            score2={winAnimationData.opponent_score}
            opponentUsers={winAnimationData.opponent_users}
            onClose={handleWinAnimationClose}
          />
        );
      })()}
    </div>
  );
}

export default Home;
