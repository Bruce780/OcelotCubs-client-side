import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ isLoggedIn, setIsLoggedIn, onLogout }) {
  const navigate = useNavigate();
  
  // Check both props and sessionStorage for login state
  const sessionLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
  const hasToken = sessionStorage.getItem('token');
  const loggedIn = isLoggedIn || (sessionLoggedIn && hasToken);

  console.log('=== NAVBAR RENDER DEBUG ===');
  console.log('isLoggedIn prop:', isLoggedIn);
  console.log('sessionStorage isLoggedIn:', sessionLoggedIn);
  console.log('hasToken:', !!hasToken);
  console.log('Final loggedIn state:', loggedIn);

  useEffect(() => {
    // Check both sessionStorage and server session on component mount
    const checkAuthStatus = async () => {
      const sessionLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
      const token = sessionStorage.getItem("token");
      
      console.log('=== NAVBAR AUTH CHECK ===');
      console.log('sessionLoggedIn:', sessionLoggedIn);
      console.log('hasToken:', !!token);
      
      if (sessionLoggedIn && token) {
        // Update parent state if not already set
        if (!isLoggedIn) {
          console.log('📝 Updating parent isLoggedIn state to true');
          setIsLoggedIn(true);
        }
        
        // Verify with server that session is still valid
        try {
          const response = await fetch('https://ocelotcubs.onrender.com/api/session-status', {
            method: 'GET',
            credentials: 'include', // Include session cookies
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          const data = await response.json();
          console.log('Server session status:', data);
          
          if (data.isLoggedIn) {
            setIsLoggedIn(true);
          } else {
            // Server session expired, clear client session
            console.log('❌ Server session expired, clearing client session');
            clearClientSession();
            setIsLoggedIn(false);
          }
        } catch (error) {
          console.error('Error checking session status:', error);
          // On error, keep client session but don't fail
        }
      } else {
        console.log('❌ No valid client session found');
        setIsLoggedIn(false);
      }
    };

    checkAuthStatus();
  }, [setIsLoggedIn, isLoggedIn]); // Added isLoggedIn to deps

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
      // Send logout request to server - FIXED: Use correct backend URL
      const response = await fetch('https://ocelotcubs.onrender.com/api/logout', {
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