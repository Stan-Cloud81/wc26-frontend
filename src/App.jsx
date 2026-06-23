import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from './utils/api';
import { showToast } from './utils/toast';
import Login from './pages/Login';
import Home from './pages/Home';
import Family from './pages/Family';
import Standings from './pages/Standings';
import Matches from './pages/Matches';
import Header from './components/Header';

const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === 'true';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [, setDeferredPrompt] = useState(null);

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

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (DEBUG_MODE) {
        console.log('beforeinstallprompt event fired');
        showToast('App can be installed', 'info');
      }
    };

    const handleAppInstalled = async () => {
      if (DEBUG_MODE) {
        console.log('App was installed');
        showToast('App installed successfully!', 'success');
      }
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(async () => {
        if (DEBUG_MODE) {
          console.log('Service Worker is ready');
        }
      }).catch((err) => {
        if (DEBUG_MODE) {
          console.error('Service Worker error:', err);
          showToast(`Service Worker error: ${err.message}`, 'error');
        }
      });
    }

    window.addEventListener('error', (e) => {
      if (DEBUG_MODE) {
        console.error('Global error:', e.error);
        showToast(`Error: ${e.error?.message || 'Unknown error'}`, 'error');
      }
    });

    window.addEventListener('unhandledrejection', (e) => {
      if (DEBUG_MODE) {
        console.error('Unhandled promise rejection:', e.reason);
        showToast(`Promise error: ${e.reason?.message || 'Unknown error'}`, 'error');
      }
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const login = async (userData) => {
    console.log('Login with user:', userData);
    setUser(userData);
    localStorage.setItem('wc26_user', JSON.stringify(userData));
  };

  const logout = async () => {
    console.log('Logout');
    if (user) {
      try {
        await api.post(`/auth/logout`, { user_id: user.id });
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
      <AppRoutes user={user} login={login} logout={logout} />
    </BrowserRouter>
  );
}

function AppRoutes({ user, login, logout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);
  const [touchEndY, setTouchEndY] = useState(null);
  const [direction, setDirection] = useState('forward');

  const minSwipeDistance = 50;
  const maxSwipeAngle = 30;

  const pages = ['/', '/family', '/matches', '/standings'];

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchEndY(null);
    setTouchStart(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
    setTouchEndY(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !touchStartY || !touchEndY) return;
    
    const distanceX = touchStart - touchEnd;
    const distanceY = touchStartY - touchEndY;
    
    const angle = Math.abs(Math.atan2(distanceY, distanceX) * (180 / Math.PI));
    
    if (angle > maxSwipeAngle && angle < (180 - maxSwipeAngle)) {
      return;
    }
    
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;

    const currentIndex = pages.indexOf(location.pathname);
    
    if (isLeftSwipe && currentIndex < pages.length - 1) {
      setDirection('forward');
      navigate(pages[currentIndex + 1]);
    }
    
    if (isRightSwipe && currentIndex > 0) {
      setDirection('backward');
      navigate(pages[currentIndex - 1]);
    }
  };

  useEffect(() => {
    if (!user) return;

    document.addEventListener('touchstart', onTouchStart);
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchend', onTouchEnd);

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [touchStart, touchEnd, touchStartY, touchEndY, location.pathname, user]);

  return (
    <>
      {user && <Header user={user} onLogout={logout} />}
      <div className={`page-transition ${direction}`} key={location.pathname}>
        <Routes location={location}>
          <Route 
            path="/login" 
            element={!user ? <Login onLogin={login} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/" 
            element={user ? <Home user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/family" 
            element={user ? <Family user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/matches" 
            element={user ? <Matches /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/standings" 
            element={user ? <Standings user={user} /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </>
  );
}

export default App;
