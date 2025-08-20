import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar({ isLoggedIn, setIsLoggedIn }) {
  const loggedIn = isLoggedIn || localStorage.getItem('isLoggedIn') === 'true';

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, [setIsLoggedIn]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('token');
    localStorage.setItem('isLoggedIn', 'false');
    window.location.reload(); // Reload to reset state
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
              <Link to="/" className="text-white hover:underline mr-4">
                
              </Link>
              <button onClick={handleLogout} className="text-white hover:underline">
                
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white hover:underline mr-4">
              
              </Link>
              <Link to="/register" className="text-white hover:underline">
              
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
