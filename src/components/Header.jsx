import { NavLink } from 'react-router-dom';

function Header({ user, onLogout }) {
  const getUserPhoto = (name) => {
    const fileName = name.toLowerCase().replace(/\s+/g, '-');
    return `/users/${fileName}.png`;
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="user-profile">
          <img 
            src={getUserPhoto(user.name)}
            alt={user.name}
            className="user-avatar"
            onError={(e) => { 
              e.target.onerror = null; 
              e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%231a73e8'/%3E%3Ctext x='50%25' y='50%25' font-size='18' text-anchor='middle' dy='.3em' fill='white' font-weight='bold'%3E${user.name.charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E`; 
            }}
          />
          <span className="user-name-header">{user.name}</span>
        </div>
        <nav className="nav">
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            Home
          </NavLink>
          <NavLink to="/leaderboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            Leaderboard
          </NavLink>
          <button onClick={onLogout} className="nav-item" style={{border: 'none', background: 'none', cursor: 'pointer'}}>
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
