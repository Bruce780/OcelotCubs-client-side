import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login({ setIsLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Step 1: Authenticate with your existing login endpoint
      const loginRes = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      }, {
        withCredentials: true // Important: Include cookies for session
      });

      console.log('Login response:', loginRes.data);

      // Step 2: Create server session
      // Extract user data from login response (adjust based on your auth endpoint response)
      const userData = loginRes.data.user || loginRes.data;
      const userId = userData.id || userData._id || userData.userId;
      const username = userData.username || userData.name || userData.email?.split('@')[0] || 'Unknown';

      console.log('Extracted user data for session:', { userId, username, fullUserData: userData });

      const sessionRes = await axios.post(`${API_URL}/api/create-session`, {
        userId: userId,
        username: username
      }, {
        withCredentials: true // Important: Include cookies for session
      });

      console.log('Session creation response:', sessionRes.data);

      // Step 3: Store session data in sessionStorage (cleared on tab close)
      const sessionData = {
        user: loginRes.data.user || loginRes.data,
        token: loginRes.data.token,
        sessionId: sessionRes.data.sessionId,
        loginTime: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };

      // Use sessionStorage instead of localStorage for immediate logout on tab close
      sessionStorage.setItem("user", JSON.stringify(sessionData.user));
      sessionStorage.setItem("token", sessionData.token);
      sessionStorage.setItem("sessionData", JSON.stringify(sessionData));
      sessionStorage.setItem("isLoggedIn", "true");

      // Clear any old localStorage data to prevent conflicts
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("isLoggedIn");

      // Step 4: Update app state
      setIsLoggedIn(true);

      // Step 5: Success message and redirect
      console.log('Login successful, redirecting to home...');
      navigate("/");

    } catch (err) {
      console.error('Login error:', err);
      
      // Clear any partial session data on error
      sessionStorage.clear();
      
      // Handle different error scenarios
      if (err.response?.status === 401) {
        setError("Invalid email or password");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message.includes('Network')) {
        setError("Network error. Please check your connection.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form
        onSubmit={handleLogin}
        className="bg-gray-800 p-6 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-4">Login</h2>

        {error && (
          <div className="bg-red-600 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-4 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />

        <button
          type="submit"
          className={`w-full py-2 rounded font-bold transition-colors ${
            loading 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <div className="mt-4 text-sm text-gray-400">
          <p className="mb-2">Session Management Active:</p>
          <ul className="text-xs">
            <li>• Automatic logout when tab closes</li>
            <li>• Automatic logout when switching tabs</li>
            <li>• Session expires after 30 minutes</li>
          </ul>
        </div>
      </form>
    </div>
  );
}

export default Login;