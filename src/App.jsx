import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, Send, Moon } from 'lucide-react';
import './App.css'; 

import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

const API_KEY = "AIzaSyBLpR_m4ZkIOMOX3j5IVeQ5mzDJb6FTD_k";

const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  safety_settings: [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  ],
  
  // Add the system instruction here
  system_instruction: "You are Eva, an emotional virtual assistant focused on health and wellness. You should only respond to questions and topics related to mental, physical, and emotional well-being. If a user asks about a topic outside of this domain, politely state that you can only discuss health and wellness. Do not provide any medical advice. Always encourage users to consult with a healthcare professional.",
});

const chat = model.startChat({
  history: [
    { role: "user", parts: [{ text: "Hello! You are Eva, an AI-based emotional virtual assistant." }] },
    { role: "model", parts: [{ text: "Hello! How can I help you today?" }] },
  ],
  generation_config: {
    max_output_tokens: 100,
  },
});


export default function App() {
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hello! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isDark, setIsDark] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const recognitionRef = useRef(null);

  const toggleTheme = () => setIsDark(!isDark);

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

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newUserMessages = [...messages, { type: 'user', text: input }];
    setMessages(newUserMessages);
    setInput('');
    setIsTyping(true);

    try {
      const result = await chat.sendMessage(input);
      const botResponse = await result.response.text();

      setMessages((prev) => [...prev, { type: 'bot', text: botResponse }]);

    } catch (error) {
      console.error("Error calling Gemini API:", error);
      setMessages((prev) => [...prev, { type: 'bot', text: "Sorry, I am unable to respond at the moment." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`min-h-screen px-4 flex items-center justify-center transition-all duration-300 ${
      isDark
        ? 'bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]'
        : 'bg-gradient-to-br from-white to-gray-100'
    }`}>
      <div className="w-full max-w-2xl backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6 space-y-4">
        <header className="glass-header text-center text-white mb-2">
          <div className="flex justify-between items-center">
            <h1 className="eva-title">Eva 👩‍💻</h1>
            <button onClick={toggleTheme} className="text-white bg-white/10 p-2 rounded-full hover:bg-white/20">
              <Moon size={18} />
            </button>
          </div>
          <p className="eva-subtitle">(Emotional Virtual Assistant)</p>
        </header>

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