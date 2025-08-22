import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register({ setIsLoggedIn }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Use the correct API URL (should match your other components)
  const API_URL = "https://ocelotcubs.onrender.com";

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('=== REGISTRATION ATTEMPT ===');
    console.log('Username:', username);
    console.log('Email:', email);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        credentials: 'include', // Include cookies for session management
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();
      console.log('Registration response:', data);

      if (res.ok) {
        console.log('✅ Registration successful');
        
        // FIXED: Use sessionStorage instead of localStorage to match App.js and Navbar
        console.log('Setting session data...');
        
        // Clear any old session data first
        sessionStorage.clear();
        localStorage.clear();
        
        // Set session data (same pattern as login)
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("isLoggedIn", "true");
        
        // Store user data
        if (data.user) {
          sessionStorage.setItem("user", JSON.stringify(data.user));
          sessionStorage.setItem("userId", data.user.id || data.user._id);
        }
        
        // Create session data object (matching your login pattern)
        const sessionData = {
          userId: data.user?.id || data.user?._id,
          username: data.user?.username || username,
          email: data.user?.email || email,
          loginTime: new Date().toISOString(),
          lastActivity: new Date().toISOString()
        };
        sessionStorage.setItem('sessionData', JSON.stringify(sessionData));

        console.log('=== POST-REGISTRATION SESSION CHECK ===');
        console.log('sessionStorage isLoggedIn:', sessionStorage.getItem('isLoggedIn'));
        console.log('sessionStorage token:', sessionStorage.getItem('token'));
        console.log('sessionStorage user:', sessionStorage.getItem('user'));

        // Update parent state
        console.log('📝 Updating parent isLoggedIn state to true');
        setIsLoggedIn(true);

        console.log('🏠 Redirecting to home page');
        // Redirect home
        navigate("/");
      } else {
        console.error('❌ Registration failed:', data.error);
        alert(data.error || "Registration failed");
      }
    } catch (err) {
      console.error('❌ Registration error:', err);
      alert("An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <form
        onSubmit={handleRegister}
        className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-white text-center">
          Register
        </h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={isLoading}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={isLoading}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={isLoading}
        />

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full text-white p-2 rounded transition-colors ${
            isLoading 
              ? 'bg-gray-500 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}