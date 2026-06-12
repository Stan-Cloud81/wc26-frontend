import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from './config';
import Login from './pages/Login';
import Home from './pages/Home';
import Leaderboard from './pages/Leaderboard';
import Header from './components/Header';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('App mounted');
    const savedUser = localStorage.getItem('wc26_user');
    console.log('Saved user:', savedUser);
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Error parsing saved user:', err);
        localStorage.removeItem('wc26_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    console.log('Login with user:', userData);
    setUser(userData);
    localStorage.setItem('wc26_user', JSON.stringify(userData));
  };

  const logout = async () => {
    console.log('Logout');
    if (user) {
      try {
        await axios.post(`${API_URL}/auth/logout`, { user_id: user.id });
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    setUser(null);
    localStorage.removeItem('wc26_user');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  console.log('Current user:', user);

  return (
    <BrowserRouter>
      {user && <Header user={user} onLogout={logout} />}
      <Routes>
        <Route 
          path="/login" 
          element={!user ? <Login onLogin={login} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/" 
          element={user ? <Home user={user} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/leaderboard" 
          element={user ? <Leaderboard user={user} /> : <Navigate to="/login" />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
