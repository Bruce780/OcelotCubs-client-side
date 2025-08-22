import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { useState, useEffect, useCallback } from "react";
import Home from "./pages/Home";
import Login from "./pages/login";
import Register from "./pages/register";
import Chat from "./components/Chat";
import Navbar from './components/Navbar';

function App() {
  // Use sessionStorage instead of localStorage for immediate logout on tab close
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const sessionLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    const hasToken = sessionStorage.getItem('token');
    console.log('=== APP INITIAL STATE ===');
    console.log('sessionStorage isLoggedIn:', sessionLoggedIn);
    console.log('hasToken:', !!hasToken);
    console.log('Initial isLoggedIn state:', sessionLoggedIn && hasToken);
    return sessionLoggedIn && hasToken;
  });

  // Helper functions - defined first to avoid hoisting issues
  const generateSessionId = useCallback(() => {
    return 'sess_' + Math.random().toString(36).substr(2, 16);
  }, []);

  const clearUserSession = useCallback(() => {
    sessionStorage.clear();
    // Also clear any localStorage items that might contain user data
    localStorage.removeItem('userToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('isLoggedIn'); // Remove old localStorage usage
  }, []);

  const updateUserActivity = useCallback(() => {
    const sessionDataStr = sessionStorage.getItem('sessionData');
    if (sessionDataStr) {
      try {
        const sessionData = JSON.parse(sessionDataStr);
        sessionData.lastActivity = new Date().toISOString();
        sessionStorage.setItem('sessionData', JSON.stringify(sessionData));
        
        // Send heartbeat to server
        fetch('/api/heartbeat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lastActivity: sessionData.lastActivity
          })
        }).catch(err => console.log('Heartbeat failed:', err));
      } catch (e) {
        console.error('Error updating activity:', e);
      }
    }
  }, []);

  const handleUserExit = useCallback(() => {
    console.log('User exited - clearing session');
    clearUserSession();
    setIsLoggedIn(false);
    
    // Send logout request to server
    fetch('https://ocelotcubs.onrender.com/api/logout', {
      method: 'POST',
      credentials: 'include', // Include session cookies
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        action: 'logout',
        reason: 'user_exit'
      })
    }).catch(err => console.log('Logout request failed:', err));
  }, [clearUserSession]);

  const checkSessionValidity = useCallback(() => {
    const sessionValid = sessionStorage.getItem('isLoggedIn') === 'true';
    const sessionData = sessionStorage.getItem('sessionData');
    
    if (!sessionValid || !sessionData) {
      // Session is invalid - force logout
      setIsLoggedIn(false);
      clearUserSession();
    }
  }, [clearUserSession]);

  // Session management logic
  useEffect(() => {
    // Update session storage when login state changes
    sessionStorage.setItem('isLoggedIn', isLoggedIn);
    
    // If user logs in, store additional session data
    if (isLoggedIn) {
      const sessionData = {
        loginTime: new Date().toISOString(),
        sessionId: generateSessionId(),
        lastActivity: new Date().toISOString()
      };
      sessionStorage.setItem('sessionData', JSON.stringify(sessionData));
    } else {
      // Clear all session data on logout
      sessionStorage.removeItem('sessionData');
      sessionStorage.removeItem('userToken');
      sessionStorage.removeItem('userId');
    }
  }, [isLoggedIn, generateSessionId]);

  // Setup session management event listeners
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear session when user closes tab/browser
      clearUserSession();
      
      // Send logout signal to server
      if (isLoggedIn) {
        navigator.sendBeacon('/api/logout', JSON.stringify({
          action: 'logout',
          timestamp: new Date().toISOString()
        }));
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isLoggedIn) {
        // User switched tabs or minimized - log them out
        handleUserExit();
      } else if (document.visibilityState === 'visible') {
        // User returned - check if session is still valid
        checkSessionValidity();
      }
    };

    const handleWindowBlur = () => {
      if (isLoggedIn) {
        // User left the window
        handleUserExit();
      }
    };

    const handleWindowFocus = () => {
      // User returned to window - validate session
      checkSessionValidity();
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [isLoggedIn, handleUserExit, checkSessionValidity, clearUserSession]);

  // Setup activity tracking for active sessions
  useEffect(() => {
    let activityInterval;

    if (isLoggedIn) {
      // Update activity every 30 seconds while user is active
      activityInterval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          updateUserActivity();
        }
      }, 30000); // 30 seconds
    }

    return () => {
      if (activityInterval) {
        clearInterval(activityInterval);
      }
    };
  }, [isLoggedIn, updateUserActivity]);

  return (
    <Router>
      <Navbar 
        isLoggedIn={isLoggedIn} 
        setIsLoggedIn={setIsLoggedIn}
        onLogout={clearUserSession}
      />
      <Routes>
        <Route path="/" element={<Home isLoggedIn={isLoggedIn} />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/register" element={<Register setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Router>
  );
}

export default App;