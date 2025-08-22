import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { useState, useEffect, useCallback } from "react";
import Home from "./pages/Home";
import Login from "./pages/login";
import Register from "./pages/register";
import Chat from "./components/Chat";
import Navbar from './components/Navbar';

function App() {
  // Initialize login state from sessionStorage
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const sessionLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    const hasToken = sessionStorage.getItem('token');
    console.log('=== APP INITIAL STATE ===');
    console.log('sessionStorage isLoggedIn:', sessionLoggedIn);
    console.log('hasToken:', !!hasToken);
    console.log('Initial isLoggedIn state:', sessionLoggedIn && hasToken);
    return sessionLoggedIn && hasToken;
  });

  // Helper function to clear all session data
  const clearUserSession = useCallback(() => {
    console.log('Clearing user session');
    sessionStorage.clear();
    // Also clear any localStorage items that might contain user data
    localStorage.removeItem('userToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('isLoggedIn');
  }, []);

  // Update user activity timestamp
  const updateUserActivity = useCallback(() => {
    const sessionDataStr = sessionStorage.getItem('sessionData');
    if (sessionDataStr) {
      try {
        const sessionData = JSON.parse(sessionDataStr);
        sessionData.lastActivity = new Date().toISOString();
        sessionStorage.setItem('sessionData', JSON.stringify(sessionData));
        
        // Send heartbeat to server
        fetch('https://ocelotcubs.onrender.com/api/heartbeat', {
          method: 'POST',
          credentials: 'include',
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

  // Handle explicit logout (called from Navbar or other components)
  const handleLogout = useCallback(() => {
    console.log('Handling explicit logout');
    
    // Send logout request to server
    fetch('https://ocelotcubs.onrender.com/api/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        action: 'logout',
        reason: 'user_logout',
        timestamp: new Date().toISOString()
      })
    }).catch(err => console.log('Logout request failed:', err));

    // Clear session and update state
    clearUserSession();
    setIsLoggedIn(false);
  }, [clearUserSession]);

  // Handle browser/tab close (only for cleanup)
  const handleBeforeUnload = useCallback(() => {
    console.log('Browser/tab closing - cleaning up session');
    
    // Send logout signal to server using sendBeacon (more reliable for page unload)
    if (isLoggedIn) {
      navigator.sendBeacon(
        'https://ocelotcubs.onrender.com/api/logout', 
        JSON.stringify({
          action: 'logout',
          reason: 'browser_close',
          timestamp: new Date().toISOString()
        })
      );
    }
    
    clearUserSession();
  }, [isLoggedIn, clearUserSession]);

  // REMOVED: No longer clearing session data on every isLoggedIn change
  // This was interfering with the login process

  // Set up browser close handler only
  useEffect(() => {
    // Only handle actual browser/tab close, not other window events
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [handleBeforeUnload]);

  // Set up activity tracking for logged-in users
  useEffect(() => {
    let activityInterval;

    if (isLoggedIn) {
      console.log('Setting up activity tracking');
      
      // Update activity every 30 seconds while user is active and tab is visible
      activityInterval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          updateUserActivity();
        }
      }, 30000); // 30 seconds

      // Track user interactions to update activity
      const trackActivity = () => {
        updateUserActivity();
      };

      // Add lightweight activity tracking
      document.addEventListener('click', trackActivity);
      document.addEventListener('keydown', trackActivity);

      return () => {
        if (activityInterval) {
          clearInterval(activityInterval);
        }
        document.removeEventListener('click', trackActivity);
        document.removeEventListener('keydown', trackActivity);
      };
    }
  }, [isLoggedIn, updateUserActivity]);

  // Validate session periodically (optional - less aggressive approach)
  useEffect(() => {
    if (isLoggedIn) {
      const validateSession = () => {
        const sessionValid = sessionStorage.getItem('isLoggedIn') === 'true';
        const hasToken = sessionStorage.getItem('token');
        
        if (!sessionValid || !hasToken) {
          console.log('Session invalid - logging out');
          setIsLoggedIn(false);
          clearUserSession();
        }
      };

      // Check session validity every 5 minutes (much less aggressive)
      const validationInterval = setInterval(validateSession, 5 * 60 * 1000);

      return () => clearInterval(validationInterval);
    }
  }, [isLoggedIn, clearUserSession]);

  return (
    <Router>
      <Navbar 
        isLoggedIn={isLoggedIn} 
        setIsLoggedIn={setIsLoggedIn}
        onLogout={handleLogout} // Pass the proper logout handler
      />
      <Routes>
        <Route path="/" element={<Home isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/register" element={<Register setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Router>
  );
}

export default App;