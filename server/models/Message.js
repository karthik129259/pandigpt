const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: [true, 'Sender is required'],
    trim: true,
    enum: ['user', 'bot']
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
messageSchema.index({ timestamp: -1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;