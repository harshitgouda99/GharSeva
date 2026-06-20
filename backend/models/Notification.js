const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

notificationSchema.post('save', async function(doc) {
  try {
    const User = mongoose.model('User');
    const user = await User.findById(doc.userId);
    if (user && user.email) {
      const { sendNotificationEmail } = require('../utils/emailService');
      await sendNotificationEmail(user.email, doc.title, doc.message);
    }
  } catch (error) {
    console.error('Error sending notification email:', error);
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
