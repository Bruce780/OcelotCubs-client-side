import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ isLoggedIn, setIsLoggedIn, onLogout }) {
  const navigate = useNavigate();
  
  // Check session storage instead of localStorage
  const loggedIn = isLoggedIn || sessionStorage.getItem('isLoggedIn') === 'true';

  useEffect(() => {
    // Check both sessionStorage and server session on component mount
    const checkAuthStatus = async () => {
      const sessionLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
      const token = sessionStorage.getItem("token");
      
      if (sessionLoggedIn && token) {
        // Verify with server that session is still valid
        try {
          const response = await fetch('/api/session-status', {
            method: 'GET',
            credentials: 'include', // Include session cookies
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          const data = await response.json();
          
          if (data.isLoggedIn) {
            setIsLoggedIn(true);
          } else {
            // Server session expired, clear client session
            clearClientSession();
            setIsLoggedIn(false);
          }
        } catch (error) {
          console.error('Error checking session status:', error);
          // On error, assume session is invalid
          clearClientSession();
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    checkAuthStatus();
  }, [setIsLoggedIn]);

  const clearClientSession = () => {
    // Clear all session data
    sessionStorage.clear();
    // Also clear any remaining localStorage items
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userId');
  };

  const handleLogout = async () => {
    try {
      // Send logout request to server
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include', // Include session cookies
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        console.log('Server logout successful');
      } else {
        console.warn('Server logout failed, but proceeding with client logout');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Continue with client-side logout even if server request fails
    }

    // Clear client session
    clearClientSession();
    setIsLoggedIn(false);
    
    // Call the onLogout callback from App.js if provided
    if (onLogout) {
      onLogout();
    }
    
    // Navigate to home page
    navigate('/');
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-lg font-bold">
          Ocelot Cubs Games
        </Link>
        <div>
          {loggedIn ? (
            <>
              <Link to="/chat" className="text-white hover:underline mr-4">
                Chat
              </Link>
              <Link to="/" className="text-white hover:underline mr-4">
                Home
              </Link>
              <button 
                onClick={handleLogout} 
                className="text-white hover:underline bg-red-600 px-3 py-1 rounded transition-colors hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white hover:underline mr-4">
                Login
              </Link>
              <Link to="/register" className="text-white hover:underline">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}