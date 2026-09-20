const mongoose = require('mongoose');
const Slider = require('../models/Slider');
require('dotenv').config();

const seedSliders = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sarkari-spark');
    console.log('Connected to MongoDB');

    const existingCount = await Slider.countDocuments();
    console.log(`Current sliders in database: ${existingCount}. Sliders are managed via Admin panel.`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding sliders:', error);
    process.exit(1);
  }
};

seedSliders();
