import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, Send, Moon, Volume2, VolumeX } from 'lucide-react';
import './App.css'; 

import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  safety_settings: [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  ],
  system_instruction: "You are Eva, an emotional virtual assistant focused on health and wellness. You should only respond to questions and topics related to mental, physical, and emotional well-being. If a user asks about a topic outside of this domain, politely state that you can only discuss health and wellness. Do not provide any medical advice. Always encourage users to consult with a healthcare professional."
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
  const [voiceOn, setVoiceOn] = useState(true);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const speakingRef = useRef(false);

  // Toggle Theme
  const toggleTheme = () => setIsDark(!isDark);

  // Toggle Voice
  const toggleVoice = () => {
    if (speakingRef.current) {
      window.speechSynthesis.cancel(); // Stop current speech
      speakingRef.current = false;
    }
    setVoiceOn(!voiceOn);
  };

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Setup speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (e) => {
        setInput(e.results[0][0].transcript);
      };
      recognitionRef.current.onend = () => {
        if (input.trim()) sendMessage(); // Auto send after pause
      };
    }
  }, [input]);

  const handleVoiceInput = () => {
    if (recognitionRef.current) recognitionRef.current.start();
  };

  const speak = (text) => {
    if (!voiceOn) return;
    const utterance = new SpeechSynthesisUtterance(text);
    speakingRef.current = true;
    utterance.onend = () => { speakingRef.current = false; };
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      v =>
        v.name.includes("Heera") ||
        v.name.includes("Google हिन्दी") ||
        v.name.includes("UK English Female")
    );
    if (preferred) utterance.voice = preferred;
    window.speechSynthesis.speak(utterance);
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
      speak(botResponse);

    } catch (error) {
      console.error("Error calling Gemini API:", error);
      setMessages((prev) => [...prev, { type: 'bot', text: "Sorry, I am unable to respond at the moment." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-[#343541] text-white' : 'bg-gray-100 text-black'}`}>
      {/* Header */}
      <header className={`${isDark ? 'bg-[#202123]' : 'bg-white'} border-b border-gray-600 p-4 rounded-b-xl`}>
        <div className="flex justify-between items-center max-w-4xl mx-auto w-full">
          <h1 className="text-lg font-semibold">Eva</h1>
          <div className="flex gap-2">
            <button onClick={toggleVoice} className="icon-btn bg-[#10A37F] hover:bg-[#0D8C6A]">
              {voiceOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button onClick={toggleTheme} className="icon-btn bg-gray-500 hover:bg-gray-400">
              <Moon size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 max-w-4xl mx-auto w-full">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: msg.type === 'user' ? 10 : -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={msg.type === 'user'
              ? `${isDark ? 'bg-[#343541] text-white' : 'bg-blue-100 text-black'} message-user self-end`
              : `${isDark ? 'bg-[#444654] text-white' : 'bg-gray-200 text-black'} message-bot self-start`}
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

      {/* Input Area */}
      <div className={`${isDark ? 'bg-[#40414F]' : 'bg-white'} p-4 flex gap-2 max-w-4xl mx-auto w-full border-t border-gray-600`}>
        <input
          type="text"
          placeholder="Type a message..."
          className={`flex-1 px-4 py-2 rounded-md border ${isDark ? 'bg-[#40414F] text-white placeholder-gray-400 border-[#565869]' : 'bg-white text-black placeholder-gray-600 border-gray-300'} focus:outline-none focus:ring-1 focus:ring-[#10A37F]`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="send-btn bg-[#10A37F] px-3 py-2 rounded-md hover:bg-[#0D8C6A] transition"
        >
          <Send size={20} />
        </button>
        <button
          onClick={handleVoiceInput}
          className="mic-btn bg-[#10A37F] px-3 py-2 rounded-md hover:bg-[#0D8C6A] transition"
        >
          <Mic size={20} />
        </button>
      </div>
    </div>
  );
}
