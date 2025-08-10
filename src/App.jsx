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

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage = { sender: "user", text: input };

    // Auto-rename chat on first message
    if (activeChat.messages.length === 0) {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === activeChatId
            ? {
                ...chat,
                title:
                  input.slice(0, 20) + (input.length > 20 ? "..." : "")
              }
            : chat
        )
      );
    }

    updateChatMessages([...activeChat.messages, newMessage]);
    setInput("");
    setIsTyping(true);

    // Simulated bot response
    setTimeout(() => {
      updateChatMessages([
        ...activeChat.messages,
        newMessage,
        { sender: "bot", text: "This is a bot response to: " + input }
      ]);
      setIsTyping(false);
    }, 1000);
  };

  const updateChatMessages = (newMessages) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === activeChatId ? { ...chat, messages: newMessages } : chat
      )
    );
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
          <span className="eva-title">EVA AI</span>
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
