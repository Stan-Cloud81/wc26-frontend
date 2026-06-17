import { useState, useEffect } from 'react';

function WinAnimation({ show, team1Name, team1Country, team2Name, team2Country, score1, score2, onClose }) {
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (show) {
      setVisible(true);
      setCountdown(5);
      
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 500);
      }, 5000);
      
      return () => {
        clearTimeout(timer);
        clearInterval(countdownInterval);
      };
    }
  }, [show, onClose]);

  if (!show && !visible) return null;

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

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.95)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        animation: visible ? 'fadeIn 0.5s ease-in' : 'fadeOut 0.5s ease-out',
        opacity: visible ? 1 : 0
      }}
    >
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }
          @keyframes slideDown {
            from { 
              transform: translateY(-100px);
              opacity: 0;
            }
            to { 
              transform: translateY(0);
              opacity: 1;
            }
          }
          @keyframes scaleIn {
            from { 
              transform: scale(0);
              opacity: 0;
            }
            to { 
              transform: scale(1);
              opacity: 1;
            }
          }
          @keyframes bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          @keyframes celebrate {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-5deg); }
            75% { transform: rotate(5deg); }
          }
        `}
      </style>

      <div 
        style={{
          fontSize: '4rem',
          fontWeight: '900',
          color: '#3CAC3B',
          textShadow: '0 0 20px rgba(60, 172, 59, 0.8), 0 0 40px rgba(60, 172, 59, 0.6)',
          marginBottom: '2rem',
          animation: 'slideDown 0.8s ease-out, bounce 1s ease-in-out 0.8s infinite',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          whiteSpace: 'nowrap'
        }}
      >
        🎉 Victory! 🎉
      </div>

      <div 
        style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
          animation: 'scaleIn 0.6s ease-out 0.3s backwards',
          maxWidth: '500px',
          width: '90%'
        }}
      >
        <div 
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '1.5rem',
            gap: '1rem'
          }}
        >
          <div 
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
              animation: 'celebrate 1s ease-in-out 1s infinite'
            }}
          >
            <img 
              src={getFlagUrl(team1Country)}
              alt={team1Country}
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '5px solid #3CAC3B',
                boxShadow: '0 0 20px rgba(60, 172, 59, 0.6)'
              }}
            />
            <div 
              style={{
                fontWeight: '700',
                fontSize: '1.1rem',
                color: '#3CAC3B',
                textAlign: 'center'
              }}
            >
              {team1Name}
            </div>
          </div>

          <div 
            style={{
              fontSize: '3rem',
              fontWeight: '900',
              color: '#474A4A',
              padding: '0 1.5rem',
              animation: 'scaleIn 0.8s ease-out 0.6s backwards',
              whiteSpace: 'nowrap'
            }}
          >
            {score1} - {score2}
          </div>

          <div 
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
              opacity: 0.5
            }}
          >
            <img 
              src={getFlagUrl(team2Country)}
              alt={team2Country}
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '5px solid #D1D4D1',
                filter: 'grayscale(50%)'
              }}
            />
            <div 
              style={{
                fontWeight: '700',
                fontSize: '1.1rem',
                color: '#6c757d',
                textAlign: 'center'
              }}
            >
              {team2Name}
            </div>
          </div>
        </div>

        <div 
          style={{
            textAlign: 'center',
            fontSize: '1.2rem',
            fontWeight: '700',
            color: '#3CAC3B',
            marginTop: '1.5rem',
            animation: 'slideDown 0.8s ease-out 0.9s backwards'
          }}
        >
          +3 Points! 🏆
        </div>
      </div>

      <div 
        style={{
          marginTop: '2rem',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '0.9rem',
          animation: 'fadeIn 1s ease-in 1.5s backwards'
        }}
      >
        Auto-closing in {countdown} second{countdown !== 1 ? 's' : ''}...
      </div>
    </div>
  );
}

export default WinAnimation;
