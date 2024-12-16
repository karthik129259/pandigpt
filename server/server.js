const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['POST'],
  credentials: true
}));

app.use(express.json());

// Gemini AI Configuration
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Message Schema
const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);

// POST endpoint only
app.post('/api/message', async (req, res) => {
  const { message, sender } = req.body;

  if (!message || !sender) {
    return res.status(400).json({ error: 'Message and sender are required' });
  }

  try {
    // Save user message
    const userMessage = new Message({ sender, content: message });
    await userMessage.save();

    // Get Gemini response
    const result = await model.generateContent(message);
    const botReply = result.response.text();

    // Save bot message
    const botMessage = new Message({
      sender: 'bot',
      content: botReply
    });
    await botMessage.save();

    return res.json({ botReply });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      error: 'Failed to process request',
      details: error.message
    });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));