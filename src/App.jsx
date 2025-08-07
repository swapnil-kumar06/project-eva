import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, Send, Moon } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hello! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isDark, setIsDark] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const recognitionRef = useRef(null);

  // Toggle theme
  const toggleTheme = () => setIsDark(!isDark);

  // Voice recognition setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (e) => {
        setInput(e.results[0][0].transcript);
      };
    }
  }, []);

  const handleVoiceInput = () => {
    if (recognitionRef.current) recognitionRef.current.start();
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { type: 'user', text: input }];
    setMessages(newMessages);
    setInput('');

    // Bot is typing simulation
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { type: 'bot', text: 'This is a bot response.' }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className={`min-h-screen px-4 flex items-center justify-center transition-all duration-300 ${
      isDark
        ? 'bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]'
        : 'bg-gradient-to-br from-white to-gray-100'
    }`}>
      <div className="w-full max-w-2xl backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6 space-y-4">
        {/* Header */}
        <header className="glass-header text-center text-white mb-2">
          <div className="flex justify-between items-center">
            <h1 className="eva-title">Eva 👩‍💻</h1>
            <button onClick={toggleTheme} className="text-white bg-white/10 p-2 rounded-full hover:bg-white/20">
              <Moon size={18} />
            </button>
          </div>
          <p className="eva-subtitle">(Emotional Virtual Assistant)</p>
        </header>

        {/* Chat Messages */}
        <div className="h-80 overflow-y-auto space-y-2 pr-1">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: msg.type === 'user' ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className={`max-w-xs p-3 rounded-lg text-sm ${
                msg.type === 'user'
                  ? 'ml-auto bg-blue-500 text-white'
                  : 'mr-auto bg-white/20 text-white backdrop-blur-md'
              }`}
            >
              {msg.text}
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-white text-sm italic"
            >
              Eva is typing...
            </motion.div>
          )}
        </div>

        {/* Input Section */}
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-full bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition"
          >
            <Send size={20} />
          </button>
          <button
            onClick={handleVoiceInput}
            className="bg-white/20 text-white p-2 rounded-full hover:bg-white/30 transition"
          >
            <Mic size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
