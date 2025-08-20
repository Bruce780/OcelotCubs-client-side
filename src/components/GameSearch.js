import React, { useState, useEffect } from 'react';
import axios from 'axios';


const GameSearch = () => {
  const [query, setQuery] = useState('');
  const [games, setGames] = useState([]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/games?search=${query}`);
        setGames(res.data);
      } catch (err) {
        console.error('Error fetching games:', err);
      }
    };

    fetchGames();
  }, [query]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white font-sans">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-10 tracking-tight text-blue-400">
          🎮 Ocelot Cubs
        </h1>

        <div className="flex justify-center mb-10">
          <input
            type="text"
            placeholder="Search for a game..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full max-w-xl px-4 py-3 rounded-xl border border-gray-700 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {games.map((game) => (
            <div
              key={game._id}
              className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow border border-gray-700"
            >
              {game.image && (
                <img
                  src={game.image}
                  alt={game.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-5">
                <h2 className="text-xl font-semibold mb-2 text-blue-300">{game.title}</h2>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {game.description}
                </p>
                <a
                  href={game.downloadLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>

        {games.length === 0 && (
          <p className="text-center text-gray-500 mt-20">No games found. Try a different search term.</p>
        )}
      </div>
    </div>
  );
};

export default GameSearch;
