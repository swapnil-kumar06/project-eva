// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Check API key
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("❌ Please set GEMINI_API_KEY in your .env file.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Create Gemini model
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  safety_settings: [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  ],
  system_instruction:
    "You are Eva, an emotional virtual assistant focused on health and wellness. Only respond to topics related to mental, physical, and emotional well-being. Politely refuse unrelated topics. Do not give medical advice. Always encourage users to consult healthcare professionals.",
});

// Test route
app.get("/", (req, res) => {
  res.send("✅ Eva Backend is running!");
});

// Chat route
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: "Hello! You are Eva, an AI-based emotional virtual assistant." }] },
        { role: "model", parts: [{ text: "Hello! How can I help you today?" }] },
        { role: "user", parts: [{ text: message }] },
      ],
      generation_config: { max_output_tokens: 300 },
    });

    const result = await chat.sendMessage(message);
    const text = await result.response.text();

    res.json({ text });
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
