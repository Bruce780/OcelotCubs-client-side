import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const profileImageBase64 = "data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='100' cy='100' r='90' fill='%234F46E5'/%3E%3Ctext x='100' y='115' font-family='Arial' font-size='60' fill='white' text-anchor='middle'%3EEB%3C/text%3E%3C/svg%3E";
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

   {/* About Me Section - FINAL VERSION */}
<div className="mt-20 max-w-4xl mx-auto">
  <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
    <h2 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400">
      About Me
    </h2>
    
    <div className="grid md:grid-cols-2 gap-8 items-center">
      {/* Profile Image */}
      <div className="flex justify-center">
        <div className="relative">
          <img
            src={profileImageBase64}
            alt="Igbinedion Eghosa Bruce"
            className="w-64 h-64 object-cover rounded-full shadow-xl border-4 border-white ring-4 ring-purple-400 ring-opacity-50"
          />
          <div className="absolute inset-0 w-64 h-64 rounded-full bg-gradient-to-br from-purple-400/20 via-pink-400/20 to-yellow-400/20 ring-2 ring-purple-300 ring-opacity-30"></div>
        </div>
      </div>
      
      {/* About Content */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-800">Hi, I'm Igbinedion Eghosa Bruce!</h3>
        
        <p className="text-gray-600 leading-relaxed">
          I'm a passionate full-stack developer who loves creating interactive web experiences. 
          This gaming platform showcases my skills in modern web development, mobile app development and game development, combining a 
          sleek React frontend with a powerful Node.js backend. 
        </p>
        
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-purple-600">🚀 Tech Stack:</h4>
          <div className="flex flex-wrap gap-2">
            {["React", "Node.js", "Express", "MongoDB", "Socket.io", "JavaScript", "Tailwind CSS"].map((tech, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
        
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-purple-600">✨ Features Built:</h4>
          <ul className="text-gray-600 space-y-1">
            <li>• Real-time chat system with Socket.io</li>
            <li>• User authentication & registration</li>
            <li>• Responsive game catalog with search</li>
            <li>• MongoDB database integration</li>
            <li>• Modern, interactive UI design</li>
          </ul>
        </div>
        
        <div className="pt-4">
          <p className="text-gray-600 italic">
            "Building the future, one line of code at a time." 💻
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
</div>
  );
}

export default Home;