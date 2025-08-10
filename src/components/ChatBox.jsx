import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic } from 'lucide-react';

function ChatBox({ isDark, onSend, onVoiceInput }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { user: true, text: input }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [...prev, { user: false, text: 'Bot reply' }]);
      setIsTyping(false);
    }, 1000);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col flex-1">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: msg.user ? 10 : -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`max-w-xs p-3 rounded-lg text-sm ${
              msg.user
                ? isDark
                  ? 'bg-[#343541] text-white self-end'
                  : 'bg-blue-100 text-black self-end'
                : isDark
                ? 'bg-[#444654] text-white self-start'
                : 'bg-gray-200 text-black self-start'
            }`}
          >
            {msg.text}
          </motion.div>
        ))}

        {isTyping && (
          <div className="typing-indicator self-start">
            <span></span><span></span><span></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`${isDark ? 'bg-[#40414F]' : 'bg-white'} p-4 flex gap-2 border-t border-gray-600`}>
        <input
          type="text"
          placeholder="Type a message..."
          className={`flex-1 px-4 py-2 rounded-md border ${
            isDark
              ? 'bg-[#40414F] text-white placeholder-gray-400 border-[#565869]'
              : 'bg-white text-black placeholder-gray-600 border-gray-300'
          } focus:outline-none focus:ring-1 focus:ring-[#10A37F]`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-[#10A37F] text-white px-3 py-2 rounded-md hover:bg-[#0D8C6A] transition"
        >
          <Send size={20} />
        </button>
        <button
          onClick={onVoiceInput}
          className="bg-[#10A37F] text-white px-3 py-2 rounded-md hover:bg-[#0D8C6A] transition"
        >
          <Mic size={20} />
        </button>
      </div>
    </div>
  );
}

export default ChatBox;
