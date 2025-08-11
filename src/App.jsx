//app.jsx
import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [chats, setChats] = useState([
    { id: Date.now(), title: "New Chat", messages: [] }
  ]);
  const [activeChatId, setActiveChatId] = useState(chats[0].id);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [darkMode, setDarkMode] = useState(false); // DARK MODE STATE
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const activeChat = chats.find((chat) => chat.id === activeChatId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages]);

  // Apply theme to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
      document.body.classList.remove("light-mode");
    } else {
      document.body.classList.add("light-mode");
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? prev + " " + transcript : transcript));
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    } else {
      alert("Speech recognition not supported in this browser.");
    }
  };

  // updateChatMessages now supports functional updates to avoid stale closures
  const updateChatMessages = (updater) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === activeChatId
          ? {
              ...chat,
              messages:
                typeof updater === "function" ? updater(chat.messages) : updater,
            }
          : chat
      )
    );
  };

  // ==== sendMessage now calls your backend API instead of calling Gemini in the browser ====
  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    const userMessage = { sender: "user", text };

    // Auto-rename chat on first message (functional update)
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === activeChatId
          ? {
              ...chat,
              title:
                chat.messages.length === 0
                  ? text.slice(0, 20) + (text.length > 20 ? "..." : "")
                  : chat.title,
            }
          : chat
      )
    );

    // Append user's message immediately
    updateChatMessages((prev) => [...prev, userMessage]);

    setInput("");
    setIsTyping(true);

    try {
      // POST to your server endpoint which calls Gemini server-side
      // If your server runs on another host/port change the URL accordingly.
      const res = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          // you could pass conversation history here if you want server side continuity
        }),
      });

      if (!res.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await res.json();
      const botText = data.text || "Sorry, I didn't get a response.";

      updateChatMessages((prev) => [...prev, { sender: "bot", text: botText }]);
    } catch (error) {
      console.error("Error contacting backend:", error);
      updateChatMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, I am unable to respond at the moment." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const startNewChat = () => {
    const newChat = { id: Date.now(), title: "New Chat", messages: [] };
    setChats((prev) => [...prev, newChat]);
    setActiveChatId(newChat.id);
  };

  const selectChat = (id) => {
    setActiveChatId(id);
  };

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">Chats</div>
        <div
          className="chat-item"
          style={{ fontWeight: "bold", color: "#10a37f" }}
          onClick={startNewChat}
        >
          + New Chat
        </div>
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`chat-item ${
              chat.id === activeChatId ? "active-chat" : ""
            }`}
            onClick={() => selectChat(chat.id)}
          >
            {chat.title}
          </div>
        ))}

        {/* Dark Mode Switch */}
        <div className="dark-mode-toggle">
          <label className="switch">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
            <span className="slider round"></span>
          </label>
          <span>{darkMode ? "Dark Mode" : "Light Mode"}</span>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="main-chat">
        <header className="glass-header">
          <span className="eva-title">Project EVA</span>
        </header>

        <div className="messages-area">
          {activeChat?.messages.map((msg, idx) => (
            <div
              key={idx}
              className={msg.sender === "user" ? "message-user" : "message-bot"}
            >
              {msg.text}
            </div>
          ))}
          {isTyping && (
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area with Mic */}
        <div className="input-area">
          <button
            className={`mic-btn ${isListening ? "listening" : ""}`}
            onClick={startListening}
            title="Click to speak"
          >
            🎤
          </button>
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button className="send-btn" onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
