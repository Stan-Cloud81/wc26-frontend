import { NavLink } from 'react-router-dom';

function Header({ user, onLogout }) {
  return (
    <header className="header">
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
        <button onClick={onLogout} className="nav-item" style={{border: 'none', background: 'none', cursor: 'pointer'}}>
          Logout
        </button>
      </nav>
    </header>
  );
}

export default Header;
