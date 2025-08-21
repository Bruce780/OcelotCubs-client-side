import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const profileImageBase64 = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgdmlld0JveD0iMCAwIDI1NiAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiBmaWxsPSIjNjM2NkYxIi8+Cjx0ZXh0IHg9IjEyOCIgeT0iMTM1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5FQjwvdGV4dD4KPHN2Zz4=";
function Home() {
  const [games, setGames] = useState([]);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // API base URL with environment variable support
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    // Fetch the games from backend
    const fetchGames = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/games`);
        setGames(res.data);
      } catch (err) {
        console.error("Failed to fetch games:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();

    // Check if user is logged in with error handling
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Invalid user data in localStorage:", err);
        localStorage.removeItem("user");
      }
    }
  }, [API_BASE_URL]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  // Filter games based on search
  const filteredGames = games.filter((game) =>
    game.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-100 to-gray-200 text-gray-900 p-6">
      {/* Title */}
      <h1 className="text-5xl font-extrabold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 drop-shadow-lg">
        🎮 Ocelot Cubs
      </h1>

      {/* Search Bar */}
      <div className="flex justify-center mb-10">
        <input
          type="text"
          placeholder="Search games..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-5 py-3 w-full max-w-lg bg-white border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
        />
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
          <span className="ml-4 text-lg text-gray-600">Loading games...</span>
        </div>
      ) : (
        /* Game List */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredGames.length > 0 ? (
            filteredGames.map((game) => (
              <div
                key={game._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:scale-105 p-4 border border-gray-200"
              >
                <img
                  src={game.image}
                  alt={game.title}
                  className="w-full h-48 object-cover rounded-xl mb-3"
                />
                <h2 className="text-2xl font-bold mb-2 text-gray-800">
                  {game.title}
                </h2>
                <p className="text-sm text-gray-600">{game.description}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 col-span-full">
              No games found.
            </p>
          )}
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-center mt-12 gap-6 flex-wrap items-center">
        {user ? (
          <>
            <span className="text-lg font-medium">
              Hello,{" "}
              <span className="font-bold text-purple-600">
                {user.name || "User"}
              </span>{" "}
              👋
            </span>
            <Link
              to="/chat"
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-full font-bold shadow-md hover:shadow-lg hover:scale-105 transition"
            >
              Chat
            </Link>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-full font-bold shadow-md hover:shadow-lg hover:scale-105 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full font-bold shadow-md hover:shadow-lg hover:scale-105 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-full font-bold shadow-md hover:shadow-lg hover:scale-105 transition"
            >
              Register
            </Link>
          </>
        )}
      </div>

    {/* About Me Section - SIMPLE TEST VERSION */}
<div className="mt-20 max-w-4xl mx-auto">
  <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
    <h2 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400">
      About Me
    </h2>
    
    {/* Simple test - just the image */}
    <div className="text-center mb-8">
      <h3>Testing Image:</h3>
      <img
        src={profileImageBase64}
        alt="Testing Base64 rendering"
        style={{ width: '200px', height: '200px', border: '2px solid red' }}
      />
      <p>If you see a red border but no image, the Base64 isn't working.</p>
      <p>If you see nothing at all, there's a bigger issue.</p>
    </div>
    
    {/* Your content */}
    <div className="text-center">
      <h3 className="text-2xl font-bold text-gray-800">Hi, I'm Igbinedion Eghosa Bruce!</h3>
      <p className="text-gray-600 leading-relaxed mt-4">
        I'm a passionate full-stack developer who loves creating interactive web experiences.
      </p>
    </div>
  </div>
</div>
              
        <>
          <div className="pt-4">
            <p className="text-gray-600 italic">
              "Building the future, one line of code at a time." 
            </p>
          </div>
        </>
      </div>
  );
}

export default Home;