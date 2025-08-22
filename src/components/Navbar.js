import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ isLoggedIn, setIsLoggedIn, onLogout }) {
  const navigate = useNavigate();
  const [sessionChecked, setSessionChecked] = useState(false);
  
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
    // Only check auth status once when component mounts, and only if we have session data
    const checkAuthStatus = async () => {
      const sessionLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
      const token = sessionStorage.getItem("token");
      
      console.log('=== NAVBAR AUTH CHECK ===');
      console.log('sessionLoggedIn:', sessionLoggedIn);
      console.log('hasToken:', !!token);
      console.log('sessionChecked:', sessionChecked);
      
      if (sessionLoggedIn && token) {
        // Update parent state if not already set
        if (!isLoggedIn) {
          console.log('📝 Updating parent isLoggedIn state to true');
          setIsLoggedIn(true);
        }
        
        // FIXED: Only verify with server if we haven't checked recently
        // AND give the server time to establish the session
        if (!sessionChecked) {
          // Wait a moment for server session to be established
          setTimeout(async () => {
            try {
              const response = await fetch('https://ocelotcubs.onrender.com/api/session-status', {
                method: 'GET',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json',
                }
              });
              
              if (response.ok) {
                const data = await response.json();
                console.log('Server session status:', data);
                
                if (data.isLoggedIn) {
                  console.log('✅ Server session confirmed');
                  setIsLoggedIn(true);
                } else {
                  // FIXED: Don't immediately clear session - server might not be ready
                  console.log('⚠️ Server session not found, but keeping client session');
                  // Only clear if this was an explicit check after being logged in for a while
                  // For now, trust the client session
                }
              } else {
                console.log('Server session check failed, keeping client session');
              }
            } catch (error) {
              console.error('Error checking session status:', error);
              // On error, keep client session
              console.log('Keeping client session due to server error');
            }
            
            setSessionChecked(true);
          }, 1000); // Wait 1 second for server session to be ready
        }
      } else {
        console.log('❌ No valid client session found');
        if (isLoggedIn) {
          setIsLoggedIn(false);
        }
      }
    };

    // Only run this check once when component mounts
    if (!sessionChecked) {
      checkAuthStatus();
    }
  }, [isLoggedIn, sessionChecked, setIsLoggedIn]); // Include all dependencies

  // Separate effect to sync with prop changes
  useEffect(() => {
    const sessionLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    const hasToken = sessionStorage.getItem('token');
    
    // If we have session data but props don't reflect it, update props
    if (sessionLoggedIn && hasToken && !isLoggedIn) {
      console.log('🔄 Syncing props with session storage');
      setIsLoggedIn(true);
    }
  }, [isLoggedIn, setIsLoggedIn]);

  const clearClientSession = () => {
    console.log('🧹 Clearing client session');
    // Clear all session data
    sessionStorage.clear();
    // Also clear any remaining localStorage items
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userId');
    setSessionChecked(false); // Reset session check flag
  };

  const handleLogout = async () => {
    console.log('🚪 Handling logout');
    
    try {
      // Send logout request to server
      const response = await fetch('https://ocelotcubs.onrender.com/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        console.log('✅ Server logout successful');
      } else {
        console.warn('⚠️ Server logout failed, but proceeding with client logout');
      }
    } catch (error) {
      console.error('❌ Error during logout:', error);
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