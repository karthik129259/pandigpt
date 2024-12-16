const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// POST a new message
router.post('/', async (req, res) => {
  const { sender, content } = req.body;

  // Validate input
  if (!sender || !content) {
    return res.status(400).json({ message: 'Sender and content are required.' });
  }

  try {
    // Get Gemini AI response
    const result = await model.generateContent(content);
    const botReply = result.response.text();

    // Send bot reply back to client
    res.json({ botReply });
  } catch (err) {
    console.error('Error interacting with Gemini AI:', err.message);

    // Handle specific error responses
    if (err.response) {
      const { status, data } = err.response;
      if (status === 401) {
        return res.status(401).json({ message: 'Unauthorized: Invalid API key.' });
      } else if (status === 429) {
        return res.status(429).json({ message: 'Rate limit exceeded. Try again later.' });
      }
      return res.status(status).json({ message: data.message || 'API error occurred.' });
    }

    // Generic error response
    res.status(500).json({ message: 'Internal server error. Please try again.' });
  }
});

module.exports = router;