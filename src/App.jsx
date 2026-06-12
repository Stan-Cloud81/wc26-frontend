import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from './utils/api';
import { clearAuthToken } from './utils/auth';
import { subscribeToPushNotifications } from './utils/notifications';
import { showToast } from './utils/toast';
import Login from './pages/Login';
import Home from './pages/Home';
import Family from './pages/Family';
import Header from './components/Header';

const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === 'true';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

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
      
      // if (user) {
      //   console.log('Subscribing to push notifications after app install...');
      //   await subscribeToPushNotifications(user.id);
      // }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(async () => {
        if (DEBUG_MODE) {
          console.log('Service Worker is ready');
        }
        
        // if (user) {
        //   console.log('Service Worker ready, subscribing to push notifications...');
        //   await subscribeToPushNotifications(user.id);
        // }
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
  }, [user]);

  const login = async (userData) => {
    console.log('Login with user:', userData);
    setUser(userData);
    localStorage.setItem('wc26_user', JSON.stringify(userData));
    
    // await subscribeToPushNotifications(userData.id);
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
          path="/family" 
          element={user ? <Family user={user} /> : <Navigate to="/login" />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
