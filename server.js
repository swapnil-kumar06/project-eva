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
dotenv.config();


const app = express();
app.use(cors());
app.use(bodyParser.json());

const API_KEY = process.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Please set GEMINI_API_KEY in your environment.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  safety_settings: [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  ],
  system_instruction:
    "You are Eva, an emotional virtual assistant focused on health and wellness. You should only respond to questions and topics related to mental, physical, and emotional well-being. If a user asks about a topic outside of this domain, politely state that you can only discuss health and wellness. Do not provide any medical advice. Always encourage users to consult with a healthcare professional.",
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "No message provided" });

    // Create a chat instance (you could persist per-user if you want conversation continuity)
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

    return res.json({ text });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
