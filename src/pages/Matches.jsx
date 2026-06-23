import { useState, useEffect } from 'react';
import api from '../utils/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorWithRetry from '../components/ErrorWithRetry';
import usePullToRefresh from '../hooks/usePullToRefresh';

function Matches() {
  const [matches, setMatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');

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

  const getUsersForTeam = (teamName) => {
    return users.filter(user => 
      user.team1_name === teamName || user.team2_name === teamName
    );
  };

  const fetchMatches = async () => {
    try {
      const [matchesRes, usersRes] = await Promise.all([
        api.get('/matches'),
        api.get('/users')
      ]);
      setMatches(Array.isArray(matchesRes.data) ? matchesRes.data : []);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const { isPulling } = usePullToRefresh(fetchMatches);

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString, timezone) => {
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

  const formatTime = (dateString, timezone) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true
    });
  };

  const upcomingMatches = matches.filter(m => m.status === 'scheduled' || m.status === 'live');
  const pastMatches = matches.filter(m => m.status === 'finished');

  const groupMatchesByDate = (matchList) => {
    const grouped = {};
    matchList.forEach(match => {
      const dateKey = new Date(match.match_date).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(match);
    });
    return grouped;
  };

  const upcomingByDate = groupMatchesByDate(upcomingMatches);
  const pastByDate = groupMatchesByDate(pastMatches);

  const renderMatch = (match) => {
    const team1Users = getUsersForTeam(match.team1_name);
    const team2Users = getUsersForTeam(match.team2_name);
    
    return (
      <div key={match.id} className="match-item">
        <div className="match-time">
          {formatTime(match.match_date, match.timezone)}
          {match.timezone && match.location && (
            <span className="match-timezone" title={match.timezone}>
              {' '}• {match.location}
            </span>
          )}
        </div>
        <div className="match-content">
          <div className="match-team">
            <img 
              src={getFlagUrl(match.team1_country)} 
              alt={match.team1_country}
              className="match-flag"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="team-info">
              <span className="team-name">{match.team1_name}</span>
              {team1Users.length > 0 && (
                <div className="team-users">
                  {team1Users.map(user => (
                    <img
                      key={user.id}
                      src={getUserPhoto(user.name)}
                      alt={user.name}
                      className="user-avatar-tiny"
                      title={user.name}
                      onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Ccircle cx='10' cy='10' r='10' fill='%231a73e8'/%3E%3Ctext x='50%25' y='50%25' font-size='10' text-anchor='middle' dy='.35em' fill='white' font-weight='bold'%3E${user.name.charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E`; 
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="match-score-section">
            {match.status === 'finished' ? (
              <div className="match-score">
                <span className={match.score1 > match.score2 ? 'winner-score' : ''}>{match.score1}</span>
                <span> - </span>
                <span className={match.score2 > match.score1 ? 'winner-score' : ''}>{match.score2}</span>
              </div>
            ) : match.status === 'live' ? (
              <div className="match-status live-status">LIVE 🔴</div>
            ) : (
              <div className="match-status">vs</div>
            )}
          </div>

          <div className="match-team">
            <div className="team-info">
              <span className="team-name">{match.team2_name}</span>
              {team2Users.length > 0 && (
                <div className="team-users">
                  {team2Users.map(user => (
                    <img
                      key={user.id}
                      src={getUserPhoto(user.name)}
                      alt={user.name}
                      className="user-avatar-tiny"
                      title={user.name}
                      onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Ccircle cx='10' cy='10' r='10' fill='%231a73e8'/%3E%3Ctext x='50%25' y='50%25' font-size='10' text-anchor='middle' dy='.35em' fill='white' font-weight='bold'%3E${user.name.charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E`; 
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            <img 
              src={getFlagUrl(match.team2_country)} 
              alt={match.team2_country}
              className="match-flag"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        </div>
        
        {match.location && (
          <div className="match-location">📍 {match.location}</div>
        )}
      </div>
    );
  };

  const renderMatchesByDate = (matchesByDate) => {
    const sortedDates = Object.keys(matchesByDate).sort((a, b) => {
      if (activeTab === 'upcoming') {
        return new Date(a) - new Date(b);
      } else {
        return new Date(b) - new Date(a);
      }
    });

    return sortedDates.map(dateKey => {
      const dateMatches = matchesByDate[dateKey];
      const firstMatch = dateMatches[0];
      
      return (
        <div key={dateKey} className="date-group">
          <div className="date-header">
            <span className="date-label">{formatDate(firstMatch.match_date, firstMatch.timezone)}</span>
            <span className="date-count">{dateMatches.length} match{dateMatches.length !== 1 ? 'es' : ''}</span>
          </div>
          <div className="matches-list">
            {dateMatches.map(renderMatch)}
          </div>
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="container">
        <h2>⚽ Matches</h2>
        <div className="tabs">
          <div className="tab active">Upcoming</div>
          <div className="tab">Past</div>
        </div>
        <LoadingSkeleton type="match" />
        <LoadingSkeleton type="match" />
        <LoadingSkeleton type="match" />
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
      
      <div className="page-content">
        <h2>⚽ All Matches</h2>
      
      {error && <ErrorWithRetry message={error} onRetry={fetchMatches} />}
      
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          📅 Upcoming ({upcomingMatches.length})
        </button>
        <button 
          className={`tab ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          📊 Past ({pastMatches.length})
        </button>
      </div>

      <div className="matches-container">
        {activeTab === 'upcoming' ? (
          Object.keys(upcomingByDate).length > 0 ? (
            renderMatchesByDate(upcomingByDate)
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <p>No upcoming matches</p>
            </div>
          )
        ) : (
          Object.keys(pastByDate).length > 0 ? (
            renderMatchesByDate(pastByDate)
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <p>No past matches yet</p>
            </div>
          )
        )}
      </div>
      </div>
    </div>
  );
}

export default Matches;
