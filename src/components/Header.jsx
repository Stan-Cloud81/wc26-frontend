import { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import useTheme from '../hooks/useTheme';

function Header({ onLogout, user }) {
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getUserPhoto = (name) => {
    const fileName = name.toLowerCase().replace(/\s+/g, '-');
    return `/users/${fileName}.png`;
  };

  const getUserInitial = (name) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="header">
      <div className="header-content">
        <nav className="nav">
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            Home
          </NavLink>
          <NavLink to="/family" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            Family
          </NavLink>
          <NavLink to="/standings" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            Standings
          </NavLink>
        </nav>
        <div className="user-menu" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)} 
            className="user-menu-button"
            aria-label="User menu"
          >
            <img 
              src={getUserPhoto(user.name)}
              alt={user.name}
              className="user-avatar"
              onError={(e) => { 
                e.target.onerror = null; 
                e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ccircle cx='16' cy='16' r='16' fill='%23ffffff'/%3E%3Ctext x='50%25' y='50%25' font-size='16' text-anchor='middle' dy='.35em' fill='%233CAC3B' font-weight='bold'%3E${getUserInitial(user.name)}%3C/text%3E%3C/svg%3E`; 
              }}
            />
          </button>
          {dropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-item user-info-item">
                <strong>{user.name}</strong>
              </div>
              <button onClick={() => { toggleTheme(); setDropdownOpen(false); }} className="dropdown-item">
                {theme === 'light' ? '🌙' : '☀️'} {theme === 'light' ? 'Dark' : 'Light'} Mode
              </button>
              <button onClick={() => { onLogout(); setDropdownOpen(false); }} className="dropdown-item logout-item">
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
