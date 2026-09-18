const mongoose = require('mongoose');
const Slider = require('../models/Slider');
require('dotenv').config();

const seedSliders = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sarkari-spark');
    console.log('Connected to MongoDB');

    const existingCount = await Slider.countDocuments();
    if (existingCount === 0) {
      const defaultSliders = [
        {
          title: "UP Police Constable 2026 Special Batch",
          subtitle: "60,000+ Vacancies • 25 Full Length Mock Tests with All India Rank",
          image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1200&auto=format&fit=crop",
          redirectUrl: "/exams",
          order: 1,
          isActive: true
        },
        {
          title: "SSC CGL 2026 Tier-1 Mega Mock Series",
          subtitle: "Exact TCS Exam Pattern • Real Timer & Negative Marking Simulation",
          image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1200&auto=format&fit=crop",
          redirectUrl: "/exams",
          order: 2,
          isActive: true
        },
        {
          title: "Railway RRB NTPC & Group D Test Series",
          subtitle: "Previous 10 Years Solved Papers (PYQs) • 100% Bilingual in Hindi & English",
          image: "https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=1200&auto=format&fit=crop",
          redirectUrl: "/exams",
          order: 3,
          isActive: true
        }
      ];

      await Slider.insertMany(defaultSliders);
      console.log('3 Initial Sliders seeded successfully into MongoDB!');
    } else {
      console.log(`Sliders already exist in database (${existingCount} sliders).`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding sliders:', error);
    process.exit(1);
  }
};

seedSliders();
