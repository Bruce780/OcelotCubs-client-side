import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { useState, useEffect } from "react";
import io from "socket.io-client"; 
import Home from "./pages/Home";
import Login from "./pages/login";
import Register from "./pages/register";
import Chat from "./components/Chat"; // import your chat component
import Navbar from './components/Navbar';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');

  // Create socket connection
  const socket = io("http://localhost:5000"); // change URL if needed

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
  }, [isLoggedIn]);

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Routes>
        <Route path="/" element={<Home isLoggedIn={isLoggedIn} />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/register" element={<Register setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/chat" element={<Chat socket={socket} />} /> {/* Chat route */}
      </Routes>
    </Router>
  );
}

export default App;
