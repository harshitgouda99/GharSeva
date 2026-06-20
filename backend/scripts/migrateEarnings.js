require('dotenv').config();
const mongoose = require('mongoose');
const Earning = require('../models/Earning');

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gharseva');
    console.log('Connected to DB');

    // Find earnings missing split fields (either not set or zero)
    const earnings = await Earning.find({ $or: [{ providerAmount: { $exists: false } }, { adminAmount: { $exists: false } }, { providerAmount: 0 }, { adminAmount: 0 }] });
    console.log(`Found ${earnings.length} earnings to migrate`);

    const bulkOps = earnings.map(e => {
      const providerAmt = parseFloat((e.amount * 0.95).toFixed(2));
      const adminAmt = parseFloat((e.amount * 0.05).toFixed(2));
      return {
        updateOne: {
          filter: { _id: e._id },
          update: { providerAmount: providerAmt, adminAmount: adminAmt }
        }
      };
    });

    if (bulkOps.length) {
      const result = await Earning.bulkWrite(bulkOps);
      console.log('Migration result:', result);
    }

    console.log('Migration completed');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
};

migrate();
