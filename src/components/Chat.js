import React, { useState, useEffect, useRef } from "react";

import { io } from "socket.io-client";   

// connect directly
const socket = io("https://ocelotcubs.onrender.com", {
  transports: ["websocket"],
});

function Chat() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    // Listen for messages from server
    socket.on("receiveMessage", (data) => {
      console.log("Received message:", data); // Debug log
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off("receiveMessage");
  }, []);

  const handleSetUsername = () => {
    if (username.trim()) {
      setIsUsernameSet(true);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const chatData = {
      username: username,
      message: message,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    console.log("Sending message:", chatData); // Debug log
    socket.emit("sendMessage", chatData);
    setMessage("");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto", background: "#ffffffaa", borderRadius: "15px", boxShadow: "0px 4px 20px rgba(255,255,255,0.5)" }}>
      <h2 style={{ textAlign: "center", color: "#333", fontWeight: "bold", textShadow: "0px 0px 5px rgba(255,255,255,0.8)" }}>💬 Chat Room</h2>

      {!isUsernameSet ? (
        <div style={{ marginBottom: "15px" }}>
          <input
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #ccc"
            }}
          />
          <button
            onClick={handleSetUsername}
            style={{
              marginTop: "10px",
              padding: "10px",
              width: "100%",
              background: "linear-gradient(90deg, #ffffff, #e6e6e6)",
              color: "#333",
              border: "none",
              borderRadius: "10px",
              boxShadow: "0px 0px 8px rgba(255,255,255,0.6)",
              fontWeight: "bold"
            }}
          >
            Join Chat
          </button>
        </div>
      ) : (
        <>
          <div
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              height: "300px",
              overflowY: "auto",
              padding: "10px",
              background: "linear-gradient(180deg, #ffffff, #f0f0f0)",
              boxShadow: "inset 0px 0px 10px rgba(255,255,255,0.3)"
            }}
          >
            {messages.length === 0 ? (
              <p style={{ textAlign: "center", color: "#666", fontStyle: "italic" }}>
                No messages yet. Start the conversation!
              </p>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    textAlign: msg.username === username ? "right" : "left",
                    margin: "5px 0"
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      background: msg.username === username ? "#d1e7ff" : "#f5f5f5",
                      color: "#333",
                      padding: "8px 12px",
                      borderRadius: "15px",
                      maxWidth: "70%",
                      boxShadow: "0px 0px 5px rgba(255,255,255,0.4)"
                    }}
                  >
                    <strong>{msg.username}</strong>
                    <p style={{ margin: "5px 0" }}>{msg.message}</p>
                    <small style={{ fontSize: "10px", opacity: 0.8 }}>
                      {msg.timestamp}
                    </small>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef}></div>
          </div>

          <form
            onSubmit={sendMessage}
            style={{ marginTop: "10px", display: "flex", gap: "10px" }}
          >
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "10px",
                border: "1px solid #ccc"
              }}
            />
            <button
              type="submit"
              style={{
                padding: "10px 15px",
                background: "linear-gradient(90deg, #ffffff, #e6e6e6)",
                border: "none",
                borderRadius: "10px",
                fontWeight: "bold",
                boxShadow: "0px 0px 8px rgba(255,255,255,0.6)"
              }}
            >
              Send
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default Chat;